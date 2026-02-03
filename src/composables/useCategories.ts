import { ref, computed, type Ref } from 'vue'
import type { Category, CategoryItem } from '@/types'
import { categoriesData } from '@/data/categories'
import { STORAGE_KEYS } from '@/utils/constants'
import { getSubtotal, getCategoryTotal } from '@/utils/formatters'

interface SavedCategory {
  id: string
  isOpen?: boolean
  items: { name: string; quantity: number }[]
}

export function useCategories() {
  const categories: Ref<Category[]> = ref(JSON.parse(JSON.stringify(categoriesData)))

  const grandTotal = computed(() => {
    return categories.value.reduce((sum, cat) => sum + getCategoryTotal(cat), 0)
  })

  const loadState = () => {
    const saved = localStorage.getItem(STORAGE_KEYS.STATE)
    if (!saved) return

    try {
      const parsed: SavedCategory[] = JSON.parse(saved)
      parsed.forEach(savedCat => {
        const category = categories.value.find(c => c.id === savedCat.id)
        if (category) {
          category.isOpen = savedCat.isOpen ?? false
          savedCat.items.forEach((savedItem, index) => {
            if (category.items[index]) {
              category.items[index].quantity = savedItem.quantity
            }
          })
        }
      })
    } catch (e) {
      console.error('Failed to load saved state', e)
    }
  }

  const saveState = () => {
    const state = categories.value.map(cat => ({
      id: cat.id,
      isOpen: cat.isOpen,
      items: cat.items.map(item => ({
        name: item.name,
        quantity: item.quantity
      }))
    }))
    localStorage.setItem(STORAGE_KEYS.STATE, JSON.stringify(state))
  }

  const increment = (item: CategoryItem) => {
    item.quantity++
    saveState()
  }

  const decrement = (item: CategoryItem) => {
    if (item.quantity > 0) {
      item.quantity--
      saveState()
    }
  }

  const toggleCategory = (category: Category) => {
    category.isOpen = !category.isOpen
    saveState()
  }

  const resetAll = (skipSave = false) => {
    categories.value.forEach(cat => {
      cat.items.forEach(item => {
        item.quantity = 0
      })
    })
    if (!skipSave) saveState()
  }

  return {
    categories,
    grandTotal,
    getSubtotal,
    getCategoryTotal,
    loadState,
    saveState,
    increment,
    decrement,
    toggleCategory,
    resetAll
  }
}
