import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { ShiftType } from '@/types'

export function useShift() {
  const currentShift = ref<ShiftType>('day')

  const shiftLabel = computed(() =>
    currentShift.value === 'day' ? 'Дневная смена' : 'Ночная смена'
  )

  const updateShiftStatus = () => {
    const now = new Date()
    const day = now.getDay() // 0 = Sun, 6 = Sat
    const hour = now.getHours()

    const isWeekend = day === 0 || day === 6

    if (isWeekend) {
      // Weekend Day: 12:00 - 20:00
      currentShift.value = (hour >= 12 && hour < 20) ? 'day' : 'night'
    } else {
      // Weekday Day: 10:00 - 20:00
      currentShift.value = (hour >= 10 && hour < 20) ? 'day' : 'night'
    }
  }

  let interval: ReturnType<typeof setInterval> | null = null

  onMounted(() => {
    updateShiftStatus()
    interval = setInterval(updateShiftStatus, 60000)
  })

  onUnmounted(() => {
    if (interval) clearInterval(interval)
  })

  return {
    currentShift,
    shiftLabel,
    updateShiftStatus
  }
}
