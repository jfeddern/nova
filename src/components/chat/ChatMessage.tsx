import { Bot, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ChatMessage as ChatMessageType } from '@/services/aiService'

interface ChatMessageProps {
  message: ChatMessageType
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user'

  const formatContent = (content: string) => {
    return content.split('\n').map((line, index) => {
      if (line.startsWith('- ')) {
        return (
          <li key={index} className="ml-4">
            {line.substring(2)}
          </li>
        )
      }
      if (line.match(/^\*\*.+\*\*:?$/)) {
        const text = line.replace(/\*\*/g, '')
        return (
          <p key={index} className="font-semibold mt-2 mb-1">
            {text}
          </p>
        )
      }
      const formattedLine = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      return (
        <p key={index} dangerouslySetInnerHTML={{ __html: formattedLine }} className="mb-1" />
      )
    })
  }

  return (
    <div className={cn('flex gap-3 mb-4', isUser && 'flex-row-reverse')}>
      <div
        className={cn(
          'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
          isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>
      <div
        className={cn(
          'rounded-2xl px-4 py-2 max-w-[80%]',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-foreground'
        )}
      >
        <div className="text-sm">{formatContent(message.content)}</div>
        <div
          className={cn(
            'text-xs mt-1 opacity-60',
            isUser ? 'text-right' : 'text-left'
          )}
        >
          {message.timestamp.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      </div>
    </div>
  )
}
