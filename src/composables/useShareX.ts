import { ref } from 'vue'

export function useShareX(syncRoomId: { value: string }) {
  const sharexAction = ref<'pmp' | 'pills' | 'vaccine' | 'medcert'>('pmp')

  const downloadShareXConfig = () => {
    if (!syncRoomId.value) return


    // Calculate current shift and index logic (Ported from Serverless API)
    // UTC+3 (Moscow)
    const now = new Date()
    const utcOffset = 3
    const localHookHour = new Date(now.getTime() + utcOffset * 3600000).getUTCHours()
    const localHookDay = new Date(now.getTime() + utcOffset * 3600000).getUTCDay()

    // Rules:
    // Mon-Fri (1-5): Day 10-20, else Night
    // Sat-Sun (6,0): Day 12-20, else Night
    const isWeekend = localHookDay === 0 || localHookDay === 6
    let isDay = false

    if (isWeekend) {
      if (localHookHour >= 12 && localHookHour < 20) isDay = true
    } else {
      if (localHookHour >= 10 && localHookHour < 20) isDay = true
    }

    // Map action to Category & Index
    let catId = ''
    let itemIndex = 0
    const cityIndex = isDay ? 0 : 1

    switch (sharexAction.value) {
      case 'pmp':
        catId = 'firstaid'
        itemIndex = isDay ? 0 : 1
        break
      case 'pills':
        catId = 'pills'
        itemIndex = cityIndex
        break
      case 'vaccine':
        catId = 'vaccination'
        itemIndex = cityIndex
        break
      case 'medcert':
        catId = 'certificates'
        itemIndex = cityIndex
        break
    }

    const config = {
      Version: '13.6.1',
      Name: `EMS Auto (${sharexAction.value.toUpperCase()})`,
      DestinationType: 'ImageUploader',
      RequestMethod: 'POST',
      RequestURL: `http://localhost:3000/upload`,
      Body: 'MultipartFormData',
      FileFormName: 'image',
      Arguments: {
        room: syncRoomId.value,
        catId: catId,
        itemIndex: String(itemIndex)
      },
      URL: '$json:url$'
    }

    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `EMS_${sharexAction.value.toUpperCase()}_${syncRoomId.value}.sxcu`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return {
    sharexAction,
    downloadShareXConfig
  }
}
