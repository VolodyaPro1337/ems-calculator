<script setup lang="ts">
import { onMounted } from 'vue'

// Composables
import { useCategories } from '@/composables/useCategories'
import { useSync } from '@/composables/useSync'
import { useHistory } from '@/composables/useHistory'
import { useShift } from '@/composables/useShift'
import { useClipboard } from '@/composables/useClipboard'
import { useShareX } from '@/composables/useShareX'

// Components
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import CategoryList from '@/components/calculator/CategoryList.vue'
import SyncModal from '@/components/modals/SyncModal.vue'
import HistorySidebar from '@/components/modals/HistorySidebar.vue'

// Initialize composables
const {
  categories,
  grandTotal,
  loadState,
  saveState,
  increment,
  decrement,
  toggleCategory,
  resetAll
} = useCategories()

const sync = useSync(categories, saveState)
const { history, showHistory, loadHistory, addEntry, clearHistory } = useHistory()
const { currentShift, shiftLabel } = useShift()
const { showCopyFeedback, copyReport } = useClipboard()
const { sharexAction, downloadShareXConfig } = useShareX(sync.syncRoomId)

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
        @disconnect="sync.disconnectSync"
      />

      <!-- Category List -->
      <CategoryList
        :categories="categories"
        @toggle="toggleCategory"
        @increment="increment"
        @decrement="decrement"
      />

      <!-- Spacer for Footer -->
      <div class="h-24 md:h-32 w-full"></div>
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
      :sharex-action="sharexAction"
      @update:sync-room-id="sync.syncRoomId.value = $event"
      @update:sharex-action="sharexAction = $event"
      @connect="sync.connectToSync"
      @disconnect="sync.disconnectSync"
      @create-room="sync.createNewRoom"
      @download-config="downloadShareXConfig"
    />

    <HistorySidebar
      v-model="showHistory"
      :history="history"
      @clear="clearHistory"
    />
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
