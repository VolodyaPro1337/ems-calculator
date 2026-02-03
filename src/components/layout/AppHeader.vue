<script setup lang="ts">
import { Calculator, Cloud, History as HistoryIcon, Sun, Moon, LogOut, UserCheck } from 'lucide-vue-next'
import type { ShiftType } from '@/types'

defineProps<{
  currentShift: ShiftType
  shiftLabel: string
  isSyncing: boolean
  syncRoomId: string
  isAuditMode?: boolean
  nickname?: string
  staticId?: string
  grandTotal?: number
}>()

const emit = defineEmits<{
  openSync: []
  openHistory: []
  disconnect: []
}>()
</script>

<template>
  <header class="text-center mb-6 relative">
    <!-- Left: Sync Button -->
    <button 
      v-if="!isAuditMode"
      @click="emit('openSync')"
      class="absolute left-0 top-4 p-3 rounded-xl transition-all border shadow-lg flex items-center gap-2"
      :class="isSyncing ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' : 'bg-[#151C2C] text-slate-400 border-white/10 hover:text-white hover:bg-indigo-500/20'"
      :title="isSyncing ? `Синхронизация: ${syncRoomId}` : 'Синхронизация'"
    >
      <Cloud class="w-6 h-6" />
      <span v-if="isSyncing" class="text-xs font-bold font-mono">{{ syncRoomId }}</span>
    </button>

    <!-- Right: History Button -->
    <button 
      @click="emit('openHistory')" 
      class="absolute right-0 top-4 p-3 rounded-xl bg-[#151C2C] text-indigo-400 hover:text-white hover:bg-indigo-500/20 transition-all border border-white/10 shadow-lg"
      title="История отчётов"
    >
      <HistoryIcon class="w-6 h-6" />
    </button>
    
    <!-- Logo -->
    <div class="inline-flex items-center justify-center mb-4 p-6 rounded-full bg-[#151C2C] ring-1 ring-white/10 shadow-2xl shadow-indigo-500/20">
      <Calculator class="w-12 h-12 text-indigo-400" />
    </div>
    <h1 class="text-3xl font-bold text-white tracking-tight mb-1">
      EMS Calculator
    </h1>
    <div class="h-1 w-16 bg-indigo-500/50 rounded-full mx-auto"></div>
    
    <!-- Auditor Badge -->
    <div v-if="isAuditMode" class="mt-4 flex flex-col items-center gap-2 animate-in fade-in zoom-in duration-500">
      <div class="px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center gap-3 shadow-xl shadow-emerald-500/5">
        <div class="p-1.5 bg-emerald-500 rounded-lg">
          <UserCheck class="w-4 h-4 text-white" />
        </div>
        <div class="flex flex-col items-start">
          <span class="text-[10px] font-black text-emerald-500 uppercase tracking-widest leading-none mb-1">Проверка отчета</span>
          <span class="text-sm font-bold text-white leading-none">
            {{ nickname || 'Аноним' }} <span class="text-slate-500 font-mono text-xs">#{{ staticId || '???' }}</span>
          </span>
        </div>
        <div class="ml-2 pl-4 border-l border-white/10 flex flex-col items-center">
           <span class="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Всего</span>
           <span class="text-lg font-black text-emerald-400 leading-none">{{ grandTotal }} <span class="text-[10px] text-slate-500">pts</span></span>
        </div>
      </div>
    </div>

    <!-- Shift & Sync Status -->
    <div v-else class="mt-4 flex flex-col items-center gap-2">
      <!-- Shift Badge -->
      <div 
        class="px-4 py-1.5 rounded-full border flex items-center gap-2 shadow-lg backdrop-blur-md transition-all duration-500"
        :class="currentShift === 'day' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-indigo-900/40 border-indigo-500/30 text-indigo-300'"
      >
        <Sun v-if="currentShift === 'day'" class="w-4 h-4 animate-[spin_10s_linear_infinite]" />
        <Moon v-else class="w-4 h-4" />
        <span class="text-xs font-bold">{{ shiftLabel }}</span>
      </div>

      <!-- Sync Badge -->
      <div v-if="isSyncing" class="px-3 py-1 bg-indigo-500/10 rounded-full border border-indigo-500/20 flex items-center gap-2">
        <div class="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
        <span class="text-xs text-indigo-300 font-medium">Синхронизация активна</span>
        <button @click="emit('disconnect')" class="ml-1 text-slate-500 hover:text-white">
          <LogOut class="w-3 h-3" />
        </button>
      </div>
    </div>
  </header>
</template>
