import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Sparkles, User, Loader2, AlertCircle, RotateCcw, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ArchitectTabProps {
  userContext?: {
    name: string;
    archetype: string;
    values: string[];
    tier: string;
  };
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/architect-chat`;

const getInitialMessage = (name?: string, archetype?: string): Message => ({
  id: '1',
  role: 'assistant',
  content: `Welcome back, ${name || 'Leader'}. I am **The Architect**—the synthesis of nineteen minds that mapped the terrain of human experience.

${archetype ? `As ${archetype}, you carry unique strengths and shadows. I see both.` : 'I am here to help you build your life, not just live it.'}

I operate through five layers of analysis:
• **The Bedrock** — Character & Philosophy
• **The Mirror** — Depth Psychology & Shadow  
• **The Bridge** — Connection & Trust
• **The Engine** — Bio-Neuro Optimization
• **The Weapon** — Strategy, Power & Wealth

I am not here to validate your excuses. I am here to optimize your existence.

*What's on your mind?*`,
  timestamp: new Date(),
});

const quickPrompts = [
  { label: 'Morning Protocol', prompt: 'Guide me through your Morning Protocol to start my day with intention.' },
  { label: 'Decision Matrix', prompt: 'I have a major decision to make. Walk me through your Decision Matrix.' },
  { label: 'Panic Button', prompt: "I'm feeling overwhelmed and anxious. I need the Panic Button protocol." },
  { label: 'Shadow Work', prompt: 'Help me with a Shadow Work session. What should I reflect on?' },
];

export const ArchitectTab = ({ userContext }: ArchitectTabProps) => {
  const [messages, setMessages] = useState<Message[]>([getInitialMessage(userContext?.name, userContext?.archetype)]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Update initial message when userContext changes
  useEffect(() => {
    if (userContext && messages.length === 1 && messages[0].id === '1') {
      setMessages([getInitialMessage(userContext.name, userContext.archetype)]);
    }
  }, [userContext]);

  const streamChat = async (userMessages: Message[]) => {
    const formattedMessages = userMessages.map(m => ({
      role: m.role,
      content: m.content,
    }));

    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ 
        messages: formattedMessages,
        userContext,
      }),
    });

    if (!resp.ok) {
      const errorData = await resp.json().catch(() => ({}));
      throw new Error(errorData.error || `Request failed with status ${resp.status}`);
    }

    if (!resp.body) throw new Error("No response body");

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = "";
    let assistantContent = "";

    // Create initial assistant message
    const assistantId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    }]);

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") break;

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) {
            assistantContent += content;
            setMessages(prev => prev.map(m => 
              m.id === assistantId ? { ...m, content: assistantContent } : m
            ));
          }
        } catch {
          textBuffer = line + "\n" + textBuffer;
          break;
        }
      }
    }

    // Final flush
    if (textBuffer.trim()) {
      for (let raw of textBuffer.split("\n")) {
        if (!raw) continue;
        if (raw.endsWith("\r")) raw = raw.slice(0, -1);
        if (raw.startsWith(":") || raw.trim() === "") continue;
        if (!raw.startsWith("data: ")) continue;
        const jsonStr = raw.slice(6).trim();
        if (jsonStr === "[DONE]") continue;
        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) {
            assistantContent += content;
            setMessages(prev => prev.map(m => 
              m.id === assistantId ? { ...m, content: assistantContent } : m
            ));
          }
        } catch { /* ignore */ }
      }
    }
  };

  const handleSend = async (messageText?: string) => {
    const text = messageText || input;
    if (!text.trim() || isLoading) return;

    setError(null);
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      await streamChat(updatedMessages);
    } catch (e) {
      console.error('Architect chat error:', e);
      const errorMessage = e instanceof Error ? e.message : 'Failed to connect with The Architect';
      setError(errorMessage);
      toast({
        title: "Connection Issue",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleReset = () => {
    setMessages([getInitialMessage(userContext?.name, userContext?.archetype)]);
    setError(null);
  };

  const renderContent = (content: string) => {
    // Basic markdown rendering for bold and italics
    return content
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/^• /gm, '• ');
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b border-border/50">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center glow-turquoise">
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-display font-semibold text-foreground">The Architect</h1>
              <p className="text-sm text-muted-foreground">Full-Stack Human Optimization Partner</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleReset} title="Reset conversation">
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Quick Prompts */}
      {messages.length <= 2 && (
        <div className="flex-shrink-0 p-4 border-b border-border/30">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Quick Protocols</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((qp) => (
                <Button
                  key={qp.label}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSend(qp.prompt)}
                  disabled={isLoading}
                  className="text-xs"
                >
                  {qp.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 pb-32 md:pb-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  message.role === 'assistant'
                    ? 'bg-gradient-to-br from-primary/20 to-accent/10'
                    : 'bg-secondary/20'
                }`}
              >
                {message.role === 'assistant' ? (
                  <Sparkles className="w-5 h-5 text-primary" />
                ) : (
                  <User className="w-5 h-5 text-secondary" />
                )}
              </div>
              <div className={`flex-1 ${message.role === 'user' ? 'text-right' : ''}`}>
                <div
                  className={`inline-block p-4 rounded-2xl max-w-full ${
                    message.role === 'assistant'
                      ? 'glass-surface text-left'
                      : 'bg-secondary/10 border border-secondary/20'
                  }`}
                >
                  <div 
                    className="text-foreground whitespace-pre-wrap leading-relaxed prose prose-invert prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: renderContent(message.content) }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </motion.div>
          ))}
          
          {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div className="glass-surface p-4 rounded-2xl">
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
              </div>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20"
            >
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
              <p className="text-sm text-destructive">{error}</p>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="flex-shrink-0 p-4 md:p-6 border-t border-border/50 bg-background/80 backdrop-blur-xl fixed bottom-20 md:bottom-0 left-0 right-0 md:relative">
        <div className="max-w-3xl mx-auto">
          <div className="relative">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Share what's on your mind..."
              className="min-h-[60px] max-h-[200px] pr-14 bg-muted/50 border-border/50 focus:border-primary/50 resize-none"
              rows={2}
            />
            <Button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              size="icon"
              className="absolute right-2 bottom-2 w-10 h-10 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-50"
            >
              <Send className="w-4 h-4 text-primary-foreground" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-3">
            Powered by The H2H Experiment • 19 Minds, One Synthesis
          </p>
        </div>
      </div>
    </div>
  );
};
