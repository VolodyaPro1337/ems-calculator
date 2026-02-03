export const STORAGE_KEYS = {
  STATE: 'ems-calculator-state',
  HISTORY: 'ems-calculator-history',
  SYNC_ROOM: 'ems-calculator-sync-room'
} as const

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS]
