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

interface RoomData {
  metadata?: {
    nickname: string
    staticId: string
  }
  data: SyncCategory[]
}

export function useSync(categories: Ref<Category[]>, saveState: () => void) {
  const syncRoomId = ref('')
  const isSyncing = ref(false)
  const isRemoteUpdate = ref(false)
  const showSyncModal = ref(false)
  
  const isAuditMode = ref(false)
  const nickname = ref('')
  const staticId = ref('')

  let unsubscribe: Unsubscribe | null = null

  const connectToSync = (roomId: string, audit = false) => {
    if (!roomId) return

    if (unsubscribe) {
      unsubscribe()
      unsubscribe = null
    }

    isSyncing.value = true
    isAuditMode.value = audit
    syncRoomId.value = roomId.toUpperCase().trim()
    
    if (!audit) {
      localStorage.setItem(STORAGE_KEYS.SYNC_ROOM, syncRoomId.value)
    }
    
    showSyncModal.value = false

    const roomRef = dbRef(db, 'rooms/' + syncRoomId.value)

    unsubscribe = onValue(roomRef, (snapshot) => {
      const roomRaw = snapshot.val()
      if (!roomRaw) return

      // Handle both old (array) and new (object) structures
      const remoteData = Array.isArray(roomRaw) ? roomRaw : roomRaw.data
      const metadata = !Array.isArray(roomRaw) ? roomRaw.metadata : null

      if (metadata) {
        nickname.value = metadata.nickname
        staticId.value = metadata.staticId
      }

      if (remoteData) {
        isRemoteUpdate.value = true
        remoteData.forEach((remoteCat: SyncCategory) => {
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
      }
    })
  }

  const disconnectSync = () => {
    if (unsubscribe) {
      unsubscribe()
      unsubscribe = null
    }

    isRemoteUpdate.value = true
    isSyncing.value = false
    isAuditMode.value = false
    syncRoomId.value = ''
    nickname.value = ''
    staticId.value = ''
    localStorage.removeItem(STORAGE_KEYS.SYNC_ROOM)
    setTimeout(() => isRemoteUpdate.value = false, 500)
  }

  const createNewRoom = (meta: { nickname: string, staticId: string }) => {
    const newId = Math.random().toString(36).substring(2, 8).toUpperCase()
    
    const state = categories.value.map(cat => ({
      id: cat.id,
      isOpen: cat.isOpen,
      items: cat.items.map(item => ({
        name: item.name,
        quantity: item.quantity
      }))
    }))

    const roomRef = dbRef(db, 'rooms/' + newId)
    set(roomRef, {
      metadata: {
        nickname: meta.nickname,
        staticId: meta.staticId,
        createdAt: Date.now()
      },
      data: state
    }).then(() => {
      connectToSync(newId)
    })
  }

  const setupWatcher = () => {
    watch(categories, (newVal) => {
      saveState()

      // Block updates in audit mode or if it's a remote update
      if (isSyncing.value && !isRemoteUpdate.value && !isAuditMode.value) {
        const roomRef = dbRef(db, 'rooms/' + syncRoomId.value + '/data')
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
    // Check URL params first
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    
    let urlRoom = params.get('room')
    let urlAudit = params.get('audit') === 'true'

    // Decode token if exists
    if (token) {
      try {
        const decoded = atob(token)
        const tokenParams = new URLSearchParams(decoded)
        urlRoom = tokenParams.get('room')
        urlAudit = tokenParams.get('audit') === 'true'
      } catch (e) {
        console.error('Invalid audit token')
      }
    }

    if (urlRoom) {
      connectToSync(urlRoom, urlAudit)
      // Clean URL without refresh
      const newUrl = window.location.origin + window.location.pathname
      window.history.replaceState({}, document.title, newUrl)
    } else {
      const savedRoom = localStorage.getItem(STORAGE_KEYS.SYNC_ROOM)
      if (savedRoom) {
        connectToSync(savedRoom)
      }
    }
  }

  return {
    syncRoomId,
    isSyncing,
    isRemoteUpdate,
    showSyncModal,
    isAuditMode,
    nickname,
    staticId,
    connectToSync,
    disconnectSync,
    createNewRoom,
    setupWatcher,
    initSync
  }
}
