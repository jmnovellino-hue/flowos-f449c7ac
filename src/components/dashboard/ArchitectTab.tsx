import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Sparkles, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const initialMessages: Message[] = [
  {
    id: '1',
    role: 'assistant',
    content: `Welcome back, Leader. I am The Architect—your guide through the inner landscape of leadership.

As a Hero archetype, you carry the weight of outcomes on your shoulders. Today, let us examine where that strength becomes shadow.

What's on your mind?`,
    timestamp: new Date(),
  },
];

const sampleResponses = [
  `I sense frustration beneath those words. As a Hero, your instinct is to take control—to "fix" the deadline yourself. But let's pause.

Jung would ask: *"What part of this failure is a reflection of you?"*

Your team missed the deadline. Before acting, consider:
- Did they have the resources they needed?
- Was the expectation clear, or was it clear only in your mind?
- Are you frustrated at them, or at your fear of being seen as ineffective?

The Stoics teach us: *"We cannot choose our external circumstances, but we can always choose how we respond."*

What would the most patient version of yourself do here?`,

  `This is the heart of leadership—holding complexity without rushing to resolution.

You mentioned "Wisdom" as one of your core values. Wisdom doesn't mean having all answers; it means sitting with uncertainty long enough for clarity to emerge.

Consider this Hermetic principle: *"As above, so below."* The chaos in your team often mirrors an internal chaos you haven't addressed.

Before your next meeting, I recommend a 3-minute centering practice:
1. Name three things you're grateful for about this team
2. Identify one assumption you're making that might be wrong
3. Enter the room with curiosity, not certainty

Would you like me to guide you through a pre-meeting prime?`,
];

export const ArchitectTab = () => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const responseIndex = Math.floor(Math.random() * sampleResponses.length);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: sampleResponses[responseIndex],
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b border-border/50">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center glow-emerald">
            <Sparkles className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-display font-semibold text-foreground">The Architect</h1>
            <p className="text-sm text-muted-foreground">Your AI leadership mentor</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 pb-32 md:pb-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
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
              <div
                className={`flex-1 ${
                  message.role === 'user' ? 'text-right' : ''
                }`}
              >
                <div
                  className={`inline-block p-4 rounded-2xl max-w-full ${
                    message.role === 'assistant'
                      ? 'glass-surface text-left'
                      : 'bg-secondary/10 border border-secondary/20'
                  }`}
                >
                  <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                    {message.content}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </motion.div>
          ))}
          
          {isLoading && (
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
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              size="icon"
              className="absolute right-2 bottom-2 w-10 h-10 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-50"
            >
              <Send className="w-4 h-4 text-primary-foreground" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-3">
            The Architect is context-aware and remembers your journey
          </p>
        </div>
      </div>
    </div>
  );
};
