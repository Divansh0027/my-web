import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { dbInstance } from '@/firebase'

export const trackBehavior = async (
  userId: string | null,
  action: 'view' | 'save' | 'search' | 'enquiry',
  metadata: any,
) => {
  if (!dbInstance) return
  try {
    let finalUserId = userId
    if (!finalUserId) {
      finalUserId = localStorage.getItem('ssp_guest_id')
      if (!finalUserId) {
        finalUserId = `guest-${Math.random().toString(36).substring(2, 9)}`
        localStorage.setItem('ssp_guest_id', finalUserId)
      }
    }

    await addDoc(collection(dbInstance, 'user_behavior'), {
      userId: finalUserId,
      action,
      metadata,
      timestamp: serverTimestamp(),
    })
  } catch (error: unknown) {
    console.warn('Failed to track behavior:', error)
  }
}
