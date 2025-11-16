import { createContext, useContext, useState, ReactNode } from 'react'
import { ChatMessage, sendChatMessage } from '@/services/aiService'

interface ChatContextType {
  messages: ChatMessage[]
  isOpen: boolean
  isLoading: boolean
  openChat: () => void
  closeChat: () => void
  toggleChat: () => void
  sendMessage: (content: string) => Promise<void>
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const openChat = () => setIsOpen(true)

  const closeChat = () => {
    setIsOpen(false)
    setMessages([])
  }

  const toggleChat = () => setIsOpen(!isOpen)

  const sendMessage = async (content: string) => {
    const userMessage: ChatMessage = {
      id: Math.random().toString(36).substring(2, 15),
      role: 'user',
      content,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    try {
      const assistantMessage = await sendChatMessage(content)
      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: Math.random().toString(36).substring(2, 15),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ChatContext.Provider
      value={{
        messages,
        isOpen,
        isLoading,
        openChat,
        closeChat,
        toggleChat,
        sendMessage,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
}
