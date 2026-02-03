<script setup lang="ts">
import { ref } from 'vue'
import { X, Cloud, LogOut, User, Hash } from 'lucide-vue-next'

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
  createRoom: [meta: { nickname: string, staticId: string }]
  downloadConfig: []
}>()

const nickname = ref('')
const staticId = ref('')

const handleCreate = () => {
  if (!nickname.value || !staticId.value) {
    alert('Введите никнейм и статик!')
    return
  }
  emit('createRoom', { nickname: nickname.value, staticId: staticId.value })
}
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
        
        <div class="space-y-4">
          <!-- Connection to existing room -->
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
            <div class="relative flex justify-center"><span class="px-2 bg-[#151C2C] text-xs text-slate-500">НОВАЯ КОМНАТА</span></div>
          </div>

          <!-- Registration fields for new room -->
          <div class="space-y-3">
             <div class="relative">
                <User class="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
                <input v-model="nickname" placeholder="IC Nickname" class="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-3 text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
             </div>
             <div class="relative">
                <Hash class="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
                <input v-model="staticId" placeholder="Static ID" class="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-3 text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
             </div>
          </div>

          <button 
            @click="handleCreate" 
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
