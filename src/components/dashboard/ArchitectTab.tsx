import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Sparkles, User, Loader2, AlertCircle, RotateCcw, 
  BookOpen, Mic, MicOff, History, Plus, Save, Star, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { WisdomLibrary } from './WisdomLibrary';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface Conversation {
  id: string;
  title: string;
  updated_at: string;
}

interface ArchitectTabProps {
  userContext?: {
    name: string;
    archetype: string;
    values: string[];
    tier: string;
  };
  userId?: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/architect-chat`;
const SCRIBE_TOKEN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-scribe-token`;

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

export const ArchitectTab = ({ userContext, userId }: ArchitectTabProps) => {
  const [messages, setMessages] = useState<Message[]>([getInitialMessage(userContext?.name, userContext?.archetype)]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showWisdomLibrary, setShowWisdomLibrary] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [selectedText, setSelectedText] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (userContext && messages.length === 1 && messages[0].id === '1') {
      setMessages([getInitialMessage(userContext.name, userContext.archetype)]);
    }
  }, [userContext]);

  useEffect(() => {
    if (userId) {
      loadConversations();
    }
  }, [userId]);

  const loadConversations = async () => {
    if (!userId) return;
    try {
      const { data, error } = await supabase
        .from('architect_conversations')
        .select('id, title, updated_at')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setConversations(data || []);
    } catch (err) {
      console.error('Error loading conversations:', err);
    }
  };

  const saveConversation = async () => {
    if (!userId || messages.length <= 1) return;

    try {
      const title = messages.find(m => m.role === 'user')?.content.slice(0, 50) + '...' || 'New Conversation';
      const messagesJson = messages.map(m => ({
        role: m.role,
        content: m.content,
        timestamp: m.timestamp.toISOString(),
      }));

      if (conversationId) {
        await supabase
          .from('architect_conversations')
          .update({ messages: messagesJson, updated_at: new Date().toISOString() })
          .eq('id', conversationId);
      } else {
        const { data, error } = await supabase
          .from('architect_conversations')
          .insert({
            user_id: userId,
            title,
            messages: messagesJson,
          })
          .select('id')
          .single();

        if (error) throw error;
        setConversationId(data.id);
      }

      toast({ title: "Saved", description: "Conversation saved to history" });
      loadConversations();
    } catch (err) {
      console.error('Error saving conversation:', err);
      toast({ title: "Error", description: "Failed to save conversation", variant: "destructive" });
    }
  };

  const loadConversation = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('architect_conversations')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      const loadedMessages = (data.messages as any[]).map((m, index) => ({
        id: index.toString(),
        role: m.role as 'user' | 'assistant',
        content: m.content,
        timestamp: new Date(m.timestamp),
      }));

      setMessages(loadedMessages);
      setConversationId(id);
      setShowHistory(false);
    } catch (err) {
      console.error('Error loading conversation:', err);
    }
  };

  const deleteConversation = async (id: string) => {
    try {
      await supabase.from('architect_conversations').delete().eq('id', id);
      setConversations(prev => prev.filter(c => c.id !== id));
      if (conversationId === id) {
        handleReset();
      }
    } catch (err) {
      console.error('Error deleting conversation:', err);
    }
  };

  const saveInsight = async (content: string, layer?: string) => {
    if (!userId) {
      toast({ title: "Sign in required", description: "Please sign in to save insights", variant: "destructive" });
      return;
    }

    try {
      await supabase.from('architect_insights').insert({
        user_id: userId,
        conversation_id: conversationId,
        content,
        source_layer: layer || null,
      });

      toast({ title: "Saved!", description: "Insight added to your Wisdom Library" });
      setSelectedText(null);
    } catch (err) {
      console.error('Error saving insight:', err);
      toast({ title: "Error", description: "Failed to save insight", variant: "destructive" });
    }
  };

  // Voice input with ElevenLabs
  const startRecording = async () => {
    try {
      // Get scribe token
      const tokenResp = await fetch(SCRIBE_TOKEN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
      });

      if (!tokenResp.ok) {
        throw new Error('Failed to get speech token');
      }

      const { token } = await tokenResp.json();

      // Connect WebSocket
      const ws = new WebSocket(`wss://api.elevenlabs.io/v1/speech-to-text/stream?token=${token}&model_id=scribe_v2_realtime`);
      wsRef.current = ws;

      ws.onopen = async () => {
        console.log('WebSocket connected');
        
        // Send initial config
        ws.send(JSON.stringify({
          type: 'start',
          language_code: 'en',
        }));

        // Start microphone
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: { 
            echoCancellation: true, 
            noiseSuppression: true,
            sampleRate: 16000,
          } 
        });

        const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = async (event) => {
          if (event.data.size > 0 && ws.readyState === WebSocket.OPEN) {
            const buffer = await event.data.arrayBuffer();
            const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
            ws.send(JSON.stringify({
              type: 'audio',
              audio: base64,
            }));
          }
        };

        mediaRecorder.start(100); // Send chunks every 100ms
        setIsRecording(true);
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'partial_transcript' || data.type === 'committed_transcript') {
          setTranscript(prev => {
            if (data.type === 'committed_transcript') {
              return prev + ' ' + data.text;
            }
            return data.text;
          });
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        stopRecording();
      };

      ws.onclose = () => {
        console.log('WebSocket closed');
        setIsRecording(false);
      };

    } catch (err) {
      console.error('Error starting recording:', err);
      toast({ 
        title: "Microphone Error", 
        description: "Could not access microphone. Please check permissions.", 
        variant: "destructive" 
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      mediaRecorderRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setIsRecording(false);
    
    if (transcript.trim()) {
      setInput(prev => (prev + ' ' + transcript).trim());
      setTranscript('');
    }
  };

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

    // Auto-save after each exchange
    if (userId) {
      setTimeout(() => saveConversation(), 1000);
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
    setConversationId(null);
    setError(null);
  };

  const renderContent = (content: string) => {
    return content
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/^• /gm, '• ');
  };

  const handleTextSelection = (messageContent: string) => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      setSelectedText(selection.toString().trim());
    }
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
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setShowWisdomLibrary(true)} 
              title="Wisdom Library"
            >
              <BookOpen className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setShowHistory(!showHistory)} 
              title="Conversation History"
            >
              <History className="w-4 h-4" />
            </Button>
            {messages.length > 1 && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={saveConversation} 
                title="Save Conversation"
              >
                <Save className="w-4 h-4" />
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={handleReset} title="New Conversation">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* History Sidebar */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-border/50 overflow-hidden"
          >
            <div className="max-w-3xl mx-auto p-4">
              <h3 className="text-sm font-medium text-foreground mb-3">Recent Conversations</h3>
              {conversations.length === 0 ? (
                <p className="text-sm text-muted-foreground">No saved conversations yet</p>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {conversations.map((conv) => (
                    <div 
                      key={conv.id}
                      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                        conversationId === conv.id ? 'bg-primary/10' : 'hover:bg-muted/50'
                      }`}
                      onClick={() => loadConversation(conv.id)}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground truncate">{conv.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(conv.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteConversation(conv.id);
                        }}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Prompts */}
      {messages.length <= 2 && !showHistory && (
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

      {/* Save Insight Tooltip */}
      <AnimatePresence>
        {selectedText && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 glass-surface rounded-xl p-3 shadow-lg"
          >
            <div className="flex items-center gap-2">
              <p className="text-sm text-muted-foreground max-w-xs truncate">
                "{selectedText.slice(0, 50)}..."
              </p>
              <Button size="sm" onClick={() => saveInsight(selectedText)}>
                <Star className="w-3 h-3 mr-1" />
                Save to Library
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setSelectedText(null)}>
                <X className="w-3 h-3" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
                  onMouseUp={() => message.role === 'assistant' && handleTextSelection(message.content)}
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
          {/* Voice Transcript Preview */}
          {(isRecording || transcript) && (
            <div className="mb-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                <span className="text-sm text-primary">
                  {transcript || 'Listening...'}
                </span>
              </div>
            </div>
          )}
          
          <div className="relative flex gap-2">
            <Button
              onClick={isRecording ? stopRecording : startRecording}
              size="icon"
              variant={isRecording ? "destructive" : "outline"}
              className="flex-shrink-0 w-12 h-12 rounded-xl"
              title={isRecording ? "Stop recording" : "Voice input"}
            >
              {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </Button>
            
            <div className="relative flex-1">
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
          </div>
          <p className="text-xs text-muted-foreground text-center mt-3">
            Powered by The H2H Experiment • 19 Minds, One Synthesis • Select text to save insights
          </p>
        </div>
      </div>

      {/* Wisdom Library */}
      {userId && (
        <WisdomLibrary 
          isOpen={showWisdomLibrary} 
          onClose={() => setShowWisdomLibrary(false)}
          userId={userId}
        />
      )}
    </div>
  );
};
