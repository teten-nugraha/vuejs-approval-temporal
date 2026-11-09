<template>
  <div class="max-w-2xl mx-auto space-y-6">
    <div class="flex items-center gap-3">
      <router-link to="/" class="text-sm text-slate-500 hover:text-slate-800">&larr; Batal</router-link>
      <h1 class="text-2xl font-bold text-slate-900">Perbarui Pengajuan #{{ orderId }}</h1>
    </div>

    <div class="p-4 bg-amber-50 border-l-4 border-amber-500 text-amber-900 rounded-r-lg text-xs leading-relaxed">
      <strong>Catatan Workflow:</strong> Workflow yang sedang aktif dikelola oleh Temporal. Jika ingin melakukan perubahan nominal besar, disarankan membatalkan pengajuan dan membuat baru.
    </div>

    <div class="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
      <div>
        <label class="block text-xs font-bold text-slate-500 uppercase mb-1">ID Order</label>
        <input :value="orderId" disabled class="w-full bg-slate-100 border border-slate-300 rounded-lg p-2.5 text-sm text-slate-500 font-mono">
      </div>

      <div>
        <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Catatan Tambahan Pemohon</label>
        <textarea rows="3" v-model="notes" class="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500"></textarea>
      </div>

      <div class="flex justify-end gap-3 pt-2">
        <router-link to="/" class="px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold hover:bg-slate-50">Tutup</router-link>
        <button @click="save" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow">Simpan Catatan</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const orderId = route.params.id
const notes = ref('Revisi spesifikasi kelengkapan.')

function save() {
  alert('Catatan berhasil diperbarui.')
  router.push('/')
}
</script>