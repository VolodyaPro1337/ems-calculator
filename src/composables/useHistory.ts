import { ref } from 'vue'
import type { HistoryEntry, Category } from '@/types'
import { STORAGE_KEYS } from '@/utils/constants'
import { getCategoryTotal } from '@/utils/formatters'

export function useHistory() {
  const history = ref<HistoryEntry[]>([])
  const showHistory = ref(false)

  const loadHistory = () => {
    const saved = localStorage.getItem(STORAGE_KEYS.HISTORY)
    if (!saved) return

    try {
      history.value = JSON.parse(saved)
    } catch (e) {
      console.error('Failed to load history', e)
    }
  }

  const saveHistory = () => {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history.value))
  }

  const addEntry = (total: number, categories: Category[]) => {
    if (total === 0) return

    const entry: HistoryEntry = {
      date: new Date().toISOString(),
      total,
      details: categories
        .filter(c => getCategoryTotal(c) > 0)
        .map(c => ({
          name: c.name,
          total: getCategoryTotal(c)
        }))
    }

    history.value.unshift(entry)
    saveHistory()
  }

  const clearHistory = () => {
    if (confirm('Очистить всю историю?')) {
      history.value = []
      localStorage.removeItem(STORAGE_KEYS.HISTORY)
    }
  }

  return {
    history,
    showHistory,
    loadHistory,
    addEntry,
    clearHistory
  }
}
