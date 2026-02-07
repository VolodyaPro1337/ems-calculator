<script setup lang="ts">
import { X } from 'lucide-vue-next'

const props = defineProps<{
  modelValue: boolean
  syncRoomId: string
  isSyncing: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'update:syncRoomId': [value: string]
  connect: [roomId: string]
  disconnect: []
  createRoom: []
}>()
</script>

<template>
  <Transition 
    enter-active-class="transition ease-out duration-200" 
    enter-from-class="opacity-0 scale-95" 
    enter-to-class="opacity-100 scale-100" 
    leave-active-class="transition ease-in duration-150" 
    leave-from-class="opacity-100 scale-100" 
    leave-to-class="opacity-0 scale-95"
  >
    <div v-if="modelValue" class="fixed inset-0 z-[80] flex items-center justify-center px-4">
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="emit('update:modelValue', false)"></div>
      <div class="relative w-full max-w-sm bg-[#151C2C] border border-white/10 rounded-2xl p-6 shadow-2xl">
        <h2 class="text-xl font-bold text-white mb-4">Синхронизация</h2>
        <p class="text-sm text-slate-400 mb-6">
          Введите код комнаты, чтобы синхронизировать данные между устройствами (ПК и телефон).
        </p>
        
        <div class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase mb-2">Код комнаты</label>
            <input 
              :value="syncRoomId"
              @input="emit('update:syncRoomId', ($event.target as HTMLInputElement).value)"
              placeholder="Пример: EMS123" 
              class="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white font-mono text-center text-lg uppercase focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
          
          <button 
            @click="emit('connect', syncRoomId)" 
            :disabled="!syncRoomId" 
            class="w-full py-3 bg-indigo-500 hover:bg-indigo-600 rounded-xl text-white font-bold transition-colors shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Подключиться
          </button>

          <div class="relative py-2">
            <div class="absolute inset-0 flex items-center"><div class="w-full border-t border-white/10"></div></div>
            <div class="relative flex justify-center"><span class="px-2 bg-[#151C2C] text-xs text-slate-500">ИЛИ</span></div>
          </div>

          <button 
            @click="emit('createRoom')" 
            class="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl text-slate-300 font-bold transition-colors"
          >
            Создать новую комнату
          </button>
        </div>
        
        <button @click="emit('update:modelValue', false)" class="absolute top-4 right-4 text-slate-500 hover:text-white">
          <X class="w-5 h-5" />
        </button>
      </div>
    </div>
  </Transition>
</template>
