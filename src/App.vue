<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { initializeApp } from "firebase/app"
import { getDatabase, ref as dbRef, onValue, set } from "firebase/database"
import { 
  Pill, 
  Syringe, 
  FileText, 
  Ambulance, 
  Clock, 
  PartyPopper, 
  ClipboardList,
  RotateCcw,
  Calculator,
  Plus,
  Minus,
  ChevronDown,
  Copy,
  History as HistoryIcon,
  X,
  Check,
  Cloud,
  Loader2,
  LogOut,
  Moon,
  Sun
} from 'lucide-vue-next'

// --- Firebase Config ---
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig)
const db = getDatabase(app)

const STORAGE_KEY = 'ems-calculator-state'
const HISTORY_KEY = 'ems-calculator-history'
const SYNC_ROOM_KEY = 'ems-calculator-sync-room'

const showHistory = ref(false)
const history = ref([])
const showCopyFeedback = ref(false)

// Sync State
const showSyncModal = ref(false)
const syncRoomId = ref('')
const isSyncing = ref(false)
const isRemoteUpdate = ref(false)
const databaseRef = ref(null)

// Shift Logic
const currentShift = ref('day') // 'day' | 'night'
const shiftLabel = computed(() => currentShift.value === 'day' ? 'Дневная смена' : 'Ночная смена')

const updateShiftStatus = () => {
  const now = new Date()
  const day = now.getDay() // 0 = Sun, 6 = Sat
  const hour = now.getHours()
  
  // Weekday: Mon(1) - Fri(5)
  // Weekend: Sat(6), Sun(0)
  const isWeekend = day === 0 || day === 6
  
  if (isWeekend) {
    // Weekend Day: 12:00 - 20:00
    if (hour >= 12 && hour < 20) {
      currentShift.value = 'day'
    } else {
      currentShift.value = 'night'
    }
  } else {
    // Weekday Day: 10:00 - 20:00
    if (hour >= 10 && hour < 20) {
      currentShift.value = 'day'
    } else {
      currentShift.value = 'night'
    }
  }
}

