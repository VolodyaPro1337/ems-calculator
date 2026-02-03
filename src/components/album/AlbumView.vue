<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import { Cloud, Folder, ChevronDown, ChevronRight, Loader2 } from 'lucide-vue-next'
import { categoriesData } from '@/data/categories'
import * as Icons from 'lucide-vue-next'

const props = defineProps<{
  roomId: string
}>()

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const isLoading = ref(false)
const error = ref('')
const albumData = ref<any>(null)
const expandedCategories = ref<Record<string, boolean>>({})

// Filter out unwanted categories
const visibleCategories = computed(() => {
  return categoriesData.filter(cat => 
    !['patrols', 'events', 'highcommand'].includes(cat.id)
  )
})

// Fetch album data from our new Express server
const fetchAlbum = async () => {
  if (!props.roomId) return
  
  isLoading.value = true
  error.value = ''
  
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
    const res = await fetch(`${apiUrl}/albums/${props.roomId}`)
    const data = await res.json()
    albumData.value = data.tree || {}
  } catch (e) {
    error.value = 'Сервер недоступен. Запустите node server/index.js'
    console.error(e)
  } finally {
    isLoading.value = false
  }
}

// Toggle accordion
const toggleCategory = (catId: string) => {
  expandedCategories.value[catId] = !expandedCategories.value[catId]
}

watch(() => props.roomId, fetchAlbum)
onMounted(fetchAlbum)
</script>

<template>
  <div class="w-full text-slate-200">
    <!-- Main Container Card -->
    <div class="bg-[#151C2C] border border-white/5 rounded-2xl overflow-hidden">
      
      <!-- Header Section -->
      <div class="p-6 border-b border-white/5 flex items-center gap-4">
        <div class="p-3 bg-indigo-500/10 rounded-xl">
          <Folder class="w-6 h-6 text-indigo-400" />
        </div>
        <div>
          <h2 class="text-lg font-bold text-white">Альбом: {{ roomId || 'Не выбран' }}</h2>
          <p class="text-xs text-slate-400">Скриншоты с ваших дежурств</p>
        </div>
        <button 
          v-if="roomId"
          @click="fetchAlbum" 
          class="ml-auto p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors"
          title="Обновить"
        >
          <Cloud class="w-5 h-5" />
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center py-12">
        <Loader2 class="w-8 h-8 text-indigo-400 animate-spin" />
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="p-6">
        <div class="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm">
          {{ error }}
        </div>
      </div>

      <!-- Empty State: Connect Prompt -->
      <div v-else-if="!roomId" class="p-8 text-center text-slate-500 text-sm">
        Подключитесь к комнате, чтобы видеть альбом
      </div>

      <!-- Album Tree (Accordions) -->
      <div v-else class="divide-y divide-white/5">
        <div 
          v-for="cat in visibleCategories" 
          :key="cat.id" 
          class="bg-transparent"
        >
          <!-- Category Header -->
          <button 
            @click="toggleCategory(cat.id)"
            class="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
          >
            <div class="flex items-center gap-3">
               <!-- Dynamic Icon -->
               <component 
                  :is="(Icons as any)[cat.icon]" 
                  :class="['w-5 h-5', cat.color]" 
               />
               <span class="font-bold text-slate-200">{{ cat.name }}</span>
               
               <!-- Counter (from Server Data) -->
               <span class="px-2 py-0.5 bg-white/5 rounded text-[10px] text-slate-400">
                  {{ albumData && albumData[cat.id] ? Object.keys(albumData[cat.id]).length : 0 }} items
               </span>
            </div>
            <component :is="expandedCategories[cat.id] ? ChevronDown : ChevronRight" class="w-5 h-5 text-slate-500" />
          </button>


          <!-- Category Content -->
          <div v-if="expandedCategories[cat.id]" class="border-t border-white/5 bg-[#0B1120]/30 p-4 space-y-8">
             <!-- If no data on server -->
             <div v-if="!albumData || !albumData[cat.id]" class="text-center py-4 text-xs text-slate-500">
               Нет загруженных скриншотов в этой категории
             </div>

             <!-- Iterate over Calculator Items to maintain order/names -->
             <div 
               v-else
               v-for="(item, itemIdx) in cat.items" 
               :key="itemIdx"
             >
                <!-- Show item ONLY if it has images on server -->
                <div v-if="albumData[cat.id][itemIdx] && albumData[cat.id][itemIdx].length > 0">
                    <h4 class="text-xs font-bold text-slate-500 mb-3 px-1 uppercase tracking-wider flex justify-between items-center">
                      {{ item.name }}
                      <span class="text-[10px] bg-indigo-500/10 text-indigo-400 px-1.5 rounded">{{ albumData[cat.id][itemIdx].length }} фото</span>
                    </h4>
                    
                    <!-- Gallery Grid -->
                    <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                       <div 
                         v-for="imgUrl in albumData[cat.id][itemIdx]" 
                         :key="imgUrl as string" 
                         class="group relative aspect-video bg-black/40 rounded-lg overflow-hidden border border-white/5 hover:border-indigo-500/50 transition-colors"
                       >
                          <img 
                            :src="`${apiUrl}${imgUrl}`" 
                            loading="lazy" 
                            class="w-full h-full object-cover"
                          />
                          <div class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                             <a :href="`${apiUrl}${imgUrl}`" target="_blank" class="text-white text-xs font-bold underline">Открыть</a>
                          </div>
                       </div>
                    </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
