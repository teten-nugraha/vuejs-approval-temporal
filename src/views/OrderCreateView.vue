<template>
  <div class="max-w-2xl mx-auto space-y-6">
    <div class="flex items-center gap-3">
      <router-link to="/" class="text-sm text-slate-500 hover:text-slate-800">&larr; Kembali</router-link>
      <h1 class="text-2xl font-bold text-slate-900">Buat Pengajuan Order</h1>
    </div>

    <form @submit.prevent="handleSubmit" class="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-5">
      <div>
        <label class="block text-xs font-bold uppercase text-slate-500 mb-1">ID Order</label>
        <input v-model="form.orderId" readonly class="w-full bg-slate-100 border border-slate-300 rounded-lg p-2.5 text-sm font-mono text-slate-600">
      </div>

      <div>
        <label class="block text-xs font-bold uppercase text-slate-500 mb-1">Pemohon</label>
        <input :value="currentUser.name + ' (' + currentUser.role + ')'" disabled class="w-full bg-slate-100 border border-slate-300 rounded-lg p-2.5 text-sm text-slate-600">
      </div>

      <div>
        <label class="block text-xs font-bold uppercase text-slate-500 mb-2">Tipe Permohonan</label>
        <div class="grid grid-cols-2 gap-4">
          <label class="flex items-center p-3 border rounded-lg cursor-pointer" :class="form.type === 'BUY' ? 'border-blue-600 bg-blue-50/50' : 'border-slate-300'">
            <input type="radio" v-model="form.type" value="BUY" class="text-blue-600">
            <span class="ml-2 font-semibold text-sm">BUY (Pembelian)</span>
          </label>
          <label class="flex items-center p-3 border rounded-lg cursor-pointer" :class="form.type === 'IJIN_CUTI' ? 'border-blue-600 bg-blue-50/50' : 'border-slate-300'">
            <input type="radio" v-model="form.type" value="IJIN_CUTI" class="text-blue-600">
            <span class="ml-2 font-semibold text-sm">Ijin Cuti</span>
          </label>
        </div>
      </div>

      <div v-if="form.type === 'BUY'">
        <label class="block text-xs font-bold uppercase text-slate-500 mb-1">Nominal (Rupiah)</label>
        <input type="number" v-model.number="form.amount" min="1000" max="100000000" required class="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500">
      </div>

      <div v-else>
        <label class="block text-xs font-bold uppercase text-slate-500 mb-1">Jumlah Hari Cuti</label>
        <input type="number" v-model.number="form.days" min="1" max="30" required class="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500">
      </div>

      <div>
        <label class="block text-xs font-bold uppercase text-slate-500 mb-1">Keterangan / Keperluan</label>
        <textarea v-model="form.notes" rows="3" required placeholder="Jelaskan kebutuhan pengajuan..." class="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500"></textarea>
      </div>

      <!-- Live Preview -->
      <div class="bg-slate-50 p-4 rounded-lg border border-slate-200">
        <span class="text-xs font-bold text-slate-500 uppercase block mb-1">Prediksi Alur Persetujuan:</span>
        <div class="flex items-center gap-2 text-xs font-bold text-slate-700">
          <span v-if="calculatedChain.length === 0" class="text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded">
            ⚡ Otomatis Disetujui Sistem
          </span>
          <template v-else>
            <span v-for="(role, idx) in calculatedChain" :key="role" class="flex items-center gap-2">
              <span class="bg-white px-2.5 py-1 border border-slate-300 rounded">{{ idx + 1 }}. {{ role }}</span>
              <span v-if="idx < calculatedChain.length - 1">&rarr;</span>
            </span>
          </template>
        </div>
      </div>

      <div class="flex justify-end gap-3 pt-3">
        <router-link to="/" class="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50">Batal</router-link>
        <button type="submit" :disabled="submitting" class="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow transition disabled:opacity-50">
          {{ submitting ? 'Memproses ke Temporal...' : 'Kirim Pengajuan' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { reactive, computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api'

const props = defineProps({
  currentUser: { type: Object, required: true }
})

const router = useRouter()
const submitting = ref(false)

const form = reactive({
  orderId: 'ORD-' + Math.floor(100 + Math.random() * 900),
  type: 'BUY',
  amount: 5000000,
  days: 1,
  notes: ''
})

const calculatedChain = computed(() => {
  if (form.type === 'IJIN_CUTI') {
    return form.days > 2 ? ['MANAGER'] : []
  } else {
    const val = form.amount || 0
    if (val <= 1000000) return ['FINANCE']
    if (val <= 10000000) return ['FINANCE', 'DIRECTOR']
    if (val <= 100000000) return ['FINANCE', 'DIRECTOR', 'CEO']
    return ['FINANCE', 'DIRECTOR', 'CEO']
  }
})

async function handleSubmit() {
  submitting.value = true
  try {
    await api.createOrder({
      orderId: form.orderId,
      requesterId: props.currentUser.name,
      type: form.type,
      amount: form.type === 'BUY' ? form.amount : null,
      days: form.type === 'IJIN_CUTI' ? form.days : null,
      notes: form.notes
    })
    router.push('/detail/' + form.orderId)
  } catch (err) {
    alert('Gagal membuat pengajuan: ' + (err.response?.data?.message || err.message))
  } finally {
    submitting.value = false
  }
}
</script>