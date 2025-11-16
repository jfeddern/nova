import { useEffect, useRef } from 'react'
import { Bot, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useChat } from '@/contexts/ChatContext'
import { ChatMessage } from './ChatMessage'
import { ChatInput } from './ChatInput'
import { SuggestedQuestions } from './SuggestedQuestions'
import { cn } from '@/lib/utils'

export function ChatWidget() {
  const { messages, isOpen, isLoading, toggleChat, closeChat, sendMessage } = useChat()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (content: string) => {
    await sendMessage(content)
  }

  return (
    <>
      {/* Floating Button */}
      <Button
        onClick={toggleChat}
        size="lg"
        title="AI Assistant"
        className={cn(
          'fixed bottom-6 right-6 rounded-full shadow-lg z-50 transition-all hover:scale-105 px-6 py-3 h-auto gap-2',
          isOpen && 'scale-0'
        )}
      >
        <Bot className="h-5 w-5" />
        <span className="font-semibold">AI Assistant</span>
      </Button>

      {/* Chat Panel */}
      <div
        className={cn(
          'fixed bottom-6 right-6 z-50 transition-all duration-300 ease-in-out',
          isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
        )}
      >
        <Card className="w-96 h-[600px] flex flex-col shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-primary text-primary-foreground rounded-t-lg">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <div>
                <h3 className="font-semibold">Nova AI Assistant</h3>
                <p className="text-xs opacity-90">Ask me anything</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={closeChat}
              className="text-primary-foreground hover:bg-primary-foreground/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-background">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center px-4">
                <Bot className="h-12 w-12 text-muted-foreground mb-4" />
                <h4 className="font-semibold mb-2">Welcome to Nova AI</h4>
                <p className="text-sm text-muted-foreground mb-6">
                  I can help you with information about your applications, security
                  vulnerabilities, teams, and platform tools.
                </p>
                <SuggestedQuestions onSelect={handleSendMessage} disabled={isLoading} />
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
                {isLoading && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input */}
          <ChatInput onSend={handleSendMessage} disabled={isLoading} />
        </Card>
      </div>
    </>
  )
}
