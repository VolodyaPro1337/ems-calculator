<script setup lang="ts">
import { Plus, Minus } from 'lucide-vue-next'
import type { CategoryItem } from '@/types'

defineProps<{
  item: CategoryItem
  disabled?: boolean
}>()

const emit = defineEmits<{
  increment: []
  decrement: []
  'update:quantity': [value: number]
}>()
</script>

<template>
  <div class="p-4 flex items-center justify-between gap-3 hover:bg-white/5 transition-colors">
    <!-- Name & Badge -->
    <div class="flex-1 min-w-0 pr-2">
      <p class="text-sm font-medium text-slate-300 leading-snug mb-1.5">{{ item.name }}</p>
      <span 
        v-if="!item.isRawPoints" 
        class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-500 border border-white/5"
      >\n        {{ item.points }} PTS
      </span>
    </div>

    <!-- Controls -->
    <div class="flex items-center gap-3 shrink-0">
      <button 
        v-if="!disabled"
        @click="emit('decrement')"
        class="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 active:scale-95 transition-all disabled:opacity-30 disabled:active:scale-100"
        :disabled="item.quantity <= 0"
      >
        <Minus class="w-4 h-4" />
      </button>
      
      <div class="w-12">
        <input
          type="number"
          :value="item.quantity"
          :readonly="disabled"
          @input="emit('update:quantity', Number(($event.target as HTMLInputElement).value))"
          min="0"
          @click.stop
          class="w-full bg-transparent text-center font-bold text-white text-lg tabular-nums focus:outline-none focus:ring-1 focus:ring-white/20 rounded px-0 py-0.5 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
      </div>

      <button 
        v-if="!disabled"
        @click="emit('increment')" 
        class="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 active:scale-95 transition-all"
      >
        <Plus class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>