const categories = ref([
  {
    id: 'pills',
    name: 'Выдача таблеток',
    icon: 'Pill',
    color: 'text-rose-400',
    items: [
      { name: 'Выдача таблетки в ELSH День', points: 1, quantity: 0 },
      { name: 'Выдача таблетки в ELSH Ночь', points: 2, quantity: 0 },
      { name: 'Выдача таблетки в Sandy Shores День', points: 3, quantity: 0 },
      { name: 'Выдача таблетки в Sandy Shores Ночь', points: 4, quantity: 0 },
      { name: 'Выдача таблетки в Paleto Bay День', points: 3, quantity: 0 },
      { name: 'Выдача таблетки в Paleto Bay Ночь', points: 4, quantity: 0 },
    ]
  },
  {
    id: 'vaccination',
    name: 'Вакцинация',
    icon: 'Syringe',
    color: 'text-cyan-400',
    items: [
      { name: 'Вакцинация в ELSH День', points: 2, quantity: 0 },
      { name: 'Вакцинация в ELSH Ночь', points: 3, quantity: 0 },
      { name: 'Вакцинация в Sandy Shores День', points: 4, quantity: 0 },
      { name: 'Вакцинация в Sandy Shores Ночь', points: 6, quantity: 0 },
      { name: 'Вакцинация в Paleto Bay День', points: 4, quantity: 0 },
      { name: 'Вакцинация в Paleto Bay Ночь', points: 6, quantity: 0 },
    ]
  },
  {
    id: 'certificates',
    name: 'Мед. справки',
    icon: 'FileText',
    color: 'text-amber-400',
    items: [
      { name: 'Выдача 1 мед. справки в ELSH День', points: 3, quantity: 0 },
      { name: 'Выдача 1 мед. справки в ELSH Ночь', points: 4, quantity: 0 },
      { name: 'Выдача 1 мед. справки в Sandy Shores День', points: 5, quantity: 0 },
      { name: 'Выдача 1 мед. справки в Sandy Shores Ночь', points: 6, quantity: 0 },
      { name: 'Выдача 1 мед. справки в Paleto Bay День', points: 5, quantity: 0 },
      { name: 'Выдача 1 мед. справки в Paleto Bay Ночь', points: 6, quantity: 0 },
    ]
  },
  {
    id: 'firstaid',
    name: 'ПМП и вызовы',
    icon: 'Ambulance',
    color: 'text-red-400',
    items: [
      { name: 'Оказание ПМП День', points: 4, quantity: 0 },
      { name: 'Оказание ПМП Ночь', points: 6, quantity: 0 },
      { name: 'ПМП с интерном День', points: 5, quantity: 0 },
      { name: 'ПМП с интерном Ночь', points: 7, quantity: 0 },
      { name: 'Отмена ПМП', points: 1, quantity: 0 },
      { name: 'Выдача таблетка на выезде ПМП День', points: 1, quantity: 0 },
      { name: 'Выдача таблетка на выезде ПМП Ночь', points: 2, quantity: 0 },
      { name: 'Вакцинация на выезде ПМП День', points: 3, quantity: 0 },
      { name: 'Вакцинация на выезде ПМП Ночь', points: 5, quantity: 0 },
    ]
  },
  {
    id: 'patrols',
    name: 'Дежурства (30 мин)',
    icon: 'Clock',
    color: 'text-violet-400',
    items: [
      { name: 'ELSH День', points: 5, quantity: 0 },
      { name: 'ELSH Ночь', points: 8, quantity: 0 },
      { name: 'Сенди Шорс День', points: 8, quantity: 0 },
      { name: 'Сенди Шорс Ночь', points: 14, quantity: 0 },
      { name: 'Палето-Бей День', points: 8, quantity: 0 },
      { name: 'Палето-Бей Ночь', points: 14, quantity: 0 },
      { name: 'Дежурство ПМП День', points: 5, quantity: 0 },
      { name: 'Дежурство ПМП Ночь', points: 10, quantity: 0 },
    ]
  },
  {
    id: 'events',
    name: 'Мероприятия',
    icon: 'PartyPopper',
    color: 'text-emerald-400',
    isManual: true,
    items: [
      { name: 'СУММА ВСЕХ МП', points: 1, quantity: 0, isRawPoints: true },
    ]
  },
  {
    id: 'highcommand',
    name: 'Старший состав',
    icon: 'ClipboardList',
    color: 'text-indigo-400',
    items: [
      { name: 'Проверка отчёта на повышение', points: 25, quantity: 0 },
      { name: 'Проверка дежурства', points: 10, quantity: 0 },
      { name: 'Подача госволны', points: 15, quantity: 0 },
    ]
  },
])

const iconComponents = {
  Pill,
  Syringe,
  FileText,
  Ambulance,
  Clock,
  PartyPopper,
  ClipboardList,
  Copy,
  HistoryIcon,
  X,
  Check,
  Cloud,
  Loader2,
  LogOut,
  Moon,
  Sun
}

const getSubtotal = (item) => {
  if (item.isRawPoints) {
    return item.quantity
  }
  return item.quantity * item.points
}

const getCategoryTotal = (category) => {
  return category.items.reduce((sum, item) => sum + getSubtotal(item), 0)
}

const grandTotal = computed(() => {
  return categories.value.reduce((sum, cat) => sum + getCategoryTotal(cat), 0)
})

const saveToHistory = () => {
  if (grandTotal.value === 0) return

  const report = {
    date: new Date().toISOString(),
    total: grandTotal.value,
    details: categories.value
      .filter(c => getCategoryTotal(c) > 0)
      .map(c => ({
        name: c.name,
        total: getCategoryTotal(c)
      }))
  }
  
  history.value.unshift(report)
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.value))
}

const resetAll = () => {
  if (grandTotal.value > 0) {
     if (confirm('Сохранить результат в историю перед сбросом?')) {
        saveToHistory()
     } else {
        if (!confirm('Вы уверены, что хотите сбросить без сохранения?')) return
     }
  }

  categories.value.forEach(cat => {
    cat.items.forEach(item => {
      item.quantity = 0
    })
  })
}

