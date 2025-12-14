import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'

interface Message {
  role: string
  content: string
}

interface TranscriptViewProps {
  messages: Message[] | null
}

export function TranscriptView({ messages }: TranscriptViewProps) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Transcript</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {!messages || messages.length === 0 ? (
          <p className="text-muted-foreground px-6 pb-6">No transcript available.</p>
        ) : (
          <ScrollArea className="h-[60vh] max-h-[600px]">
            <div className="space-y-4 px-6 pb-6">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'agent' ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 ${
                      message.role === 'agent'
                        ? 'bg-muted rounded-tl-sm'
                        : 'bg-primary text-primary-foreground rounded-tr-sm'
                    }`}
                  >
                    <p className={`text-xs font-medium mb-1 ${
                      message.role === 'agent' ? 'text-muted-foreground' : 'text-primary-foreground/70'
                    }`}>
                      {message.role === 'agent' ? 'Agent' : 'User'}
                    </p>
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
