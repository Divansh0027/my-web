import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  updateDoc,
  writeBatch,
  getDocs,
  where,
  arrayUnion,
  increment,
} from 'firebase/firestore'
import { getToken } from 'firebase/messaging'
import { dbInstance } from '@/firebase'
import { getMessaging, isSupported } from 'firebase/messaging'

export const requestAndSaveFCMToken = async (userId: string) => {
  if (!dbInstance) return
  try {
    const supported = await isSupported()
    if (!supported) {
      console.warn('FCM not supported')
      return
    }
    const messaging = getMessaging()
    const registration = await navigator.serviceWorker.getRegistration()
    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY || 'default-vapid-key-if-not-set',
      serviceWorkerRegistration: registration,
    })

    if (token) {
      const userRef = doc(dbInstance, 'users', userId)
      await setDoc(
        userRef,
        {
          fcmTokens: arrayUnion(token),
        },
        { merge: true },
      )
    }
  } catch (error: unknown) {
    console.log('FCM token error:', error)
  }
}

export interface ChatMessage {
  id?: string
  senderId: string
  text: string
  timestamp: string | any
  read: boolean
}

export interface ChatSession {
  id: string
  userId: string
  userName: string
  lastMessage: string
  lastMessageTime: string | any
  unreadAdminCount: number
  unreadUserCount: number
  adminTyping?: boolean
  userTyping?: boolean
  updatedAt?: string | any
}

export const subscribeToChatMessages = (
  chatId: string,
  callback: (messages: ChatMessage[]) => void,
) => {
  if (!dbInstance) return () => {}

  const q = query(collection(dbInstance, 'chats', chatId, 'messages'), orderBy('timestamp', 'asc'))

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as ChatMessage[]
    callback(messages)
  })
}

export const subscribeToUserChatSession = (
  chatId: string,
  callback: (session: ChatSession | null) => void,
) => {
  if (!dbInstance) return () => {}

  return onSnapshot(doc(dbInstance, 'chats', chatId), (docSnap) => {
    if (docSnap.exists()) {
      callback({ id: docSnap.id, ...docSnap.data() } as ChatSession)
    } else {
      callback(null)
    }
  })
}

export const subscribeToAllChatSessions = (callback: (sessions: ChatSession[]) => void) => {
  if (!dbInstance) return () => {}

  const q = query(collection(dbInstance, 'chats'), orderBy('updatedAt', 'desc'))

  return onSnapshot(q, (snapshot) => {
    const sessions = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as ChatSession[]
    callback(sessions)
  })
}

export const sendMessage = async (
  chatId: string,
  senderId: string,
  userName: string,
  text: string,
  isAdmin: boolean,
) => {
  if (!dbInstance) return

  const chatRef = doc(dbInstance, 'chats', chatId)
  const messagesRef = collection(dbInstance, 'chats', chatId, 'messages')

  try {
    // Dispatch both writes synchronously to the local cache so they update UI immediately
    // even if the client is offline (promises will resolve when backend acks)
    const p1 = setDoc(
      chatRef,
      {
        userId: chatId,
        userName,
        lastMessage: text,
        lastMessageTime: serverTimestamp(),
        updatedAt: serverTimestamp(),
        unreadAdminCount: isAdmin ? 0 : increment(1),
        unreadUserCount: isAdmin ? increment(1) : 0,
      },
      { merge: true },
    )

    const p2 = addDoc(messagesRef, {
      senderId,
      text,
      timestamp: serverTimestamp(),
      read: false,
    })

    await Promise.all([p1, p2])
  } catch (error: unknown) {
    if ((error as any)?.code === 'unavailable' || ((error as any)?.message && (error as any).message.includes('offline'))) {
      return
    }
    console.warn('Failed to send message:', error)
  }
}

export const markMessagesAsRead = async (chatId: string, isAdmin: boolean) => {
  if (!dbInstance) return

  const chatRef = doc(dbInstance, 'chats', chatId)
  try {
    if (isAdmin) {
      await updateDoc(chatRef, { unreadAdminCount: 0 })
    } else {
      await updateDoc(chatRef, { unreadUserCount: 0 })
    }
  } catch (error: unknown) {
    console.warn('Failed to mark as read:', error)
  }
}

export const setTypingStatus = async (chatId: string, isAdmin: boolean, isTyping: boolean) => {
  if (!dbInstance) return
  const chatRef = doc(dbInstance, 'chats', chatId)
  try {
    const chatSnap = await getDoc(chatRef)
    if (chatSnap.exists()) {
      if (isAdmin) {
        await updateDoc(chatRef, { adminTyping: isTyping })
      } else {
        await updateDoc(chatRef, { userTyping: isTyping })
      }
    }
  } catch (e: unknown) {
    if ((e as any)?.code === 'unavailable' || ((e as any)?.message && (e as any).message.includes('offline'))) {
      return
    }
    console.warn('Failed to set typing status:', e)
  }
}