const copyReport = async () => {
  const date = new Date().toLocaleDateString('ru-RU')
  let text = `📅 Отчёт за ${date}\n`
  text += `------------------\n`
  
  categories.value.forEach(cat => {
    const total = getCategoryTotal(cat)
    if (total > 0) {
      text += `${cat.name}: ${total} pts\n`
      cat.items.forEach(item => {
        if (item.quantity > 0) {
          text += `  • ${item.name}: ${item.quantity} шт (${getSubtotal(item)} pts)\n`
        }
      })
      text += `\n`
    }
  })
  
  text += `------------------\n`
  text += `🏆 ИТОГО: ${grandTotal.value} очков`

  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text)
    } else {
      // Fallback
      const textArea = document.createElement("textarea")
      textArea.value = text
      textArea.style.position = "fixed"
      textArea.style.left = "-9999px"
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      try {
        document.execCommand('copy')
      } catch (err) {
        console.error('Fallback copy failed', err)
        alert('Не удалось скопировать. Попробуйте вручную.')
        return
      }
      document.body.removeChild(textArea)
    }
    
    showCopyFeedback.value = true
    setTimeout(() => showCopyFeedback.value = false, 2000)
  } catch (err) {
    console.error('Failed to copy', err)
    alert('Не удалось скопировать. Проверьте разрешения браузера.')
  }
}

const toggleCategory = (category) => {
  category.isOpen = !category.isOpen
}

const increment = (item) => {
  item.quantity++
}

const decrement = (item) => {
  if (item.quantity > 0) {
    item.quantity--
  }
}

const formatDate = (isoString) => {
  return new Date(isoString).toLocaleString('ru-RU', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
  })
}

const clearHistory = () => {
  if(confirm('Очистить всю историю?')) {
    history.value = []
    localStorage.removeItem(HISTORY_KEY)
  }
}

// --- Sync Logic ---

const generateRoomId = () => {
  // Simple random string
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

const connectToSync = async (roomId) => {
  if (!roomId) return
  
  isSyncing.value = true
  syncRoomId.value = roomId.toUpperCase().trim()
  localStorage.setItem(SYNC_ROOM_KEY, syncRoomId.value)
  showSyncModal.value = false

  const roomRef = dbRef(db, 'rooms/' + syncRoomId.value)
  databaseRef.value = roomRef

  // Listen for changes
  onValue(roomRef, (snapshot) => {
    const data = snapshot.val()
    if (data) {
      isRemoteUpdate.value = true
      
      data.forEach(remoteCat => {
        const localCat = categories.value.find(c => c.id === remoteCat.id)
        if (localCat) {
          localCat.isOpen = remoteCat.isOpen ?? localCat.isOpen
          if (remoteCat.items) {
             remoteCat.items.forEach((remoteItem, idx) => {
               if (localCat.items[idx]) {
                 localCat.items[idx].quantity = remoteItem.quantity
               }
             })
          }
        }
      })

      // Wait for Vue to update DOM/state then reset flag
      nextTick(() => {
        isRemoteUpdate.value = false
      })
    }
  })
}

const disconnectSync = () => {
  // Just clear the ref and local state. Firebase keeps connection but we stop updating
  // In a real app we might want to `off()` listener, but onValue handles it if we drop ref usually,
  // or specific unsubscribe. For simplicity here:
  isRemoteUpdate.value = true // block outgoing updates
  databaseRef.value = null
  isSyncing.value = false
  syncRoomId.value = ''
  localStorage.removeItem(SYNC_ROOM_KEY)
  setTimeout(() => isRemoteUpdate.value = false, 500)
}

const createNewRoom = () => {
  const newId = generateRoomId()
  connectToSync(newId)
}

// Persistence & Sync Watcher
watch(categories, (newVal) => {
  // 1. Local Persistence
  const state = newVal.map(cat => ({
    id: cat.id,
    isOpen: cat.isOpen, 
    items: cat.items.map(item => ({ quantity: item.quantity }))
  }))
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))

  // 2. Remote Sync
  if (isSyncing.value && databaseRef.value && !isRemoteUpdate.value) {
    set(databaseRef.value, state).catch(e => console.error(e))
  }
}, { deep: true })

