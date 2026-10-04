import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import apiClient from '@/config/api';
import { X, Sparkles, Send, Trash2, Bot, User as UserIcon, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QuickPromptPills } from './QuickPromptPills';

export interface Message {
  role: 'user' | 'ai';
  content: string;
  timestamp?: string;
}

interface CopilotFloatingChatProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

// Simple formatter to parse basic markdown bold and bullet lines nicely
const FormattedMessage: React.FC<{ content: string }> = ({ content }) => {
  const lines = content.split('\n');

  return (
    <div className="space-y-1.5 leading-relaxed text-xs">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-1" />;

        // Bullet line
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const text = trimmed.substring(2);
          return (
            <div key={idx} className="flex items-start gap-1.5 pl-1">
              <span className="text-primary font-bold">•</span>
              <span>{renderBoldSpans(text)}</span>
            </div>
          );
        }

        return <p key={idx}>{renderBoldSpans(trimmed)}</p>;
      })}
    </div>
  );
};

function renderBoldSpans(text: string): React.ReactNode {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-bold text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

export const CopilotFloatingChat: React.FC<CopilotFloatingChatProps> = ({
  open: controlledOpen,
  onOpenChange,
}) => {
  const location = useLocation();
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = (value: boolean) => {
    setInternalOpen(value);
    onOpenChange?.(value);
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'ai',
      content:
        'Hi! I am your AI Financial Copilot. Ask me about your spending trends, top merchants, subscriptions, or budgets.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [clearing, setClearing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Load session history on mount
  useEffect(() => {
    let isMounted = true;
    apiClient
      .get<{ messages: Message[] }>('/copilot/history')
      .then((res) => {
        if (isMounted && res.data?.messages && res.data.messages.length > 0) {
          setMessages(res.data.messages);
        }
      })
      .catch((err) => {
        console.warn('Failed to restore copilot history:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Deep-linking: handle query parameter from URL (e.g. /dashboard?q=...)
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const query = searchParams.get('q');
    if (query && query.trim()) {
      setIsOpen(true);
      handleSend(query.trim());
    }
  }, [location.search]);

  const handleSend = async (question: string) => {
    if (!question.trim() || loading) return;

    const userMessage: Message = {
      role: 'user',
      content: question,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await apiClient.post('/copilot/ask', { question });
      const aiAnswer = res.data?.answer || 'No response from intelligence engine.';

      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          content: aiAnswer,
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          content:
            'I encountered an issue connecting to the analytical database. Please verify your connection or try a simpler question.',
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (clearing || loading) return;
    setClearing(true);
    try {
      await apiClient.post('/copilot/clear');
      setMessages([
        {
          role: 'ai',
          content: 'Conversation history cleared. How can I help you today?',
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch (e) {
      console.error('Failed to clear session:', e);
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="bg-card border border-border w-96 max-w-[calc(100vw-2.5rem)] h-[540px] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200">
          {/* Header */}
          <div className="p-3.5 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-primary-foreground/20 backdrop-blur-xs flex items-center justify-center shadow-xs">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-bold leading-none">Financial Copilot</h3>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <p className="text-[10px] text-primary-foreground/80 leading-tight mt-0.5">
                  Local PII Sanitized • Tiered Intelligence
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleClearHistory}
                disabled={clearing || loading}
                className="text-primary-foreground/80 hover:text-primary-foreground p-1 rounded-md transition-colors"
                title="Clear Chat History"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-primary-foreground/80 hover:text-primary-foreground p-1 rounded-md transition-colors"
                aria-label="Close Chat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Quick Prompts Carousel */}
          <QuickPromptPills onSelectPrompt={handleSend} disabled={loading} />

          {/* Messages Feed */}
          <div className="flex-1 p-3 overflow-y-auto space-y-3 bg-muted/10">
            {messages.map((msg, idx) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={idx}
                  className={`flex items-start gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="h-6 w-6 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="h-3.5 w-3.5" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
                      isUser
                        ? 'bg-primary text-primary-foreground rounded-tr-xs shadow-xs'
                        : 'bg-card border border-border text-foreground rounded-tl-xs shadow-xs'
                    }`}
                  >
                    <FormattedMessage content={msg.content} />
                    {msg.timestamp && (
                      <div
                        className={`text-[9px] mt-1 text-right ${
                          isUser ? 'text-primary-foreground/60' : 'text-muted-foreground/60'
                        }`}
                      >
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    )}
                  </div>

                  {isUser && (
                    <div className="h-6 w-6 rounded-lg bg-muted border border-border text-muted-foreground flex items-center justify-center shrink-0 mt-0.5">
                      <UserIcon className="h-3.5 w-3.5" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Typing Indicator */}
            {loading && (
              <div className="flex items-start gap-2 justify-start">
                <div className="h-6 w-6 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="h-3.5 w-3.5" />
                </div>
                <div className="bg-card border border-border px-3.5 py-2.5 rounded-2xl rounded-tl-xs shadow-xs flex items-center gap-2 text-xs text-muted-foreground">
                  <RefreshCw className="h-3 w-3 animate-spin text-primary" />
                  <span>Computing financial database...</span>
                  <div className="flex items-center gap-1 ml-1">
                    <span className="h-1 w-1 rounded-full bg-primary animate-bounce"></span>
                    <span className="h-1 w-1 rounded-full bg-primary animate-bounce [animation-delay:0.15s]"></span>
                    <span className="h-1 w-1 rounded-full bg-primary animate-bounce [animation-delay:0.3s]"></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div className="p-2.5 border-t border-border bg-card">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(input);
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about spending, budgets, trends..."
                disabled={loading}
                className="flex-1 bg-muted/50 border border-border rounded-xl px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground outline-hidden focus:ring-1 focus:ring-primary transition-all disabled:opacity-50"
              />
              <Button
                type="submit"
                size="sm"
                className="h-8 w-8 p-0 rounded-xl shrink-0 bg-primary text-primary-foreground shadow-xs hover:bg-primary/90"
                disabled={loading || !input.trim()}
              >
                <Send className="h-3.5 w-3.5" />
              </Button>
            </form>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="h-12 w-12 rounded-2xl bg-primary text-primary-foreground shadow-xl hover:shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all group"
          aria-label="Open Financial Copilot"
        >
          <Sparkles className="h-5 w-5 transition-transform group-hover:rotate-12" />
        </button>
      )}
    </div>
  );
};
