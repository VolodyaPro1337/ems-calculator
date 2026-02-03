<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

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
import AlbumView from '@/components/album/AlbumView.vue'

const currentTab = ref<'calculator' | 'album'>('calculator')

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
const { isSyncing, syncRoomId, isAuditMode, nickname, staticId } = sync
const { history, showHistory, loadHistory, addEntry, clearHistory } = useHistory()
const { currentShift, shiftLabel } = useShift()
const { showCopyFeedback, copyReport } = useClipboard()

const handleCopyAuditLink = () => {
  const url = `${window.location.origin}/?room=${syncRoomId.value}&audit=true`
  navigator.clipboard.writeText(url).then(() => {
    // We can reuse showCopyFeedback from useClipboard
    showCopyFeedback.value = true
    setTimeout(() => showCopyFeedback.value = false, 2000)
  })
}

const { sharexAction, downloadShareXConfig } = useShareX(syncRoomId)

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
        :is-syncing="isSyncing"
        :sync-room-id="syncRoomId"
        :is-audit-mode="isAuditMode"
        :nickname="nickname"
        :static-id="staticId"
        :grand-total="grandTotal"
        @open-sync="sync.showSyncModal.value = true"
        @open-history="showHistory = true"
        @disconnect="sync.disconnectSync"
        @copy-audit-link="handleCopyAuditLink"
      />

      <!-- Tab Navigation -->
      <div class="flex p-1 bg-[#151C2C] border border-white/5 rounded-xl">
        <button 
          @click="currentTab = 'calculator'"
          :class="[
            'flex-1 py-3 text-sm font-bold rounded-lg transition-all',
            currentTab === 'calculator' 
              ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
              : 'text-slate-500 hover:text-slate-300'
          ]"
        >
          Калькулятор
        </button>
        <button 
          @click="currentTab = 'album'"
          :class="[
            'flex-1 py-3 text-sm font-bold rounded-lg transition-all',
            currentTab === 'album' 
              ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
              : 'text-slate-500 hover:text-slate-300'
          ]"
        >
          Альбом
        </button>
      </div>

      <!-- Views -->
      <div v-if="currentTab === 'calculator'">
        <CategoryList
          :categories="categories"
          :disabled="isAuditMode"
          @toggle="toggleCategory"
          @increment="increment"
          @decrement="decrement"
        />
      </div>

      <div v-else>
        <AlbumView :room-id="syncRoomId" />
      </div>

      <!-- Spacer for Footer -->
      <div class="h-24 md:h-32 w-full"></div>
    </div>

    <!-- Footer -->
    <AppFooter
      v-if="!isAuditMode"
      :grand-total="grandTotal"
      :show-copy-feedback="showCopyFeedback"
      @copy="handleCopy"
      @reset="handleReset"
    />

    <!-- Modals -->
    <SyncModal
      v-model="sync.showSyncModal.value"
      :sync-room-id="syncRoomId"
      :is-syncing="isSyncing"
      :sharex-action="sharexAction"
      @update:sync-room-id="syncRoomId = $event"
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
