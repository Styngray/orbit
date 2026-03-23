"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { Bot, Send } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { UIMessage } from "ai"

interface AIChatSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  teamId: string
  isPro: boolean
}

function getMessageText(m: UIMessage): string {
  for (const part of m.parts) {
    if (part.type === "text") return part.text
  }
  return ""
}

export function AIChatSheet({ open, onOpenChange, teamId, isPro }: AIChatSheetProps) {
  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const today = useMemo(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
  }, [])

  // Stable transport — must not be recreated on re-render or streaming breaks
  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/ai/chat", body: { teamId, today } }),
    [teamId, today]
  )

  const { messages, sendMessage, status, error } = useChat({ transport })

  const isLoading = status === "streaming" || status === "submitted"

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const text = input.trim()
    if (!text || isLoading) return
    setInput("")
    sendMessage({ text })
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as unknown as React.FormEvent)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange} modal={false}>
      {/* showCloseButton=false — we render our own X in the header */}
      <SheetContent
        showCloseButton={false}
        className="w-full sm:max-w-md p-0 gap-0 overflow-hidden flex flex-col"
      >
        <SheetTitle className="sr-only">AI Assistant</SheetTitle>

        {/* Header */}
        <div className="flex items-center gap-2 px-4 h-14 border-b shrink-0">
          <Bot className="size-4 text-[#0029bb] shrink-0" />
          <span className="text-sm font-medium flex-1">AI Assistant</span>
          <button
            onClick={() => onOpenChange(false)}
            className="size-7 flex items-center justify-center rounded-md hover:bg-accent transition-colors text-muted-foreground"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {!isPro ? (
          <div className="flex-1 flex items-center justify-center p-8 text-center">
            <div>
              <Bot className="size-10 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-sm font-medium mb-1.5">Pro plan required</p>
              <p className="text-xs text-muted-foreground">
                Upgrade to Pro to chat with your tasks using AI.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0">
              {messages.length === 0 && !error && (
                <div className="h-full flex flex-col items-center justify-center text-center gap-3 min-h-[300px]">
                  <Bot className="size-10 text-muted-foreground/30" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Ask about your tasks
                    </p>
                    <p className="text-xs text-muted-foreground/60 mt-1">
                      e.g. &quot;What&apos;s urgent?&quot; or &quot;Who has the most tasks?&quot;
                    </p>
                  </div>
                </div>
              )}

              {messages.map((m) => (
                <div
                  key={m.id}
                  className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[85%] rounded-lg px-3 py-2 text-sm",
                      m.role === "user"
                        ? "bg-[#0029bb] text-white"
                        : "bg-muted text-foreground"
                    )}
                  >
                    {m.role === "user" ? (
                      <p className="whitespace-pre-wrap leading-relaxed">{getMessageText(m)}</p>
                    ) : (
                      <div className="prose prose-sm dark:prose-invert max-w-none leading-relaxed [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                        <ReactMarkdown>{getMessageText(m)}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg px-3 py-3">
                    <div className="flex gap-1 items-center">
                      <span className="size-1.5 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:0ms]" />
                      <span className="size-1.5 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:150ms]" />
                      <span className="size-1.5 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:300ms]" />
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] rounded-lg px-3 py-2 text-sm bg-destructive/10 text-destructive">
                    Something went wrong. Please try again.
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form
              onSubmit={handleSubmit}
              className="px-4 py-3 border-t flex gap-2 items-end shrink-0"
            >
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about your tasks…"
                rows={1}
                className="flex-1 resize-none bg-muted rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-[#0029bb] placeholder:text-muted-foreground/60 max-h-32 overflow-y-auto leading-relaxed"
                style={{ minHeight: "36px" }}
              />
              <Button
                type="submit"
                size="sm"
                disabled={isLoading || !input.trim()}
                className="bg-[#0029bb] hover:bg-[#0022a0] text-white shrink-0 px-3"
              >
                <Send className="size-3.5" />
              </Button>
            </form>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
