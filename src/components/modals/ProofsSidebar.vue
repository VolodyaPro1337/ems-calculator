<script setup lang="ts">
import { X, Trash2, ExternalLink, ImageIcon } from 'lucide-vue-next'
import type { Proof } from '@/types'
import { formatDate } from '@/utils/formatters'

defineProps<{
  modelValue: boolean
  proofs: Proof[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  delete: [id: string]
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
      class="fixed inset-y-0 right-0 w-80 sm:w-96 bg-[#151C2C] border-l border-white/10 shadow-2xl z-[70] p-6 flex flex-col"
    >
      <div class="flex items-center justify-between mb-6 shrink-0">
        <h2 class="text-xl font-bold text-white flex items-center gap-2">
          <ImageIcon class="w-5 h-5 text-indigo-400" />
          Скриншоты
        </h2>
        <button @click="emit('update:modelValue', false)" class="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white">
          <X class="w-5 h-5" />
        </button>
      </div>
      
      <div v-if="proofs.length === 0" class="flex-1 flex flex-col items-center justify-center text-slate-500 py-10">
        <div class="p-4 rounded-full bg-white/5 mb-4">
          <ImageIcon class="w-8 h-8 opacity-20" />
        </div>
        <p>Скриншотов пока нет</p>
        <p class="text-xs mt-2 text-slate-600">Они появятся здесь после загрузки через ShareX</p>
      </div>
      
      <div v-else class="flex-1 overflow-y-auto space-y-4 pr-2 -mr-2">
        <div 
          v-for="proof in proofs" 
          :key="proof.id" 
          class="group bg-[#0B1120] rounded-xl overflow-hidden border border-white/5 hover:border-indigo-500/30 transition-all"
        >
          <!-- Image Preview -->
          <div class="relative aspect-video bg-black/20 overflow-hidden">
            <img 
              :src="proof.url" 
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3">
              <a 
                :href="proof.url" 
                target="_blank"
                class="p-2 rounded-lg bg-white/10 backdrop-blur-md text-white hover:bg-indigo-500 transition-colors"
                title="Открыть оригинал"
              >
                <ExternalLink class="w-4 h-4" />
              </a>
              <button 
                @click="emit('delete', proof.id)"
                class="p-2 rounded-lg bg-white/10 backdrop-blur-md text-rose-400 hover:bg-rose-500 hover:text-white transition-colors"
                title="Удалить"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Info -->
          <div class="p-3">
            <div class="flex justify-between items-start mb-1">
              <span class="text-[10px] font-bold text-slate-500 uppercase">{{ formatDate(proof.timestamp) }}</span>
              <span 
                class="text-[10px] font-bold px-1.5 py-0.5 rounded border"
                :class="proof.shift === 'day' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'"
              >
                {{ proof.shift === 'day' ? 'ДЕНЬ' : 'НОЧЬ' }}
              </span>
            </div>
            <p class="text-xs font-medium text-slate-300 line-clamp-1">{{ proof.itemName }}</p>
          </div>
        </div>
      </div>

      <div v-if="proofs.length > 0" class="pt-6 mt-auto shrink-0 border-t border-white/5">
        <button 
          @click="emit('clear')" 
          class="w-full py-3 text-xs font-bold text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors"
        >
          Очистить все скриншоты
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* Clean scrollbar for the sidebar */
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}
.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}
.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #1e293b;
  border-radius: 2px;
}
</style>
