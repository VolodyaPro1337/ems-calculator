import { ref, type Ref } from 'vue'
import { ref as dbRef, onValue, remove, type Unsubscribe } from 'firebase/database'
import { db } from '@/lib/firebase'
import type { Proof } from '@/types'

export function useProofs(syncRoomId: Ref<string>) {
  const proofs = ref<Proof[]>([])
  const showProofs = ref(false)
  let unsubscribe: Unsubscribe | null = null

  const listenToProofs = (roomId: string) => {
    if (unsubscribe) unsubscribe()
    
    const proofsRef = dbRef(db, `proofs/${roomId}`)
    unsubscribe = onValue(proofsRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        // Convert object to array and sort by timestamp desc
        const list = Object.entries(data).map(([id, val]: [string, any]) => ({
          id,
          ...val
        })).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        
        proofs.value = list
      } else {
        proofs.value = []
      }
    })
  }

  const deleteProof = async (proofId: string) => {
    if (!syncRoomId.value || !confirm('Удалить этот скриншот?')) return
    
    const proofRef = dbRef(db, `proofs/${syncRoomId.value}/${proofId}`)
    await remove(proofRef)
  }

  const clearProofs = async () => {
    if (!syncRoomId.value || !confirm('Очистить все скриншоты?')) return
    
    const proofsRef = dbRef(db, `proofs/${syncRoomId.value}`)
    await remove(proofsRef)
  }

  return {
    proofs,
    showProofs,
    listenToProofs,
    deleteProof,
    clearProofs
  }
}