onMounted(() => {
  // Load State
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    try {
        const parsed = JSON.parse(saved)
        parsed.forEach(savedCat => {
        const category = categories.value.find(c => c.id === savedCat.id)
        if (category) {
            category.isOpen = savedCat.isOpen ?? false
            savedCat.items.forEach((savedItem, index) => {
            if (category.items[index]) {
                category.items[index].quantity = savedItem.quantity
            }
            })
        }
        })
    } catch (e) {
        console.error('Failed to load saved state', e)
    }
  }

  // Load History
  const savedHistory = localStorage.getItem(HISTORY_KEY)
  if (savedHistory) {
    try {
      history.value = JSON.parse(savedHistory)
    } catch (e) {
      console.error('Failed to load history', e)
    }
  }

  // Load Sync Room
  const savedRoom = localStorage.getItem(SYNC_ROOM_KEY)
  if (savedRoom) {
     connectToSync(savedRoom)
  }
  
  // Init Shift Logic & Interval
  updateShiftStatus()
  setInterval(updateShiftStatus, 60000) // update every minute
})

const sharexAction = ref('pmp') // pmp, pills, vaccine, medcert

const downloadShareXConfig = () => {
  if (!syncRoomId.value) return
  
  const config = {
    "Version": "13.6.1",
    "Name": `EMS Auto (${sharexAction.value.toUpperCase()})`,
    "DestinationType": "URLShortener",
    "RequestMethod": "GET",
    "RequestURL": `${window.location.origin}/api/sharex`,
    "Parameters": {
      "room": syncRoomId.value,
      "action": sharexAction.value
    }
  }
  
  const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `EMS_${sharexAction.value.toUpperCase()}_${syncRoomId.value}.sxcu`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="min-h-screen bg-[#0B1120] text-slate-200 selection:bg-indigo-500/30 flex flex-col items-center pt-8 pb-48 sm:pb-64 overflow-x-hidden">

    
    <!-- Copy Feedback Toast -->
    <Transition enter-active-class="transition ease-out duration-300" enter-from-class="transform translate-y-5 opacity-0" enter-to-class="transform translate-y-0 opacity-100" leave-active-class="transition ease-in duration-200" leave-from-class="opacity-100" leave-to-class="opacity-0">
      <div v-if="showCopyFeedback" class="fixed top-6 z-[60] px-4 py-2 bg-emerald-500 rounded-full shadow-lg flex items-center gap-2 pointer-events-none">
        <Check class="w-4 h-4 text-white" />
        <span class="text-sm font-bold text-white">Скопировано!</span>
      </div>
    </Transition>

    <!-- Sync Modal -->
    <Transition enter-active-class="transition ease-out duration-200" enter-from-class="opacity-0 scale-95" enter-to-class="opacity-100 scale-100" leave-active-class="transition ease-in duration-150" leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95">
      <div v-if="showSyncModal" class="fixed inset-0 z-[80] flex items-center justify-center px-4">
         <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="showSyncModal = false"></div>
         <div class="relative w-full max-w-sm bg-[#151C2C] border border-white/10 rounded-2xl p-6 shadow-2xl">
            <h2 class="text-xl font-bold text-white mb-4">Синхронизация</h2>
            <p class="text-sm text-slate-400 mb-6">Введите код комнаты, чтобы синхронизировать данные между устройствами (ПК и телефон).</p>
            
            <div class="space-y-4">
               <div>
                  <label class="block text-xs font-bold text-slate-500 uppercase mb-2">Код комнаты</label>
                  <input 
                    v-model="syncRoomId" 
                    placeholder="Пример: EMS123" 
                    class="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white font-mono text-center text-lg uppercase focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
               </div>
               
               <button @click="connectToSync(syncRoomId)" :disabled="!syncRoomId" class="w-full py-3 bg-indigo-500 hover:bg-indigo-600 rounded-xl text-white font-bold transition-colors shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed">
                 Подключиться
               </button>

               <div v-if="isSyncing" class="space-y-2 pt-2 border-t border-white/10">
                  <label class="text-xs font-bold text-slate-500 uppercase">Настройка ShareX</label>
                  <select v-model="sharexAction" class="w-full bg-[#0B1120] text-indigo-300 rounded-lg p-2 text-sm font-bold border border-indigo-500/20 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                    <option value="pmp">🚑 ПМП (First Aid)</option>
                    <option value="pills">💊 Таблетки (City)</option>
                    <option value="vaccine">💉 Вакцинация (City)</option>
                    <option value="medcert">📄 Мед. справки (City)</option>
                  </select>
                  
                  <button 
                    @click="downloadShareXConfig" 
                    class="w-full py-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                  >
                    <Cloud class="w-4 h-4" />
                    Скачать конфиг
                  </button>
               </div>

               <div class="relative py-2">
                 <div class="absolute inset-0 flex items-center"><div class="w-full border-t border-white/10"></div></div>
                 <div class="relative flex justify-center"><span class="px-2 bg-[#151C2C] text-xs text-slate-500">ИЛИ</span></div>
               </div>

               <button @click="createNewRoom" class="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl text-slate-300 font-bold transition-colors">
                 Создать новую комнату
               </button>
            </div>
            
            <button @click="showSyncModal = false" class="absolute top-4 right-4 text-slate-500 hover:text-white">
              <X class="w-5 h-5" />
            </button>
         </div>
      </div>
    </Transition>

    <!-- History Sidebar/Modal -->
    <Transition enter-active-class="transition ease-out duration-300" enter-from-class="transform translate-x-full" enter-to-class="transform translate-x-0" leave-active-class="transition ease-in duration-300" leave-from-class="transform translate-x-0" leave-to-class="transform translate-x-full">
      <div v-if="showHistory" class="fixed inset-y-0 right-0 w-80 bg-[#151C2C] border-l border-white/10 shadow-2xl z-[70] p-6 overflow-y-auto">
         <div class="flex items-center justify-between mb-6">
           <h2 class="text-xl font-bold text-white">История</h2>
           <button @click="showHistory = false" class="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white">
             <X class="w-5 h-5" />
           </button>
         </div>
         
         <div v-if="history.length === 0" class="text-center py-10 text-slate-500">
           История пуста
         </div>
         
         <div v-else class="space-y-4">
           <div v-for="(entry, idx) in history" :key="idx" class="bg-[#0B1120] rounded-xl p-4 border border-white/5">
              <div class="flex justify-between items-start mb-2">
                 <span class="text-xs text-slate-500 font-medium">{{ formatDate(entry.date) }}</span>
                 <span class="text-emerald-400 font-bold">{{ entry.total }} pts</span>
              </div>
              <div class="space-y-1">
                 <div v-for="(detail, dIdx) in entry.details" :key="dIdx" class="flex justify-between text-xs text-slate-400">
                    <span>{{ detail.name }}</span>
                    <span>{{ detail.total }}</span>
                 </div>
              </div>
           </div>
           
           <button @click="clearHistory" class="w-full py-3 mt-4 text-xs font-bold text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors">
             Очистить историю
           </button>
         </div>
      </div>
    </Transition>

    <!-- Backdrop for History -->
    <div v-if="showHistory" @click="showHistory = false" class="fixed inset-0 bg-black/50 backdrop-blur-sm z-[65]"></div>
    
    <!-- Container -->
    <div class="w-full max-w-lg px-4 flex flex-col gap-6">
      
      <!-- Header -->
      <header class="text-center mb-6 relative">
         <!-- Left: Sync Button -->
         <button 
           @click="showSyncModal = true"
           class="absolute left-0 top-4 p-3 rounded-xl transition-all border shadow-lg flex items-center gap-2"
           :class="isSyncing ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' : 'bg-[#151C2C] text-slate-400 border-white/10 hover:text-white hover:bg-indigo-500/20'"
           :title="isSyncing ? `Синхронизация: ${syncRoomId}` : 'Синхронизация'"
         >
           <Cloud class="w-6 h-6" />
           <span v-if="isSyncing" class="text-xs font-bold font-mono">{{ syncRoomId }}</span>
         </button>

         <button 
           @click="showHistory = true" 
           class="absolute right-0 top-4 p-3 rounded-xl bg-[#151C2C] text-indigo-400 hover:text-white hover:bg-indigo-500/20 transition-all border border-white/10 shadow-lg"
           title="История отчётов"
         >
           <HistoryIcon class="w-6 h-6" />
         </button>
         
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
            <div class="px-4 py-1.5 rounded-full border flex items-center gap-2 shadow-lg backdrop-blur-md transition-all duration-500"
                 :class="currentShift === 'day' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-indigo-900/40 border-indigo-500/30 text-indigo-300'">
               <Sun v-if="currentShift === 'day'" class="w-4 h-4 animate-[spin_10s_linear_infinite]" />
               <Moon v-else class="w-4 h-4" />
               <span class="text-xs font-bold">{{ shiftLabel }}</span>
            </div>

            <!-- Sync Badge -->
            <div v-if="isSyncing" class="px-3 py-1 bg-indigo-500/10 rounded-full border border-indigo-500/20 flex items-center gap-2">
               <div class="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
               <span class="text-xs text-indigo-300 font-medium">Синхронизация активна</span>
               <button @click="disconnectSync" class="ml-1 text-slate-500 hover:text-white">
                  <LogOut class="w-3 h-3" />
               </button>
            </div>
         </div>

      </header>

      <!-- Accordion List -->
      <main class="space-y-3 w-full">
        <div 
          v-for="category in categories" 
          :key="category.id"
          class="bg-[#151C2C] border border-white/5 rounded-2xl overflow-hidden shadow-lg"
          :class="{ 'ring-1 ring-indigo-500/40': category.isOpen }"
        >
          <!-- Header -->
          <button 
            @click="toggleCategory(category)"
            class="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors group cursor-pointer"
          >
            <div class="flex items-center gap-4">
              <component :is="iconComponents[category.icon]" :class="`w-6 h-6 ${category.color}`" />
              <div class="flex flex-col items-start">
                <span class="font-bold text-white text-lg leading-none mb-1">{{ category.name }}</span>
                <span v-if="!category.isOpen && getCategoryTotal(category) > 0" class="text-xs font-bold text-emerald-400">
                  +{{ getCategoryTotal(category) }} pts
                </span>
                <span v-else class="text-xs text-slate-500">Нажмите чтобы открыть</span>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <span v-if="category.isOpen" class="font-mono font-bold text-indigo-400">
                {{ getCategoryTotal(category) }}
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
               <div 
                 v-for="(item, idx) in category.items" 
                 :key="idx"
                 class="p-4 flex items-center justify-between gap-3 hover:bg-white/5 transition-colors"
               >
                 <!-- Name & Badge -->
                 <div class="flex-1 min-w-0 pr-2">
                   <p class="text-sm font-medium text-slate-300 leading-snug mb-1.5">{{ item.name }}</p>
                   <span v-if="!item.isRawPoints" class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-500 border border-white/5">
                      {{ item.points }} PTS
                   </span>
                 </div>

                 <!-- Controls -->
                 <div class="flex items-center gap-3 shrink-0">
                    <button 
                      @click="decrement(item)"
                      class="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 active:scale-95 transition-all disabled:opacity-30 disabled:active:scale-100"
                      :disabled="item.quantity <= 0"
                    >
                      <Minus class="w-4 h-4" />
                    </button>
                    
                    <div class="w-12">
                      <input
                        type="number"
                        v-model.number="item.quantity"
                        min="0"
                        @click.stop
                        class="w-full bg-transparent text-center font-bold text-white text-lg tabular-nums focus:outline-none focus:ring-1 focus:ring-white/20 rounded px-0 py-0.5 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>

                    <button 
                      @click="increment(item)" 
                      class="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 active:scale-95 transition-all"
                    >
                      <Plus class="w-4 h-4" />
                    </button>
                 </div>
               </div>
             </div>
          </div>
        </div>
      </main>

      <!-- Spacer for Footer -->
      <div class="h-24 md:h-32 w-full"></div>
    </div>

    <!-- Floating Footer -->
    <div class="fixed bottom-6 left-0 right-0 z-50 px-4 flex justify-center pointer-events-none">
      <div class="w-full max-w-lg bg-[#1A2234]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-2 relative flex items-center justify-center pointer-events-auto min-h-[72px]">
         
         <!-- Copy Button (Absolute Left) -->
         <button 
           @click="copyReport"
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
           @click="resetAll"
           class="absolute right-2 p-3 rounded-xl bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 font-bold transition-all active:scale-95 flex items-center gap-2"
           title="Сбросить всё (в архив)"
         >
           <Check class="w-5 h-5" />
         </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Clean scrollbar */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: #334155;
  border-radius: 3px;
}
</style>
