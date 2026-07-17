import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/features/auth/useAuth'
import {
  subscribeToAllChatSessions,
  subscribeToChatMessages,
  sendMessage,
  markMessagesAsRead,
  setTypingStatus,
  ChatMessage,
  ChatSession,
} from './chatService'
import { Send, MessageCircle, Check, CheckCheck, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export const AdminChatDashboard: React.FC = () => {
  const { currentUser } = useAuth()
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputText, setInputText] = useState('')

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const unsub = subscribeToAllChatSessions(setSessions)
    return () => unsub()
  }, [])

  useEffect(() => {
    if (!activeSessionId) return

    const unsub = subscribeToChatMessages(activeSessionId, (msgs) => {
      setMessages(msgs)
      setTimeout(() => scrollToBottom(), 100)
    })

    return () => unsub()
  }, [activeSessionId])

  const activeSession = sessions.find((s) => s.id === activeSessionId)

  useEffect(() => {
    if (activeSessionId && activeSession?.unreadAdminCount && activeSession.unreadAdminCount > 0) {
      markMessagesAsRead(activeSessionId, true)
    }
  }, [activeSessionId, activeSession?.unreadAdminCount, messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim() || !activeSessionId || !currentUser) return

    const text = inputText
    setInputText('')
    await sendMessage(activeSessionId, currentUser.uid, 'Admin', text, true)
  }

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value)
    if (activeSessionId) {
      setTypingStatus(activeSessionId, true, e.target.value.length > 0)
    }
  }

  const formatTime = (timestamp: any) => {
    if (!timestamp) return ''
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
      return formatDistanceToNow(date, { addSuffix: true })
    } catch {
      return ''
    }
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-surface-container rounded-xl shadow-sm border border-outline-variant/50 overflow-hidden">
      {/* Sidebar */}
      <div className="w-1/3 border-r border-outline-variant/50 flex flex-col bg-surface">
        <div className="p-4 border-b border-outline-variant/50 bg-surface-container">
          <h2 className="font-bold text-sm tracking-widest uppercase text-on-surface">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {sessions.length === 0 ? (
            <div className="p-8 text-center text-on-surface-variant text-sm">
              No chat sessions yet.
            </div>
          ) : (
            sessions.map((session) => (
              <button
                key={session.id}
                onClick={() => setActiveSessionId(session.id)}
                className={`w-full text-left p-4 border-b border-gray-50 hover:bg-gray-100 transition-colors flex flex-col gap-1 relative ${activeSessionId === session.id ? 'bg-gold-accent/5 hover:bg-gold-accent/10 border-l-2 border-l-gold-accent' : ''}`}
              >
                <div className="flex justify-between items-center w-full">
                  <span className="font-medium text-gray-900 truncate pr-4">
                    {session.userName}
                  </span>
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {formatTime(session.lastMessageTime)}
                  </span>
                </div>
                <p className="text-sm text-on-surface-variant truncate w-full pr-6">
                  {session.lastMessage}
                </p>
                {session.unreadAdminCount > 0 && (
                  <span className="absolute right-4 bottom-4 bg-red-600 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                    {session.unreadAdminCount}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-surface-container relative">
        {activeSessionId ? (
          <>
            <div className="p-4 border-b border-outline-variant/50 flex justify-between items-center bg-surface-container">
              <div>
                <h3 className="font-bold text-sm tracking-widest uppercase text-on-surface">
                  {activeSession?.userName}
                </h3>
                <p className="text-xs text-on-surface-variant">
                  User ID: {activeSession?.userId.slice(0, 8)}...
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-surface/30">
              {messages.length === 0 ? (
                <div className="text-center text-on-surface-variant mt-10">
                  <p className="text-sm">No messages yet.</p>
                </div>
              ) : (
                messages.map((msg, i) => {
                  const isAdminMsg = msg.senderId === currentUser?.uid || msg.senderId === 'admin'
                  return (
                    <div
                      key={msg.id || i}
                      className={`flex ${isAdminMsg ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-2 flex flex-col gap-1 ${isAdminMsg ? 'bg-gold-accent/20 border border-gold-accent/30 text-gold-accent rounded-br-none' : 'bg-surface-container border border-outline-variant/50 text-on-surface-variant shadow-sm rounded-bl-none'}`}
                      >
                        <p className="text-sm">{msg.text}</p>
                        <span
                          className={`text-[10px] self-end ${isAdminMsg ? 'text-blue-200' : 'text-gray-400'}`}
                        >
                          {formatTime(msg.timestamp)}
                        </span>
                      </div>
                    </div>
                  )
                })
              )}

              {activeSession?.userTyping && (
                <div className="flex justify-start">
                  <div className="bg-surface-container text-on-surface-variant border border-outline-variant/50 shadow-sm rounded-2xl rounded-bl-none px-4 py-2">
                    <p className="text-xs italic">User is typing...</p>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form
              onSubmit={handleSend}
              className="p-4 bg-surface-container border-t border-outline-variant/50 flex items-center gap-3"
            >
              <input
                type="text"
                value={inputText}
                onChange={handleTyping}
                onBlur={() => {
                  if (activeSessionId) setTypingStatus(activeSessionId, true, false)
                }}
                placeholder="Type your message..."
                aria-label="Message input"
                className="flex-1 border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-sm px-4 py-2.5 bg-surface rounded-full transition-all"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="bg-gold-accent text-[var(--on-gold)] p-2.5 rounded-full disabled:bg-surface-container-high disabled:text-on-surface-variant disabled:border-none disabled:shadow-none disabled:cursor-not-allowed hover:bg-gold-hover transition-colors shadow-md flex items-center justify-center"
                aria-label="Send Message"
              >
                <Send size={18} />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <div className="bg-surface w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                <MessageCircle size={32} />
              </div>
              <p>Select a conversation to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
