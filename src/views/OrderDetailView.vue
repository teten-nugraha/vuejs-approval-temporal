<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <router-link to="/" class="text-sm text-slate-500 hover:text-slate-800">&larr; Kembali</router-link>
        <h1 class="text-2xl font-bold text-slate-900">Detail Pengajuan #{{ orderId }}</h1>
      </div>
      <button @click="loadData" class="text-xs bg-slate-100 hover:bg-slate-200 border px-3 py-1.5 rounded-lg text-slate-600 font-semibold transition">
        🔄 Refresh
      </button>
    </div>

    <div v-if="loading" class="bg-white p-8 rounded-xl border text-center text-slate-500">
      Mengambil data dari Database H2 & Temporal Engine...
    </div>

    <div v-else-if="order" class="space-y-6">

      <!-- Stepper Tracking -->
      <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 class="text-xs font-bold uppercase text-slate-400 mb-6">Tahapan Approval Berjenjang</h2>

        <div v-if="order.status === 'CANCELLED'" class="p-4 bg-slate-100 border border-slate-200 rounded-lg text-center">
          <span class="text-xs font-bold text-slate-600 uppercase">Workflow Dihentikan (Dibatalkan oleh Pemohon)</span>
        </div>

        <div v-else class="flex items-center justify-between relative px-4">
          <div class="absolute left-10 right-10 top-4 h-0.5 bg-slate-200 -z-0"></div>

          <!-- Auto Approved Case -->
          <div v-if="!order.approvalChain || order.approvalChain.length === 0" class="mx-auto flex flex-col items-center bg-white px-4 relative z-10">
            <div class="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold">✓</div>
            <span class="text-xs font-bold mt-2">Auto Approved by System</span>
          </div>

          <!-- Normal Chain -->
          <div
            v-for="(role, index) in order.approvalChain"
            :key="role"
            class="relative z-10 flex flex-col items-center bg-white px-2"
          >
            <div
              class="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shadow transition"
              :class="getStepCircleClass(index)"
            >
              <span v-if="index < order.currentStepIndex">✓</span>
              <span v-else-if="index === order.currentStepIndex && order.status === 'REJECTED'">✕</span>
              <span v-else-if="index === order.currentStepIndex && order.status === 'IN_PROGRESS'">⏳</span>
              <span v-else>{{ index + 1 }}</span>
            </div>
            <span class="text-xs font-bold text-slate-800 mt-2">{{ role }}</span>
            <span class="text-[10px] font-semibold text-slate-400">{{ getStepStatusLabel(index) }}</span>
          </div>
        </div>
      </div>

      <!-- Grid Info Permohonan & Action Reviewer -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">

        <!-- Info Permohonan -->
        <div class="md:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div class="flex justify-between items-center border-b pb-3">
            <h3 class="font-bold text-slate-900">Informasi Permohonan</h3>
            <span :class="statusBadge(order.status)" class="px-2.5 py-1 rounded-full text-xs font-semibold border">
              {{ order.status }}
            </span>
          </div>

          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span class="text-xs text-slate-400 block">Pemohon Pertama</span>
              <span class="font-semibold text-slate-800">{{ order.requesterId }}</span>
            </div>
            <div>
              <span class="text-xs text-slate-400 block">Tipe & Nilai</span>
              <span class="font-bold text-slate-800">
                {{ order.type === 'BUY' ? 'BUY (Rp ' + Number(order.amount).toLocaleString('id-ID') + ')' : order.days + ' Hari Cuti' }}
              </span>
            </div>
            <div>
              <span class="text-xs text-slate-400 block">Tahapan Saat Ini</span>
              <span class="font-bold text-amber-600">{{ order.waitingForRole || 'Selesai' }}</span>
            </div>
            <div>
              <span class="text-xs text-slate-400 block">Status Klaim (Pick Me)</span>
              <span v-if="order.claimedByName" class="font-bold text-indigo-700">🔒 {{ order.claimedByName }}</span>
              <span v-else-if="order.status === 'IN_PROGRESS'" class="text-amber-600 font-semibold italic">Belum ada yang klaim</span>
              <span v-else class="text-slate-400">—</span>
            </div>
          </div>

          <div class="pt-2">
            <span class="text-xs text-slate-400 block mb-1">Catatan Pemohon</span>
            <p class="text-sm bg-slate-50 p-3 rounded-lg border text-slate-700">{{ order.notes }}</p>
          </div>

          <!-- FITUR PEMBATALAN OLEH PEMOHON PERTAMA -->
          <div v-if="isRequester && order.status === 'IN_PROGRESS'" class="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between mt-4">
            <div>
              <h4 class="text-xs font-bold text-rose-800">Area Pemohon (Requester Actions)</h4>
              <p class="text-[11px] text-rose-600">Sebagai pembuat order, Anda memiliki hak untuk membatalkan pengajuan ini sebelum disetujui.</p>
            </div>
            <button
              @click="handleCancel"
              :disabled="actionLoading"
              class="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow transition"
            >
              ✕ Batalkan Pengajuan
            </button>
          </div>

          <!-- History Approval -->
          <div class="pt-4 border-t">
            <span class="text-xs font-bold text-slate-400 block mb-2 uppercase">Log Riwayat Keputusan</span>
            <div v-if="!order.history || order.history.length === 0" class="text-xs text-slate-400 italic">Belum ada riwayat persetujuan.</div>
            <ul v-else class="space-y-2">
              <li v-for="(h, i) in order.history" :key="i" class="text-xs bg-slate-50 p-2.5 rounded border flex justify-between">
                <div>
                  <strong class="text-slate-800">{{ h.role }} ({{ h.approverId }}):</strong>
                  <span :class="h.approved ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'"> {{ h.approved ? 'SETUJU' : 'TOLAK' }}</span>
                  <span class="text-slate-500" v-if="h.notes"> - "{{ h.notes }}"</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <!-- Reviewer Action Box -->
        <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 class="font-bold text-slate-900 mb-1">Aksi Reviewer</h3>
            <p class="text-xs text-slate-500 mb-4">
              Login sebagai: <br>
              <strong>{{ currentUser.name }}</strong> (<span class="text-blue-600 font-bold">{{ currentUser.role }}</span>)
            </p>

            <div v-if="order.status === 'CANCELLED'" class="p-3 bg-slate-50 border rounded-lg text-xs text-slate-500">
              Pengajuan ini telah <strong>Dibatalkan</strong> oleh pemohon. Tidak ada tindakan lebih lanjut.
            </div>

            <!-- Kondisi Belum di-Pick Me -->
            <div v-else-if="canPickMe" class="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-3">
              <p class="text-xs text-amber-800 leading-relaxed">
                Order menunggu persetujuan <strong>{{ order.waitingForRole }}</strong>. Lakukan Pick Me terlebih dahulu sebelum mengambil keputusan.
              </p>
              <button
                @click="handleClaim"
                :disabled="actionLoading"
                class="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow transition flex items-center justify-center gap-1.5"
              >
                <span>✋</span>
                <span>{{ actionLoading ? 'Mengunci...' : 'Pick Me (Klaim Order Ini)' }}</span>
              </button>
            </div>

            <!-- Kondisi Sudah di-Pick Me oleh User yang Login -->
            <div v-else-if="isClaimedByCurrentUser" class="space-y-3">
              <div class="flex items-center justify-between bg-indigo-50 border border-indigo-200 p-2.5 rounded-lg text-xs">
                <span class="font-bold text-indigo-900">🔒 Anda pemegang order ini</span>
                <button @click="handleRelease" :disabled="actionLoading" class="text-rose-600 hover:underline font-bold text-[11px]">
                  Lepas Klaim
                </button>
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-600 mb-1">Catatan Keputusan</label>
                <textarea v-model="decisionNote" rows="3" placeholder="Tulis alasan..." class="w-full border rounded-lg p-2 text-xs focus:ring-2 focus:ring-blue-500"></textarea>
              </div>
            </div>

            <!-- Kondisi Sudah di-Pick Me oleh Orang Lain -->
            <div v-else-if="isClaimedByOther" class="p-3 bg-slate-50 border rounded-lg text-xs text-slate-600 leading-relaxed">
              ⚠️ Order sedang <strong>dikunci oleh {{ order.claimedByName }}</strong>. Anda tidak dapat melakukan keputusan.
            </div>

            <div v-else class="p-3 bg-slate-50 rounded-lg text-xs text-slate-500">
              <span v-if="order.status !== 'IN_PROGRESS'">Pengajuan ini sudah <strong>{{ order.status }}</strong>.</span>
              <span v-else>Tahapan ini membutuhkan role <strong class="text-amber-600">{{ order.waitingForRole }}</strong>.</span>
            </div>
          </div>

          <div v-if="isClaimedByCurrentUser && order.status === 'IN_PROGRESS'" class="space-y-2 pt-4 border-t mt-4">
            <button @click="handleDecision(true)" :disabled="actionLoading" class="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow transition">
              ✓ Setujui (Approve)
            </button>
            <button @click="handleDecision(false)" :disabled="actionLoading" class="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-lg transition">
              ✕ Tolak (Reject)
            </button>
          </div>
        </div>

      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '../services/api'

