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
        <label class="block text-xs font-bold uppercase text-slate-500 mb-1">Pemohon (Requester Pertama)</label>
        <input :value="currentUser.name + ' (' + currentUser.role + ')'" disabled class="w-full bg-slate-100 border border-slate-300 rounded-lg p-2.5 text-sm text-slate-600">
      </div>

      <!-- Tipe Pengajuan -->
      <div>
        <label class="block text-xs font-bold uppercase text-slate-500 mb-2">Tipe Permohonan</label>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <label class="flex items-center p-3 border rounded-lg cursor-pointer" :class="form.type === 'BUY' ? 'border-blue-600 bg-blue-50/50' : 'border-slate-300'">
            <input type="radio" v-model="form.type" value="BUY" @change="onTypeChange" class="text-blue-600">
            <span class="ml-2 font-semibold text-xs sm:text-sm">BUY Biasa</span>
          </label>

          <label class="flex items-center p-3 border rounded-lg cursor-pointer transition" :class="form.type === 'BUY_LAMBORGHINI' ? 'border-amber-500 bg-amber-50/70 ring-2 ring-amber-300' : 'border-slate-300'">
            <input type="radio" v-model="form.type" value="BUY_LAMBORGHINI" @change="onTypeChange" class="text-amber-600">
            <span class="ml-2 font-bold text-xs sm:text-sm text-amber-900">🏎️ LAMBORGHINI</span>
          </label>

          <label class="flex items-center p-3 border rounded-lg cursor-pointer" :class="form.type === 'IJIN_CUTI' ? 'border-blue-600 bg-blue-50/50' : 'border-slate-300'">
            <input type="radio" v-model="form.type" value="IJIN_CUTI" @change="onTypeChange" class="text-blue-600">
            <span class="ml-2 font-semibold text-xs sm:text-sm">Ijin Cuti</span>
          </label>
        </div>
      </div>

      <!-- Input Nilai / Nominal -->
      <div v-if="form.type === 'BUY' || form.type === 'BUY_LAMBORGHINI'">
        <label class="block text-xs font-bold uppercase text-slate-500 mb-1">Nominal Pembelian (Rp)</label>
        <input
          type="number"
          v-model.number="form.amount"
          :readonly="form.type === 'BUY_LAMBORGHINI'"
          required
          class="w-full border border-slate-300 rounded-lg p-2.5 text-sm font-mono font-bold text-slate-800 focus:ring-2 focus:ring-blue-500"
          :class="form.type === 'BUY_LAMBORGHINI' ? 'bg-amber-50 border-amber-300 text-amber-900 text-base' : ''"
        >
        <span v-if="form.type === 'BUY_LAMBORGHINI'" class="text-xs text-amber-700 font-semibold mt-1 block">
          ⭐ Nilai otomatis ditetapkan: Rp 1.000.000.000 (1 Miliar Rupiah)
        </span>
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
      <div class="p-4 rounded-xl border" :class="form.type === 'BUY_LAMBORGHINI' ? 'bg-amber-50/70 border-amber-300' : 'bg-slate-50 border-slate-200'">
        <span class="text-xs font-bold uppercase block mb-1" :class="form.type === 'BUY_LAMBORGHINI' ? 'text-amber-800' : 'text-slate-500'">
          Prediksi Alur Workflow:
        </span>
        <div class="text-xs space-y-1">
          <div class="font-bold text-slate-800">
            <strong>Parent Workflow:</strong>
            <span v-if="form.type === 'BUY_LAMBORGHINI'">
              <span class="bg-white px-2 py-0.5 rounded border ml-1 font-mono">1. FINANCE</span> ➔
              <span class="bg-white px-2 py-0.5 rounded border font-mono">2. CEO</span>
            </span>
            <span v-else-if="form.type === 'BUY'">
              {{ calculatedChain.length ? calculatedChain.join(' ➔ ') : 'Auto Approved' }}
            </span>
            <span v-else>
              {{ form.days > 2 ? 'MANAGER' : 'Auto Approved' }}
            </span>
          </div>

          <div v-if="form.type === 'BUY_LAMBORGHINI'" class="text-amber-900 font-bold pt-1">
            ⚡ <strong>Child Workflow:</strong> Wajib Disetujui oleh <strong>2 Direktur Berbeda</strong> sebelum Parent dinyatakan selesai!
          </div>
        </div>
      </div>

      <div class="flex justify-end gap-3 pt-3">
        <router-link to="/" class="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50">Batal</router-link>
        <button type="submit" :disabled="submitting" class="px-5 py-2 text-white rounded-lg text-sm font-semibold shadow transition disabled:opacity-50"
          :class="form.type === 'BUY_LAMBORGHINI' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'">
          {{ submitting ? 'Memproses ke Temporal...' : 'Kirim Pengajuan' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api'

const props = defineProps({ currentUser: { type: Object, required: true } })
const router = useRouter()
const submitting = ref(false)

const form = reactive({
  orderId: 'ORD-' + Math.floor(100 + Math.random() * 900),
  type: 'BUY_LAMBORGHINI',
  amount: 1000000000,
  days: 1,
  notes: 'Pengadaan unit Lamborghini Revuelto untuk operasional eksekutif.'
})

function onTypeChange() {
  if (form.type === 'BUY_LAMBORGHINI') {
    form.amount = 1000000000
    form.notes = 'Pengadaan unit Lamborghini Revuelto untuk operasional eksekutif.'
  } else if (form.type === 'BUY') {
    form.amount = 5000000
    form.notes = 'Pengadaan perlengkapan kantor.'
  } else {
    form.notes = 'Pengajuan cuti tahunan.'
  }
}

const calculatedChain = computed(() => {
  if (form.type === 'IJIN_CUTI') {
    return form.days > 2 ? ['MANAGER'] : []
  } else if (form.type === 'BUY') {
    const val = form.amount || 0
    if (val <= 1000000) return ['FINANCE']
    if (val <= 10000000) return ['FINANCE', 'DIRECTOR']
    return ['FINANCE', 'DIRECTOR', 'CEO']
  } else {
    return ['FINANCE', 'CEO']
  }
})

async function handleSubmit() {
  submitting.value = true
  try {
    await api.createOrder({
      orderId: form.orderId,
      requesterId: props.currentUser.id, // Menyimpan ID user pemohon
      type: form.type,
      amount: form.type !== 'IJIN_CUTI' ? form.amount : null,
      days: form.type === 'IJIN_CUTI' ? form.days : null,
      notes: form.notes
    })
    router.push('/detail/' + form.orderId)
  } catch (err) {
    alert('Gagal: ' + (err.response?.data?.message || err.message))
  } finally {
    submitting.value = false
  }
}
</script>