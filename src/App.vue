<script setup lang="ts">
import { onMounted } from 'vue'

// Composables
import { useCategories } from '@/composables/useCategories'
import { useSync } from '@/composables/useSync'
import { useHistory } from '@/composables/useHistory'
import { useShift } from '@/composables/useShift'
import { useClipboard } from '@/composables/useClipboard'

// Components
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import CategoryList from '@/components/calculator/CategoryList.vue'
import SyncModal from '@/components/modals/SyncModal.vue'
import HistorySidebar from '@/components/modals/HistorySidebar.vue'
import GuideSidebar from '@/components/modals/GuideSidebar.vue'

import { ref } from 'vue'

const showGuide = ref(false)

// Initialize composables
const {
  categories,
  grandTotal,
  loadState,
  saveState,
  increment,
  decrement,
  setQuantity,
  toggleCategory,
  resetAll
} = useCategories()

const sync = useSync(categories, saveState)
const { history, showHistory, loadHistory, addEntry, clearHistory } = useHistory()
const { currentShift, shiftLabel } = useShift()
const { showCopyFeedback, copyReport } = useClipboard()

// Reset with history save
const handleReset = () => {
  if (grandTotal.value > 0) {
    if (confirm('Сохранить результат в историю перед сбросом?')) {
      addEntry(grandTotal.value, categories.value)
    } else {
      if (!confirm('Вы уверены, что хотите сбросить без сохранения?')) return
    }
  }
  resetAll()
}

// Copy handler
const handleCopy = () => {
  copyReport(categories.value, grandTotal.value)
}

// Lifecycle
onMounted(() => {
  loadState()
  loadHistory()
  sync.initSync()
  sync.setupWatcher()
})
</script>

<template>
  <div class="min-h-screen bg-[#0B1120] text-slate-200 selection:bg-indigo-500/30 flex flex-col items-center pt-8 pb-48 sm:pb-64 overflow-x-hidden">
    
    <!-- Container -->
    <div class="w-full max-w-lg px-4 flex flex-col gap-6">
      
      <!-- Header -->
      <AppHeader
        :current-shift="currentShift"
        :shift-label="shiftLabel"
        :is-syncing="sync.isSyncing.value"
        :sync-room-id="sync.syncRoomId.value"
        @open-sync="sync.showSyncModal.value = true"
        @open-history="showHistory = true"
        @open-guide="showGuide = true"
        @disconnect="sync.disconnectSync"
      />

      <!-- Category List -->
      <CategoryList
        :categories="categories"
        @toggle="toggleCategory"
        @increment="increment"
        @decrement="decrement"
        @update-quantity="setQuantity"
      />

      <!-- Spacer for Footer -->
      <div class="h-24 md:h-32 w-full flex flex-col items-center">
        <!-- Developer Tag -->
        <div class="flex items-center gap-5 px-8 py-4 bg-[#151C2C] rounded-2xl border border-white/10 shadow-2xl hover:scale-105 transition-transform duration-300 cursor-default">
          <div class="flex flex-col">
            <span class="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] leading-none mb-1.5">Developed by</span>
            <span class="text-sm font-bold text-white leading-none">Billy Kitsune</span>
          </div>
          <div class="w-px h-8 bg-white/10"></div>
          <div class="flex flex-col items-end">
            <span class="text-xs font-mono text-indigo-400 leading-none mb-1.5">#213363</span>
            <span class="text-[10px] font-black text-slate-500 uppercase leading-none">EMS 6</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <AppFooter
      :grand-total="grandTotal"
      :show-copy-feedback="showCopyFeedback"
      @copy="handleCopy"
      @reset="handleReset"
    />

    <!-- Modals -->
    <SyncModal
      v-model="sync.showSyncModal.value"
      :sync-room-id="sync.syncRoomId.value"
      :is-syncing="sync.isSyncing.value"
      @update:sync-room-id="sync.syncRoomId.value = $event"
      @connect="sync.connectToSync"
      @disconnect="sync.disconnectSync"
      @create-room="sync.createNewRoom"
    />

    <HistorySidebar
      v-model="showHistory"
      :history="history"
      @clear="clearHistory"
    />

    <GuideSidebar
      v-model="showGuide"
    />

    <!-- Credits Block -->
    <div class="fixed bottom-4 right-4 opacity-30 hover:opacity-90 transition-opacity duration-500 z-10">
      <div class="bg-[#0B1120]/80 backdrop-blur-sm rounded-xl border border-white/5 p-3 space-y-1.5">
        <!-- Bill Bob - главный -->
        <div class="flex items-center justify-between gap-4 group">
          <span class="text-[10px] font-bold text-amber-400 group-hover:animate-pulse">Bill Bob</span>
          <span class="text-[9px] font-mono text-amber-400/70">#213389</span>
        </div>
        <!-- Sara Sowiet - второй -->
        <div class="flex items-center justify-between gap-4">
          <span class="text-[9px] font-medium text-slate-400">Sara Sowiet</span>
          <span class="text-[8px] font-mono text-slate-500">#191913</span>
        </div>
        <!-- Stepan Soul - минимум -->
        <div class="flex items-center justify-between gap-4">
          <span class="text-[8px] text-slate-600">Stepan Soul</span>
          <span class="text-[7px] font-mono text-slate-700">#212386</span>
        </div>
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