const props = defineProps({
  currentUser: { type: Object, required: true }
})

const route = useRoute()
const orderId = route.params.id
const order = ref(null)
const loading = ref(true)
const actionLoading = ref(false)
const decisionNote = ref('')

async function loadData() {
  loading.value = true
  try {
    const res = await api.getOrderState(orderId)
    order.value = res.data
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

// Cek apakah user saat ini adalah pemohon pertama
const isRequester = computed(() => {
  if (!order.value || !props.currentUser) return false
  return order.value.requesterId === props.currentUser.id ||
         order.value.requesterId === props.currentUser.name
})

const isRoleMatch = computed(() => {
  return order.value && order.value.status === 'IN_PROGRESS' && props.currentUser.role === order.value.waitingForRole
})

const canPickMe = computed(() => {
  return isRoleMatch.value && !order.value.claimedById
})

const isClaimedByCurrentUser = computed(() => {
  return isRoleMatch.value && order.value.claimedById === props.currentUser.id
})

const isClaimedByOther = computed(() => {
  return isRoleMatch.value && order.value.claimedById && order.value.claimedById !== props.currentUser.id
})

function getStepCircleClass(idx) {
  if (idx < order.value.currentStepIndex) return 'bg-emerald-500 text-white'
  if (idx === order.value.currentStepIndex) {
    if (order.value.status === 'REJECTED') return 'bg-rose-500 text-white'
    return 'bg-amber-500 text-white ring-4 ring-amber-100 animate-pulse'
  }
  return 'bg-slate-200 text-slate-500'
}

function getStepStatusLabel(idx) {
  if (idx < order.value.currentStepIndex) return 'Disetujui'
  if (idx === order.value.currentStepIndex) {
    return order.value.status === 'REJECTED' ? 'Ditolak' : 'Menunggu'
  }
  return 'Pending'
}

function statusBadge(status) {
  if (status === 'APPROVED') return 'bg-emerald-50 text-emerald-700 border-emerald-200'
  if (status === 'REJECTED') return 'bg-rose-50 text-rose-700 border-rose-200'
  if (status === 'CANCELLED') return 'bg-slate-100 text-slate-600 border-slate-300'
  return 'bg-amber-50 text-amber-700 border-amber-200'
}

// Handle Cancel Pengajuan
async function handleCancel() {
  const reason = prompt("Masukkan alasan pembatalan:")
  if (reason === null) return

  actionLoading.value = true
  try {
    await api.cancelOrder(orderId, props.currentUser.id, reason || "Dibatalkan oleh pemohon")
    alert("Pengajuan berhasil dibatalkan.")
    await loadData()
  } catch (err) {
    alert(err.response?.data?.error || err.message)
  } finally {
    actionLoading.value = false
  }
}

async function handleClaim() {
  actionLoading.value = true
  try {
    await api.claimOrder(orderId, props.currentUser.id)
    await loadData()
  } catch (err) {
    alert(err.response?.data?.error || err.message)
  } finally {
    actionLoading.value = false
  }
}

async function handleRelease() {
  actionLoading.value = true
  try {
    await api.releaseOrder(orderId, props.currentUser.id)
    await loadData()
  } catch (err) {
    alert(err.response?.data?.error || err.message)
  } finally {
    actionLoading.value = false
  }
}

async function handleDecision(approved) {
  actionLoading.value = true
  try {
    await api.submitDecision(orderId, {
      approverId: props.currentUser.id,
      approved,
      notes: decisionNote.value
    })
    decisionNote.value = ''
    await loadData()
  } catch (err) {
    alert(err.response?.data?.error || err.message)
  } finally {
    actionLoading.value = false
  }
}

onMounted(loadData)
</script>