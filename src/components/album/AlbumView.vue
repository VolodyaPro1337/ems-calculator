<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { Cloud, Folder, Image as ImageIcon, ChevronDown, ChevronRight, Loader2 } from 'lucide-vue-next'

const props = defineProps<{
  roomId: string
}>()

const isLoading = ref(false)
const error = ref('')
const albumData = ref<any>(null)
const expandedCategories = ref<Record<string, boolean>>({})

// Fetch album data from our new Express server
const fetchAlbum = async () => {
  if (!props.roomId) return
  
  isLoading.value = true
  error.value = ''
  
  try {
    const res = await fetch(`http://localhost:3000/albums/${props.roomId}`)
    const data = await res.json()
    albumData.value = data.tree
  } catch (e) {
    error.value = 'Failed to load album. Is the server running?'
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
    <!-- Header / Status -->
    <div class="mb-6 bg-[#151C2C] border border-white/5 rounded-2xl p-6">
      <div class="flex items-center gap-4">
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
      <div v-if="isLoading" class="mt-4 flex justify-center py-8">
        <Loader2 class="w-8 h-8 text-indigo-400 animate-spin" />
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="mt-4 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm">
        {{ error }}
      </div>

      <!-- Empty State -->
      <div v-else-if="!albumData || Object.keys(albumData).length === 0" class="mt-4 text-center py-8 text-slate-500 text-sm">
        <div v-if="!roomId">Подключитесь к комнате, чтобы видеть альбом</div>
        <div v-else>В этой комнате пока нет скриншотов</div>
      </div>
    </div>

    <!-- Album Tree -->
    <div v-if="albumData" class="space-y-4">
      <div v-for="(items, catId) in albumData" :key="catId" class="bg-[#151C2C] border border-white/5 rounded-2xl overflow-hidden">
        <!-- Category Header -->
        <button 
          @click="toggleCategory(catId)"
          class="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
        >
          <div class="flex items-center gap-3">
             <span class="font-bold text-slate-200 capitalize">{{ catId }}</span>
             <span class="px-2 py-0.5 bg-white/5 rounded text-[10px] text-slate-400">{{ Object.keys(items).length }} items</span>
          </div>
          <component :is="expandedCategories[catId] ? ChevronDown : ChevronRight" class="w-5 h-5 text-slate-500" />
        </button>

        <!-- Category Content -->
        <div v-if="expandedCategories[catId]" class="border-t border-white/5 bg-[#0B1120]/50 p-4 space-y-6">
           <div v-for="(images, itemIdx) in items" :key="String(itemIdx)">
              <h4 class="text-xs font-bold text-slate-500 mb-3 px-1 uppercase tracking-wider">Пункт #{{ itemIdx }}</h4>
              
              <!-- Gallery Grid -->
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                 <div 
                   v-for="imgUrl in images" 
                   :key="imgUrl" 
                   class="group relative aspect-video bg-black/40 rounded-lg overflow-hidden border border-white/5 hover:border-indigo-500/50 transition-colors"
                 >
                    <img 
                      :src="`http://localhost:3000${imgUrl}`" 
                      loading="lazy" 
                      class="w-full h-full object-cover"
                    />
                    <div class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <!-- Actions could go here (Open Fullscreen) -->
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  </div>
</template>
