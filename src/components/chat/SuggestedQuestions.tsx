import { Button } from '@/components/ui/button'

interface SuggestedQuestionsProps {
  onSelect: (question: string) => void
  disabled?: boolean
}

const suggestedQuestions = [
  'How many critical vulnerabilities do we have?',
  'Show me our applications',
  'Give me an overview',
  'What can you help me with?',
]

export function SuggestedQuestions({ onSelect, disabled = false }: SuggestedQuestionsProps) {
  return (
    <div className="p-4 space-y-2">
      <p className="text-sm text-muted-foreground mb-3">Suggested questions:</p>
      <div className="flex flex-wrap gap-2">
        {suggestedQuestions.map((question) => (
          <Button
            key={question}
            variant="outline"
            size="sm"
            onClick={() => onSelect(question)}
            disabled={disabled}
            className="text-xs"
          >
            {question}
          </Button>
        ))}
      </div>
    </div>
  )
}
