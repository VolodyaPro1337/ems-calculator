<script setup lang="ts">
import { X, Cloud, LogOut } from 'lucide-vue-next'

const props = defineProps<{
  modelValue: boolean
  syncRoomId: string
  isSyncing: boolean
  sharexAction: 'pmp' | 'pills' | 'vaccine' | 'medcert'
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'update:syncRoomId': [value: string]
  'update:sharexAction': [value: 'pmp' | 'pills' | 'vaccine' | 'medcert']
  connect: [roomId: string]
  disconnect: []
  createRoom: [metadata: { nickname: string; staticId: string }]
  downloadConfig: []
}>()

import { ref } from 'vue'

const newRoomData = ref({
  nickname: '',
  staticId: ''
})
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

          <div v-if="isSyncing" class="space-y-2 pt-2 border-t border-white/10">
            <label class="text-xs font-bold text-slate-500 uppercase">Настройка ShareX</label>
            <select 
              :value="sharexAction"
              @change="emit('update:sharexAction', ($event.target as HTMLSelectElement).value as any)"
              class="w-full bg-[#0B1120] text-indigo-300 rounded-lg p-2 text-sm font-bold border border-indigo-500/20 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="pmp">🚑 ПМП (First Aid)</option>
              <option value="pills">💊 Таблетки (City)</option>
              <option value="vaccine">💉 Вакцинация (City)</option>
              <option value="medcert">📄 Мед. справки (City)</option>
            </select>
            
            <button 
              @click="emit('downloadConfig')" 
              class="w-full py-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
            >
              <Cloud class="w-4 h-4" />
              Скачать конфиг
            </button>
          </div>

          <div class="relative py-2">
            <div class="absolute inset-0 flex items-center"><div class="w-full border-t border-white/10"></div></div>
            <div class="relative flex justify-center"><span class="px-2 bg-[#151C2C] text-xs text-slate-500">Создать новую комнату</span></div>
          </div>

          <!-- New Room Creation Fields -->
          <div class="space-y-3 bg-white/5 p-4 rounded-xl border border-white/5">
             <div>
                <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Ваш IC Nickname</label>
                <input 
                  v-model="newRoomData.nickname"
                  placeholder="Billy Kitsune"
                  class="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
             </div>
             <div>
                <label class="block text-[10px] font-bold text-slate-500 uppercase mb-1">Ваш Static ID</label>
                <input 
                  v-model="newRoomData.staticId"
                  placeholder="213363"
                  class="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
             </div>

             <button 
                @click="emit('createRoom', { nickname: newRoomData.nickname, staticId: newRoomData.staticId })" 
                :disabled="!newRoomData.nickname || !newRoomData.staticId"
                class="w-full py-2 bg-indigo-500 hover:bg-indigo-600 rounded-lg text-white text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Создать комнату
              </button>
          </div>
        </div>
        
        <button @click="emit('update:modelValue', false)" class="absolute top-4 right-4 text-slate-500 hover:text-white">
          <X class="w-5 h-5" />
        </button>
      </div>
    </div>
  </Transition>
</template>
