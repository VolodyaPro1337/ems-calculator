<script setup lang="ts">
import { Calculator, Cloud, History as HistoryIcon, Sun, Moon, LogOut, GraduationCap } from 'lucide-vue-next'
import type { ShiftType } from '@/types'

defineProps<{
  currentShift: ShiftType
  shiftLabel: string
  isSyncing: boolean
  syncRoomId: string
}>()

const emit = defineEmits<{
  openSync: []
  openHistory: []
  openGuide: []
  disconnect: []
}>()
</script>

<template>
  <header class="text-center mb-6 relative">
    <!-- Left: Buttons -->
    <div class="absolute left-0 top-4 flex gap-2">
      <button 
        @click="emit('openSync')"
        class="p-3 rounded-xl transition-all border shadow-lg flex items-center gap-2"
        :class="isSyncing ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' : 'bg-[#151C2C] text-slate-400 border-white/10 hover:text-white hover:bg-indigo-500/20'"
        :title="isSyncing ? `Синхронизация: ${syncRoomId}` : 'Синхронизация'"
      >
        <Cloud class="w-6 h-6" />
        <span v-if="isSyncing" class="text-xs font-bold font-mono">{{ syncRoomId }}</span>
      </button>

      <button 
        @click="emit('openGuide')" 
        class="p-3 rounded-xl bg-[#151C2C] text-amber-400 hover:text-white hover:bg-amber-500/20 transition-all border border-white/10 shadow-lg"
        title="Система повышения"
      >
        <GraduationCap class="w-6 h-6" />
      </button>
    </div>

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
    
    <!-- Shift & Sync Status -->
    <div class="mt-4 flex flex-col items-center gap-2">
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
