<script setup lang="ts">
import { X } from 'lucide-vue-next'
import type { HistoryEntry } from '@/types'
import { formatDate } from '@/utils/formatters'

defineProps<{
  modelValue: boolean
  history: HistoryEntry[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  clear: []
}>()
</script>

<template>
  <!-- Backdrop -->
  <div 
    v-if="modelValue" 
    @click="emit('update:modelValue', false)" 
    class="fixed inset-0 bg-black/50 backdrop-blur-sm z-[65]"
  ></div>

  <!-- Sidebar -->
  <Transition 
    enter-active-class="transition ease-out duration-300" 
    enter-from-class="transform translate-x-full" 
    enter-to-class="transform translate-x-0" 
    leave-active-class="transition ease-in duration-300" 
    leave-from-class="transform translate-x-0" 
    leave-to-class="transform translate-x-full"
  >
    <div 
      v-if="modelValue" 
      class="fixed inset-y-0 right-0 w-80 bg-[#151C2C] border-l border-white/10 shadow-2xl z-[70] p-6 overflow-y-auto"
    >
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-bold text-white">История</h2>
        <button @click="emit('update:modelValue', false)" class="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white">
          <X class="w-5 h-5" />
        </button>
      </div>
      
      <div v-if="history.length === 0" class="text-center py-10 text-slate-500">
        История пуста
      </div>
      
      <div v-else class="space-y-4">
        <div 
          v-for="(entry, idx) in history" 
          :key="idx" 
          class="bg-[#0B1120] rounded-xl p-4 border border-white/5"
        >
          <div class="flex justify-between items-start mb-2">
            <span class="text-xs text-slate-500 font-medium">{{ formatDate(entry.date) }}</span>
            <span class="text-emerald-400 font-bold">{{ entry.total }} pts</span>
          </div>
          <div class="space-y-1">
            <div 
              v-for="(detail, dIdx) in entry.details" 
              :key="dIdx" 
              class="flex justify-between text-xs text-slate-400"
            >
              <span>{{ detail.name }}</span>
              <span>{{ detail.total }}</span>
            </div>
          </div>
        </div>
        
        <button 
          @click="emit('clear')" 
          class="w-full py-3 mt-4 text-xs font-bold text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors"
        >
          Очистить историю
        </button>
      </div>
    </div>
  </Transition>
</template>
