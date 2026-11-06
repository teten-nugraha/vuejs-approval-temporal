<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Daftar Pengajuan Order</h1>
        <p class="text-sm text-slate-500">Data tersinkronisasi real-time dengan Database H2 & Temporal</p>
      </div>
      <div class="flex gap-2">
        <button @click="fetchOrders" class="px-3 py-2 border border-slate-300 text-xs font-semibold rounded-lg hover:bg-slate-100">
          🔄 Refresh
        </button>
        <router-link to="/create" class="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg shadow-sm transition">
          + Buat Pengajuan
        </router-link>
      </div>
    </div>

    <!-- Table Card -->
    <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div v-if="loading" class="p-8 text-center text-sm text-slate-500">
        Memuat data pengajuan dari Database H2...
      </div>
      <div v-else-if="orders.length === 0" class="p-8 text-center text-sm text-slate-500">
        Belum ada pengajuan order. Silakan klik tombol "Buat Pengajuan".
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead class="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-xs font-semibold">
            <tr>
              <th class="px-6 py-4">ID Order</th>
              <th class="px-6 py-4">Tipe & Nilai</th>
              <th class="px-6 py-4">Approval Chain</th>
              <th class="px-6 py-4">Menunggu Role</th>
              <th class="px-6 py-4">Status Pick Me</th>
              <th class="px-6 py-4">Status</th>
              <th class="px-6 py-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="order in orders" :key="order.orderId" class="hover:bg-slate-50 transition">
              <td class="px-6 py-4 font-semibold text-slate-900">#{{ order.orderId }}</td>
              <td class="px-6 py-4">
                <div class="font-medium text-slate-800">
                  <span v-if="order.type === 'BUY'">Rp {{ Number(order.amount).toLocaleString('id-ID') }}</span>
                  <span v-else>{{ order.days }} Hari Cuti</span>
                </div>
                <span class="text-[10px] text-slate-400 font-semibold">{{ order.type }}</span>
              </td>
              <td class="px-6 py-4 text-xs font-mono text-slate-600">
                <span v-if="!order.approvalChain || order.approvalChain.length === 0" class="text-slate-400">Auto Approved</span>
                <span v-else>{{ order.approvalChain.join(' ➔ ') }}</span>
              </td>
              <td class="px-6 py-4">
                <span v-if="order.waitingForRole" class="font-bold text-amber-700 text-xs bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                  {{ order.waitingForRole }}
                </span>
                <span v-else class="text-slate-400 text-xs">—</span>
              </td>
              <!-- Kolom Status Klaim (Pick Me) -->
              <td class="px-6 py-4 text-xs">
                <span v-if="order.claimedByName" class="inline-flex items-center gap-1 font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                  🔒 {{ order.claimedByName }}
                </span>
                <span v-else-if="order.status === 'IN_PROGRESS'" class="inline-flex items-center gap-1 font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded animate-pulse">
                  ✋ Siap di-Pick
                </span>
                <span v-else class="text-slate-400">—</span>
              </td>
              <td class="px-6 py-4">
                <span :class="statusBadge(order.status)" class="px-2.5 py-1 rounded-full text-xs font-semibold border">
                  {{ order.status }}
                </span>
              </td>
              <td class="px-6 py-4 text-center">
                <router-link :to="'/detail/' + order.orderId" class="text-blue-600 hover:text-blue-800 font-bold text-xs">
                  Detail & Review &rarr;
                </router-link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'

const orders = ref([])
const loading = ref(true)

function statusBadge(status) {
  if (status === 'APPROVED') return 'bg-emerald-50 text-emerald-700 border-emerald-200'
  if (status === 'REJECTED') return 'bg-rose-50 text-rose-700 border-rose-200'
  return 'bg-amber-50 text-amber-700 border-amber-200'
}

async function fetchOrders() {
  loading.value = true
  try {
    const res = await api.getOrders()
    orders.value = res.data
  } catch (err) {
    console.error('Gagal mengambil data:', err)
  } finally {
    loading.value = false
  }
}

onMounted(fetchOrders)
</script>