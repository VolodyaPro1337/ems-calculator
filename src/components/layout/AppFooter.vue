<script setup lang="ts">
import { Copy, Check } from 'lucide-vue-next'

defineProps<{
  grandTotal: number
  showCopyFeedback: boolean
}>()

const emit = defineEmits<{
  copy: []
  reset: []
}>()
</script>

<template>
  <!-- Copy Feedback Toast -->
  <Transition 
    enter-active-class="transition ease-out duration-300" 
    enter-from-class="transform translate-y-5 opacity-0" 
    enter-to-class="transform translate-y-0 opacity-100" 
    leave-active-class="transition ease-in duration-200" 
    leave-from-class="opacity-100" 
    leave-to-class="opacity-0"
  >
    <div 
      v-if="showCopyFeedback" 
      class="fixed top-6 left-1/2 -translate-x-1/2 z-[60] px-4 py-2 bg-emerald-500 rounded-full shadow-lg flex items-center gap-2 pointer-events-none"
    >
      <Check class="w-4 h-4 text-white" />
      <span class="text-sm font-bold text-white">Скопировано!</span>
    </div>
  </Transition>

  <!-- Floating Footer -->
  <div class="fixed bottom-6 left-0 right-0 z-50 px-4 flex justify-center pointer-events-none">
    <div class="w-full max-w-lg bg-[#1A2234]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-2 relative flex items-center justify-center pointer-events-auto min-h-[72px]">
      
      <!-- Copy Button (Absolute Left) -->
      <button 
        @click="emit('copy')"
        class="absolute left-2 p-3 rounded-xl bg-slate-800 hover:bg-indigo-500/20 hover:text-indigo-400 text-slate-400 font-bold transition-all active:scale-95 flex items-center gap-2"
        title="Скопировать отчёт"
      >
        <Copy class="w-5 h-5" />
      </button>

      <!-- Total Score -->
      <div class="flex flex-col items-center">
        <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Score</span>
        <div class="flex items-baseline gap-1">
          <span class="text-3xl font-black text-white tabular-nums">{{ grandTotal }}</span>
          <span class="text-sm font-bold text-slate-500">pts</span>
        </div>
      </div>

      <!-- Reset Button -->
      <button 
        @click="emit('reset')"
        class="absolute right-2 p-3 rounded-xl bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 font-bold transition-all active:scale-95 flex items-center gap-2"
        title="Сбросить всё (в архив)"
      >
        <Check class="w-5 h-5" />
      </button>
    </div>
  </div>
</template>
