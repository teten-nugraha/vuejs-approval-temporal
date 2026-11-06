<template>
  <div class="min-h-screen flex flex-col bg-slate-50">
    <!-- Header -->
    <header class="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div class="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <router-link to="/" class="flex items-center gap-2">
          <span class="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">A</span>
          <div>
            <span class="font-bold text-slate-900 tracking-tight text-lg block leading-none">Approval Workflow</span>
            <span class="text-[10px] text-slate-500 font-medium">Temporal Engine + H2 Database</span>
          </div>
        </router-link>

        <!-- Role Simulator Switcher -->
        <div class="flex items-center gap-3">
          <span class="text-xs text-slate-500 font-medium hidden sm:inline">Simulasi Login:</span>
          <select
            v-model="currentUser"
            @change="updateActiveUser"
            class="text-xs bg-slate-50 border border-slate-300 font-semibold text-slate-800 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500"
          >
            <option v-for="user in users" :key="user.id" :value="user">
              {{ user.name }} [{{ user.role }}]
            </option>
          </select>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8">
      <router-view :currentUser="currentUser" />
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from './services/api'

// Fallback daftar 2 orang per role
const users = ref([
  { id: 'USR-EMP1', name: 'Budi Santoso', role: 'EMPLOYEE' },
  { id: 'USR-EMP2', name: 'Siti Rahma', role: 'EMPLOYEE' },
  { id: 'USR-MGR1', name: 'Pak Toni (Manager 1)', role: 'MANAGER' },
  { id: 'USR-MGR2', name: 'Pak Agus (Manager 2)', role: 'MANAGER' },
  { id: 'USR-FIN1', name: 'Bu Lisa (Finance 1)', role: 'FINANCE' },
  { id: 'USR-FIN2', name: 'Bu Maya (Finance 2)', role: 'FINANCE' },
  { id: 'USR-DIR1', name: 'Pak Hartono (Director 1)', role: 'DIRECTOR' },
  { id: 'USR-DIR2', name: 'Pak Bambang (Director 2)', role: 'DIRECTOR' },
  { id: 'USR-CEO1', name: 'Pak Hendra (CEO 1)', role: 'CEO' },
  { id: 'USR-CEO2', name: 'Pak Rudi (CEO 2)', role: 'CEO' }
])

const currentUser = ref(users.value[0])

onMounted(async () => {
  try {
    const res = await api.getUsers()
    if (res.data && res.data.length > 0) {
      users.value = res.data
      const saved = localStorage.getItem('current_user')
      if (saved) {
        const found = users.value.find(u => u.id === JSON.parse(saved).id)
        currentUser.value = found || users.value[0]
      } else {
        currentUser.value = users.value[0]
      }
    }
  } catch (e) {
    console.warn('Gagal memuat users dari backend, menggunakan list lokal.')
  }
})

function updateActiveUser() {
  localStorage.setItem('current_user', JSON.stringify(currentUser.value))
}
</script>