import { ref } from 'vue'
import type { Category } from '@/types'
import { formatReport } from '@/utils/formatters'

export function useClipboard() {
  const showCopyFeedback = ref(false)

  const copyReport = async (categories: Category[], grandTotal: number) => {
    const text = formatReport(categories, grandTotal)

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text)
      } else {
        // Fallback
        const textArea = document.createElement('textarea')
        textArea.value = text
        textArea.style.position = 'fixed'
        textArea.style.left = '-9999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        try {
          document.execCommand('copy')
        } catch (err) {
          console.error('Fallback copy failed', err)
          alert('Не удалось скопировать. Попробуйте вручную.')
          return
        }
        document.body.removeChild(textArea)
      }

      showCopyFeedback.value = true
      setTimeout(() => showCopyFeedback.value = false, 2000)
    } catch (err) {
      console.error('Failed to copy', err)
      alert('Не удалось скопировать. Проверьте разрешения браузера.')
    }
  }

  return {
    showCopyFeedback,
    copyReport
  }
}
