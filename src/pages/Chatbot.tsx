import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, User, Loader2, Plus, MessageSquare, Trash2, PanelLeftClose, PanelLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/medical-chat`;

export default function Chatbot() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const loadConversations = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('conversations')
      .select('id, title, created_at, updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });
    if (data) setConversations(data);
  }, [user]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (!user || !activeConversationId) {
      setMessages([]);
      return;
    }
    supabase
      .from('chats')
      .select('role, content')
      .eq('user_id', user.id)
      .eq('conversation_id', activeConversationId)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        if (data) setMessages(data as Message[]);
      });
  }, [user, activeConversationId]);

  const createConversation = async (title: string = 'New Chat'): Promise<string | null> => {
    if (!user) return null;
    const { data, error } = await supabase
      .from('conversations')
      .insert({ user_id: user.id, title })
      .select('id')
      .single();
    if (error || !data) return null;
    await loadConversations();
    return data.id;
  };

  const handleNewChat = async () => {
    setActiveConversationId(null);
    setMessages([]);
    setInput('');
  };

  const handleSelectConversation = (id: string) => {
    if (isLoading) return;
    setActiveConversationId(id);
  };

  const handleDeleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLoading) return;
    await supabase.from('conversations').delete().eq('id', id);
    if (activeConversationId === id) {
      setActiveConversationId(null);
      setMessages([]);
    }
    await loadConversations();
  };

  const saveMessage = async (conversationId: string, role: string, content: string) => {
    if (!user) return;
    await supabase.from('chats').insert({ user_id: user.id, role, content, conversation_id: conversationId });
  };

  const send = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg: Message = { role: 'user', content: input.trim() };
    setInput('');
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    let convId = activeConversationId;
    if (!convId) {
      const title = userMsg.content.slice(0, 60) + (userMsg.content.length > 60 ? '...' : '');
      convId = await createConversation(title);
      if (!convId) {
        setIsLoading(false);
        return;
      }
      setActiveConversationId(convId);
    }

    await saveMessage(convId, 'user', userMsg.content);

    let assistantContent = '';
    const upsert = (chunk: string) => {
      assistantContent += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant') {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantContent } : m));
        }
        return [...prev, { role: 'assistant', content: assistantContent }];
      });
    };

    try {
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      });

      if (!resp.ok || !resp.body) throw new Error('Failed to start stream');

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let idx: number;
        while ((idx = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (!line.startsWith('data: ')) continue;
          const json = line.slice(6).trim();
          if (json === '[DONE]') break;
          try {
            const parsed = JSON.parse(json);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) upsert(content);
          } catch {}
        }
      }

      await saveMessage(convId, 'assistant', assistantContent);
      await supabase.from('conversations').update({ updated_at: new Date().toISOString() }).eq('id', convId);
      await loadConversations();
    } catch (err) {
      upsert('\n\n*Sorry, something went wrong. Please try again.*');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Chat History Sidebar */}
      <div
        className={cn(
          'border-r border-sidebar-border bg-sidebar flex flex-col shrink-0 transition-all duration-300 ease-out',
          sidebarOpen ? 'w-72' : 'w-0 overflow-hidden'
        )}
      >
        <div className="p-3 border-b border-sidebar-border flex items-center gap-2">
          <Button
            onClick={handleNewChat}
            variant="glow"
            className="flex-1 justify-start gap-2 text-[13px] h-10 rounded-xl"
          >
            <Plus className="h-4 w-4" />
            New Chat
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 shrink-0 rounded-xl hover:bg-muted"
            onClick={() => setSidebarOpen(false)}
          >
            <PanelLeftClose className="h-4 w-4" />
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-0.5">
            {conversations.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-8">No conversations yet</p>
            )}
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => handleSelectConversation(conv.id)}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] text-left transition-all duration-200 group',
                  activeConversationId === conv.id
                    ? 'bg-sidebar-accent text-sidebar-primary-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/40'
                )}
              >
                <MessageSquare className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <span className="truncate flex-1">{conv.title}</span>
                <button
                  onClick={(e) => handleDeleteConversation(conv.id, e)}
                  className="opacity-0 group-hover:opacity-100 transition-all duration-200 p-1 rounded-lg hover:bg-destructive/15 hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="px-6 py-5 border-b border-border flex items-center gap-3">
          {!sidebarOpen && (
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl" onClick={() => setSidebarOpen(true)}>
              <PanelLeft className="h-4 w-4" />
            </Button>
          )}
          <div>
            <h1 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <div className="gradient-violet p-1 rounded-lg">
                <Bot className="h-4 w-4 text-primary-foreground" />
              </div>
              AI Medical Assistant
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5 ml-8">Describe your symptoms and get AI-powered insights</p>
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-auto px-4 sm:px-6 py-6 space-y-5 scrollbar-thin">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center fade-in">
              <div className="gradient-violet p-5 rounded-2xl mb-5 glow-violet">
                <Bot className="h-8 w-8 text-primary-foreground" />
              </div>
              <h2 className="text-lg font-semibold text-foreground mb-2">How can I help you today?</h2>
              <p className="text-muted-foreground text-sm max-w-md leading-relaxed">
                Describe your symptoms and I'll provide possible medical causes and suggestions.
                <span className="block mt-2.5 text-xs text-muted-foreground/60">Note: This is not a substitute for professional medical advice.</span>
              </p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={cn('flex gap-3 animate-slide-up', msg.role === 'user' ? 'justify-end' : '')}>
              {msg.role === 'assistant' && (
                <div className="gradient-violet h-8 w-8 rounded-xl flex items-center justify-center shrink-0 mt-1 shadow-sm shadow-primary/20">
                  <Bot className="h-4 w-4 text-primary-foreground" />
                </div>
              )}
              <div className={cn(
                'max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground rounded-br-md shadow-md shadow-primary/15'
                  : 'glass-card rounded-bl-md'
              )}>
                {msg.role === 'assistant' ? (
                  <div className="prose prose-sm prose-invert max-w-none [&_p]:mb-2 [&_ul]:mb-2 [&_ol]:mb-2 [&_li]:mb-0.5">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p>{msg.content}</p>
                )}
              </div>
              {msg.role === 'user' && (
                <div className="h-8 w-8 rounded-xl bg-muted flex items-center justify-center shrink-0 mt-1">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}

          {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
            <div className="flex gap-3 animate-slide-up">
              <div className="gradient-violet h-8 w-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm shadow-primary/20">
                <Bot className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="glass-card px-4 py-3 rounded-2xl rounded-bl-md">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-primary/50 animate-pulse" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-primary/50 animate-pulse" style={{ animationDelay: '200ms' }} />
                  <div className="w-2 h-2 rounded-full bg-primary/50 animate-pulse" style={{ animationDelay: '400ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-border bg-background/80 backdrop-blur-lg">
          <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex gap-2.5 max-w-3xl mx-auto">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe your symptoms..."
              className="flex-1 bg-muted/40 border border-border rounded-2xl px-5 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/30 transition-all duration-200"
              disabled={isLoading}
            />
            <Button type="submit" variant="glow" size="icon" className="h-12 w-12 rounded-2xl shrink-0" disabled={isLoading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
