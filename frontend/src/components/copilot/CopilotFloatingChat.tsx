import React, { useState } from 'react';
import apiClient from '@/config/api';
import { X, Sparkles, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Message {
  role: 'user' | 'ai';
  content: string;
}

interface CopilotFloatingChatProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const CopilotFloatingChat: React.FC<CopilotFloatingChatProps> = ({
  open: controlledOpen,
  onOpenChange,
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = (value: boolean) => {
    setInternalOpen(value);
    onOpenChange?.(value);
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'ai',
      content: 'Hi! I am your AI Financial Copilot. Ask me about your spending trends, top merchants, or anomalies.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const quickPrompts = [
    'How much on food this month?',
    'Show top 5 merchants',
    'Detect anomalies in my expenses',
  ];

  const handleSend = async (question: string) => {
    if (!question.trim() || loading) return;

    setMessages((prev) => [...prev, { role: 'user', content: question }]);
    setInput('');
    setLoading(true);

    try {
      const res = await apiClient.post('/copilot/ask', { question });
      setMessages((prev) => [...prev, { role: 'ai', content: res.data.answer || 'No response from Copilot.' }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'ai', content: 'Sorry, I am having trouble connecting to the intelligence engine.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="bg-card border border-border w-96 max-w-[calc(100vw-3rem)] h-[520px] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200">
          {/* Header */}
          <div className="p-3.5 bg-primary text-primary-foreground flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-primary-foreground/20 flex items-center justify-center">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold leading-none">Financial Copilot</h3>
                <p className="text-[10px] text-primary-foreground/80 leading-tight mt-0.5">Privacy-First AI Agent</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-primary-foreground/80 hover:text-primary-foreground p-1 rounded-md transition-colors"
              aria-label="Close Chat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Quick Prompts */}
          <div className="p-2 border-b border-border bg-muted/40 flex items-center gap-1.5 overflow-x-auto text-[11px]">
            {quickPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSend(prompt)}
                disabled={loading}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-background border border-border hover:bg-accent text-foreground transition-colors shrink-0"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Messages */}
          <div className="flex-1 p-3 overflow-y-auto space-y-2.5 bg-background/50">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-xl text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-tr-none'
                      : 'bg-card border border-border text-foreground rounded-tl-none shadow-sm'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-card border border-border px-3 py-2 rounded-xl rounded-tl-none shadow-sm flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce"></span>
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.15s]"></span>
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.3s]"></span>
                </div>
              </div>
            )}
          </div>

          {/* Input Box */}
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
                placeholder="Ask about your finances..."
                className="flex-1 bg-muted/60 border border-border rounded-lg px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
              />
              <Button type="submit" size="sm" className="h-7 w-7 p-0 rounded-lg shrink-0" disabled={loading || !input.trim()}>
                <Send className="h-3.5 w-3.5" />
              </Button>
            </form>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
          aria-label="Open AI Copilot"
        >
          <Sparkles className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};
