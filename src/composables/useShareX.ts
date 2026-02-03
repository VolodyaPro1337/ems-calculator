import { ref } from 'vue'

export function useShareX(syncRoomId: { value: string }) {
  const sharexAction = ref<'pmp' | 'pills' | 'vaccine' | 'medcert'>('pmp')

  const downloadShareXConfig = () => {
    if (!syncRoomId.value) return

    const config = {
      Version: '13.6.1',
      Name: `EMS Auto (${sharexAction.value.toUpperCase()})`,
      DestinationType: 'ImageUploader',
      RequestMethod: 'POST',
      RequestURL: `${window.location.origin}/api/sharex`,
      Body: 'MultipartFormData',
      FileFormName: 'image',
      Arguments: {
        room: syncRoomId.value,
        action: sharexAction.value
      },
      URL: '$json:message$'
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
