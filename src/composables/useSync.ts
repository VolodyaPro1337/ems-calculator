import { ref, nextTick, watch, type Ref } from 'vue'
import { ref as dbRef, onValue, set, type Unsubscribe } from 'firebase/database'
import { db } from '@/lib/firebase'
import type { Category } from '@/types'
import { STORAGE_KEYS } from '@/utils/constants'

interface SyncCategory {
  id: string
  isOpen?: boolean
  items: { name: string; quantity: number }[]
}

export function useSync(categories: Ref<Category[]>, saveState: () => void) {
  const syncRoomId = ref('')
  const isSyncing = ref(false)
  const isRemoteUpdate = ref(false)
  const showSyncModal = ref(false)

  let unsubscribe: Unsubscribe | null = null

  const connectToSync = (roomId: string) => {
    if (!roomId) return

    // Cleanup previous
    if (unsubscribe) {
      unsubscribe()
      unsubscribe = null
    }

    isSyncing.value = true
    syncRoomId.value = roomId.toUpperCase().trim()
    localStorage.setItem(STORAGE_KEYS.SYNC_ROOM, syncRoomId.value)
    showSyncModal.value = false

    const roomRef = dbRef(db, 'rooms/' + syncRoomId.value)

    unsubscribe = onValue(roomRef, (snapshot) => {
      const data = snapshot.val() as SyncCategory[] | null
      if (!data) return

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

      nextTick(() => {
        isRemoteUpdate.value = false
      })
    })
  }

  const disconnectSync = () => {
    if (unsubscribe) {
      unsubscribe()
      unsubscribe = null
    }

    isRemoteUpdate.value = true
    isSyncing.value = false
    syncRoomId.value = ''
    localStorage.removeItem(STORAGE_KEYS.SYNC_ROOM)
    setTimeout(() => isRemoteUpdate.value = false, 500)
  }

  const createNewRoom = () => {
    const newId = Math.random().toString(36).substring(2, 8).toUpperCase()
    connectToSync(newId)
  }

  const setupWatcher = () => {
    watch(categories, (newVal) => {
      // Local persistence
      saveState()

      // Remote sync
      if (isSyncing.value && !isRemoteUpdate.value) {
        const roomRef = dbRef(db, 'rooms/' + syncRoomId.value)
        const state = newVal.map(cat => ({
          id: cat.id,
          isOpen: cat.isOpen,
          items: cat.items.map(item => ({
            name: item.name,
            quantity: item.quantity
          }))
        }))
        set(roomRef, state).catch(e => console.error('Sync error:', e))
      }
    }, { deep: true })
  }

  const initSync = () => {
    const savedRoom = localStorage.getItem(STORAGE_KEYS.SYNC_ROOM)
    if (savedRoom) {
      connectToSync(savedRoom)
    }
  }

  return {
    syncRoomId,
    isSyncing,
    isRemoteUpdate,
    showSyncModal,
    connectToSync,
    disconnectSync,
    createNewRoom,
    setupWatcher,
    initSync
  }
}
