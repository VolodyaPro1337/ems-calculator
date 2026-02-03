import type { Category, CategoryItem } from '@/types'

export const formatDate = (isoString: string): string => {
  return new Date(isoString).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const getSubtotal = (item: CategoryItem): number => {
  return item.isRawPoints ? item.quantity : item.quantity * item.points
}

export const getCategoryTotal = (category: Category): number => {
  return category.items.reduce((sum, item) => sum + getSubtotal(item), 0)
}

export const formatReport = (categories: Category[], grandTotal: number): string => {
  const date = new Date().toLocaleDateString('ru-RU')
  let text = `📅 Отчёт за ${date}\n`
  text += `------------------\n`
  
  categories.forEach(cat => {
    const total = getCategoryTotal(cat)
    if (total > 0) {
      text += `${cat.name}: ${total} pts\n`
      cat.items.forEach(item => {
        if (item.quantity > 0) {
          text += `  • ${item.name}: ${item.quantity} шт (${getSubtotal(item)} pts)\n`
        }
      })
      text += `\n`
    }
  })
  
  text += `------------------\n`
  text += `🏆 ИТОГО: ${grandTotal} очков`
  
  return text
}
