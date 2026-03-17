'use client'

import { useState, useRef, useEffect } from 'react'
import { chatApi } from '@/lib/api'
import type { ChatMessage } from '@/types'

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: "Hi! I'm your AI travel guide. Ask me anything about destinations, local customs, visa requirements, food, transport, or anything else travel-related. 🌍",
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    const msg = input.trim()
    if (!msg || loading) return
    setInput('')

    const updated: ChatMessage[] = [...messages, { role: 'user', content: msg }]
    setMessages(updated)
    setLoading(true)

    try {
      const reply = await chatApi.send(updated)
      setMessages([...updated, { role: 'assistant', content: reply }])
    } catch {
      setMessages([...updated, { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  const quickPrompts = [
    'Best time to visit Japan?',
    'Hidden gems in Rome',
    'Budget transport in Bangkok',
    'Tropical packing tips',
  ]

  return (
    <div className="min-h-screen bg-[#faf9f7] flex flex-col">
      <div className="flex flex-1 max-w-4xl mx-auto w-full px-4 py-6 flex-col gap-4">
        <div className="flex-1 bg-white rounded-2xl border border-black/5 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                  msg.role === 'assistant' ? 'bg-[#1a6b5c] text-white font-serif' : 'bg-[#fdf5e6] text-[#c8922a]'
                }`}>
                  {msg.role === 'assistant' ? 'V' : '✦'}
                </div>
                <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'assistant'
                    ? 'bg-[#f4f2ee] text-[#1c1b19] rounded-tl-sm'
                    : 'bg-[#1a6b5c] text-white rounded-tr-sm'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#1a6b5c] flex items-center justify-center text-white font-serif text-sm font-bold">V</div>
                <div className="bg-[#f4f2ee] rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1 items-center">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-2 h-2 bg-[#8f8c85] rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="px-4 pb-2 flex gap-2 flex-wrap">
            {quickPrompts.map((p) => (
              <button
                key={p}
                onClick={() => { setInput(p) }}
                className="text-xs px-3 py-1.5 rounded-full border border-black/10 text-[#5a5750] hover:border-[#2d9e82] hover:text-[#1a6b5c] hover:bg-[#e8f5f1] transition-all"
              >
                {p}
              </button>
            ))}
          </div>

          <div className="p-4 border-t border-black/5">
            <div className="flex gap-2 bg-[#faf9f7] border-[1.5px] border-black/10 rounded-xl px-4 py-2 focus-within:border-[#2d9e82] transition-colors">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    sendMessage()
                  }
                }}
                placeholder="Ask anything about travel..."
                className="flex-1 bg-transparent text-sm resize-none outline-none max-h-28 leading-relaxed"
                rows={1}
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="w-8 h-8 bg-[#1a6b5c] hover:bg-[#155c4f] text-white rounded-lg flex items-center justify-center flex-shrink-0 self-end transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}