'use client'

import { useCallback, useEffect, useState } from 'react'
import { API_ENDPOINTS } from '@/lib/api-config'
import { MessageSquarePlus, Trash2, Loader2, MessagesSquare } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export interface ConversationItem {
  id: string
  title: string
  updated_at?: string
}

interface ConversationSidebarProps {
  activeId?: string
  onSelect: (id: string) => void
  onNewChat: () => void
  refreshKey?: number
}

export async function deleteConversation(id: string): Promise<{ ok: boolean; error?: string }> {
  const token = localStorage.getItem('auth_token')
  if (!token) return { ok: false, error: 'Please sign in again' }

  try {
    const res = await fetch(API_ENDPOINTS.CONVERSATION_DELETE(id), {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    if (res.ok) return { ok: true }
    const err = await res.json().catch(() => ({}))
    return { ok: false, error: (err as { detail?: string }).detail || 'Could not delete chat' }
  } catch {
    return { ok: false, error: 'Could not delete chat' }
  }
}

export function ConversationSidebar({
  activeId,
  onSelect,
  onNewChat,
  refreshKey = 0,
}: ConversationSidebarProps) {
  const [conversations, setConversations] = useState<ConversationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const load = useCallback(async () => {
    const token = localStorage.getItem('auth_token')
    if (!token) {
      setLoading(false)
      return
    }
    try {
      const res = await fetch(API_ENDPOINTS.CONVERSATIONS, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) return
      const data = await res.json()
      setConversations(data.conversations || [])
    } catch {
      /* ignore */
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load, refreshKey])

  const handleDelete = async (id: string, title: string) => {
    const label = title || 'this chat'
    if (!window.confirm(`Delete "${label}"? This cannot be undone.`)) return

    setDeletingId(id)
    const result = await deleteConversation(id)
    setDeletingId(null)

    if (result.ok) {
      setConversations((prev) => prev.filter((c) => c.id !== id))
      toast.success('Chat deleted')
      if (activeId === id) onNewChat()
    } else {
      toast.error(result.error || 'Could not delete chat')
    }
  }

  return (
    <div className="flex flex-col h-full w-64 shrink-0 border-r border-white/8 bg-[#0c0c14]/95">
      <div className="p-3 border-b border-white/8 space-y-2">
        <button
          type="button"
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 h-10 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-violet-600/90 to-purple-600/90 hover:from-violet-500 hover:to-purple-500 shadow-md shadow-violet-900/20 transition-all"
        >
          <MessageSquarePlus className="h-4 w-4" />
          New chat
        </button>
        {conversations.length > 0 && (
          <p className="text-[10px] text-slate-600 text-center px-1">
            Tap the trash icon to delete a chat
          </p>
        )}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden custom-scrollbar px-2 py-2">
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-5 w-5 animate-spin text-violet-400/60" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center text-center px-4 py-10">
            <MessagesSquare className="h-8 w-8 text-slate-600 mb-3" />
            <p className="text-xs text-slate-500">No chats yet</p>
            <p className="text-[10px] text-slate-600 mt-1">Start a new conversation</p>
          </div>
        ) : (
          <ul className="space-y-1 pb-4 w-full">
            {conversations.map((c) => {
              const isActive = activeId === c.id
              const isDeleting = deletingId === c.id
              return (
                <li
                  key={c.id}
                  className={cn(
                    'grid grid-cols-[minmax(0,1fr)_32px] items-stretch rounded-xl border transition-all',
                    isActive
                      ? 'bg-violet-600/20 border-violet-500/25'
                      : 'border-transparent hover:bg-white/6'
                  )}
                >
                  <button
                    type="button"
                    onClick={() => onSelect(c.id)}
                    className={cn(
                      'min-w-0 px-3 py-2.5 text-left text-[13px] leading-snug truncate rounded-l-xl',
                      isActive ? 'text-white' : 'text-slate-400 hover:text-white'
                    )}
                    title={c.title || 'New chat'}
                  >
                    {c.title || 'New chat'}
                  </button>
                  <button
                    type="button"
                    title="Delete chat"
                    disabled={isDeleting}
                    aria-label={`Delete chat: ${c.title || 'New chat'}`}
                    className={cn(
                      'flex items-center justify-center rounded-r-xl border-l transition-colors',
                      isActive ? 'border-violet-500/20' : 'border-white/5',
                      'text-red-400/90 hover:text-red-300 hover:bg-red-500/15'
                    )}
                    onClick={() => handleDelete(c.id, c.title)}
                  >
                    {isDeleting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
