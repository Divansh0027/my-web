import React, { useState, useEffect, useRef } from 'react'
import { MessageCircle, X, Send } from 'lucide-react'
import { useAuth } from '@/features/auth/useAuth'
import {
  subscribeToChatMessages,
  subscribeToUserChatSession,
  sendMessage,
  markMessagesAsRead,
  setTypingStatus,
  requestAndSaveFCMToken,
  ChatMessage,
  ChatSession,
} from './chatService'

export const ChatWidget: React.FC = () => {
  const { currentUser } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [session, setSession] = useState<ChatSession | null>(null)
  const [inputText, setInputText] = useState('')
  const [guestId, setGuestId] = useState('')

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let currentGuestId = localStorage.getItem('ssp_guest_chat_id')
    if (!currentGuestId) {
      currentGuestId = `guest-${Math.random().toString(36).substring(2, 9)}`
      localStorage.setItem('ssp_guest_chat_id', currentGuestId)
    }
     
    setGuestId(currentGuestId)
  }, [])

  const chatId = currentUser ? currentUser.uid : guestId
  const userName = currentUser ? currentUser.displayName || 'User' : 'Guest User'
  const isAdmin = currentUser?.isAdmin || false

  useEffect(() => {
    if (isOpen && chatId && currentUser?.uid) {
      requestAndSaveFCMToken(currentUser.uid)
    }
  }, [isOpen, chatId, currentUser?.uid])

  useEffect(() => {
    if (!chatId || isAdmin) return // Admins use dashboard

    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    const unsubMessages = subscribeToChatMessages(chatId, (msgs) => {
      setMessages(msgs)
      setTimeout(() => scrollToBottom(), 100)
    })

    const unsubSession = subscribeToUserChatSession(chatId, (sess) => {
      setSession(sess)
    })

    return () => {
      unsubMessages()
      unsubSession()
    }
  }, [chatId, isAdmin])

  useEffect(() => {
    if (isOpen && chatId && session?.unreadUserCount && !isAdmin) {
      markMessagesAsRead(chatId, false)
    }
  }, [isOpen, messages, session?.unreadUserCount, chatId, isAdmin])


  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim() || !chatId) return

    const text = inputText
    setInputText('')
    await sendMessage(chatId, currentUser?.uid || guestId, userName, text, false)
  }

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value)
    setTypingStatus(chatId, false, e.target.value.length > 0)
  }

  // Don't show widget for admins (they have dashboard)
  if (isAdmin) return null

  return (
    <div className="fixed bottom-24 right-4 lg:bottom-6 lg:right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="bg-surface-container-high rounded-2xl shadow-2xl w-80 sm:w-96 h-[500px] flex flex-col mb-4 overflow-hidden border border-outline-variant/50 transition-all">
          <div className="bg-surface-container-highest text-on-surface p-4 flex justify-between items-center shrink-0 border-b border-outline-variant/50">
            <div>
              <h2 className="font-bold text-sm tracking-widest uppercase text-gold-accent">
                Support Chat
              </h2>
              <p className="text-on-surface-variant text-[10px] uppercase tracking-wide mt-0.5">
                We typically reply in a few minutes.
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-on-surface hover:text-gold-accent focus:outline-none transition-colors"
              aria-label="Close Chat"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-surface">
            {messages.length === 0 ? (
              <div className="text-center text-on-surface-variant mt-10">
                <p className="text-sm">Send us a message and we'll get back to you shortly.</p>
              </div>
            ) : (
              messages.map((msg, i) => {
                const isMine = msg.senderId === (currentUser?.uid || guestId)
                return (
                  <div
                    key={msg.id || i}
                    className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2 ${isMine ? 'bg-gold-accent/20 border border-gold-accent/30 text-gold-accent rounded-br-none' : 'bg-surface-container border border-outline-variant/50 text-on-surface-variant shadow-sm rounded-bl-none'}`}
                    >
                      <p className="text-sm">{msg.text}</p>
                    </div>
                  </div>
                )
              })
            )}

            {session?.adminTyping && (
              <div className="flex justify-start">
                <div className="bg-surface-container text-on-surface-variant border border-outline-variant/50 shadow-sm rounded-2xl rounded-bl-none px-4 py-2">
                  <p className="text-xs italic">Admin is typing...</p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form
            onSubmit={handleSend}
            className="p-3 bg-surface-container-high border-t border-outline-variant/50 flex items-center shrink-0 gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={handleTyping}
              onBlur={() => setTypingStatus(chatId, false, false)}
              placeholder="Type your message..."
              aria-label="Message input"
              className="flex-1 border border-outline-variant/50 focus:border-gold-accent/50 focus:ring-1 focus:ring-gold-accent/50 text-xs px-4 py-2.5 bg-surface text-on-surface rounded-full w-full placeholder:text-on-surface-variant/50 outline-none transition-all"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="bg-gold-accent text-[var(--on-gold)] p-2.5 rounded-full disabled:bg-surface-container-high disabled:text-on-surface-variant disabled:border-none disabled:shadow-none disabled:cursor-not-allowed hover:bg-gold-hover transition-colors shadow-md flex items-center justify-center"
              aria-label="Send Message"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}

      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-surface-container-highest border border-outline-variant/50 hover:border-gold-accent text-gold-accent p-4 rounded-full shadow-lg transition-all hover:scale-105 focus:outline-none relative group"
          aria-label="Open Chat"
        >
          <MessageCircle size={24} />
          {(session?.unreadUserCount ?? 0) > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full animate-pulse border-2 border-surface">
              {session?.unreadUserCount}
            </span>
          )}
        </button>
      )}
    </div>
  )
}
