export interface CategoryItem {
  name: string
  points: number
  quantity: number
  isRawPoints?: boolean
}

export interface Category {
  id: string
  name: string
  icon: string
  color: string
  isOpen?: boolean
  isManual?: boolean
  items: CategoryItem[]
}

export interface HistoryEntry {
  date: string
  total: number
  details: {
    name: string
    total: number
  }[]
}

export type ShiftType = 'day' | 'night'

export interface SyncState {
  roomId: string
  isSyncing: boolean
  isRemoteUpdate: boolean
  isAuditMode: boolean
  nickname?: string
  staticId?: string
}

export interface Proof {
  id: string
  url: string
  timestamp: string
  action: string
  shift: ShiftType
  itemName: string
}
