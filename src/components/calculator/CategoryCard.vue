<script setup lang="ts">
import { computed, type Component } from 'vue'
import { ChevronDown, Pill, Syringe, FileText, Ambulance, Clock, PartyPopper, ClipboardList } from 'lucide-vue-next'
import type { Category, CategoryItem } from '@/types'
import { getCategoryTotal } from '@/utils/formatters'
import ItemRow from './ItemRow.vue'

const props = defineProps<{
  category: Category
  disabled?: boolean
}>()

const emit = defineEmits<{
  toggle: []
  increment: [item: CategoryItem]
  decrement: [item: CategoryItem]
}>()

const iconComponents: Record<string, Component> = {
  Pill,
  Syringe,
  FileText,
  Ambulance,
  Clock,
  PartyPopper,
  ClipboardList
}

const iconComponent = computed(() => iconComponents[props.category.icon])
const total = computed(() => getCategoryTotal(props.category))
</script>

<template>
  <div 
    class="bg-[#151C2C] border border-white/5 rounded-2xl overflow-hidden shadow-lg"
    :class="{ 'ring-1 ring-indigo-500/40': category.isOpen }"
  >
    <!-- Header -->
    <button 
      @click="emit('toggle')"
      class="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors group cursor-pointer"
    >
      <div class="flex items-center gap-4">
        <component :is="iconComponent" :class="`w-6 h-6 ${category.color}`" />
        <div class="flex flex-col items-start">
          <span class="font-bold text-white text-lg leading-none mb-1">{{ category.name }}</span>
          <span v-if="!category.isOpen && total > 0" class="text-xs font-bold text-emerald-400">
            +{{ total }} pts
          </span>
          <span v-else class="text-xs text-slate-500">Нажмите чтобы открыть</span>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <span v-if="category.isOpen" class="font-mono font-bold text-indigo-400">
          {{ total }}
        </span>
        <ChevronDown 
          class="w-5 h-5 text-slate-500 transition-transform duration-300"
          :class="{ 'rotate-180 text-white': category.isOpen }"
        />
      </div>
    </button>

    <!-- Content -->
    <div v-show="category.isOpen" class="bg-[#0f1522]/50 border-t border-white/5">
      <div class="divide-y divide-white/5">
        <ItemRow 
          v-for="(item, idx) in category.items" 
          :key="idx"
          :item="item"
          :disabled="disabled"
          @increment="emit('increment', item)"
          @decrement="emit('decrement', item)"
        />
      </div>
    </div>
  </div>
</template>
