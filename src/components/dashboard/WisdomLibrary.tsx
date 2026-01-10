import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, BookOpen, Star, Trash2, Search, Filter, 
  Lightbulb, Shield, Heart, Brain, Sword, Sparkles 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Insight {
  id: string;
  content: string;
  source_layer: string | null;
  tags: string[] | null;
  is_favorite: boolean;
  created_at: string;
}

interface WisdomLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

const layerIcons: Record<string, React.ReactNode> = {
  bedrock: <Shield className="w-4 h-4" />,
  mirror: <Brain className="w-4 h-4" />,
  bridge: <Heart className="w-4 h-4" />,
  engine: <Lightbulb className="w-4 h-4" />,
  weapon: <Sword className="w-4 h-4" />,
};

const layerColors: Record<string, string> = {
  bedrock: 'text-blue-400 bg-blue-400/10',
  mirror: 'text-purple-400 bg-purple-400/10',
  bridge: 'text-pink-400 bg-pink-400/10',
  engine: 'text-green-400 bg-green-400/10',
  weapon: 'text-orange-400 bg-orange-400/10',
};

const layerNames: Record<string, string> = {
  bedrock: 'The Bedrock',
  mirror: 'The Mirror',
  bridge: 'The Bridge',
  engine: 'The Engine',
  weapon: 'The Weapon',
};

export const WisdomLibrary = ({ isOpen, onClose, userId }: WisdomLibraryProps) => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && userId) {
      fetchInsights();
    }
  }, [isOpen, userId]);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('architect_insights')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInsights(data || []);
    } catch (error) {
      console.error('Error fetching insights:', error);
      toast({
        title: "Error",
        description: "Failed to load your wisdom library",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (insight: Insight) => {
    try {
      const { error } = await supabase
        .from('architect_insights')
        .update({ is_favorite: !insight.is_favorite })
        .eq('id', insight.id);

      if (error) throw error;
      setInsights(prev => prev.map(i => 
        i.id === insight.id ? { ...i, is_favorite: !i.is_favorite } : i
      ));
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const deleteInsight = async (id: string) => {
    try {
      const { error } = await supabase
        .from('architect_insights')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setInsights(prev => prev.filter(i => i.id !== id));
      toast({
        title: "Deleted",
        description: "Insight removed from your library",
      });
    } catch (error) {
      console.error('Error deleting insight:', error);
    }
  };

  const filteredInsights = insights.filter(insight => {
    const matchesSearch = searchQuery === '' || 
      insight.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === null || insight.source_layer === activeFilter;
    const matchesFavorites = !showFavoritesOnly || insight.is_favorite;
    return matchesSearch && matchesFilter && matchesFavorites;
  });

  const layers = ['bedrock', 'mirror', 'bridge', 'engine', 'weapon'];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          
          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-2xl bg-card border-l border-border z-50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-secondary/20 to-primary/10 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <h2 className="font-display text-lg font-semibold text-foreground">Wisdom Library</h2>
                  <p className="text-xs text-muted-foreground">{insights.length} saved insights</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Search & Filters */}
            <div className="p-4 border-b border-border space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search your wisdom..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  variant={showFavoritesOnly ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                  className="text-xs"
                >
                  <Star className="w-3 h-3 mr-1" />
                  Favorites
                </Button>
                
                {layers.map((layer) => (
                  <Button
                    key={layer}
                    variant={activeFilter === layer ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveFilter(activeFilter === layer ? null : layer)}
                    className="text-xs"
                  >
                    {layerIcons[layer]}
                    <span className="ml-1 hidden sm:inline">{layerNames[layer]}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Insights List */}
            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="flex items-center justify-center h-40">
                  <Sparkles className="w-6 h-6 text-primary animate-pulse" />
                </div>
              ) : filteredInsights.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="text-muted-foreground">
                    {insights.length === 0 
                      ? "Your wisdom library is empty. Save insights from your Architect conversations!"
                      : "No insights match your filters"}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredInsights.map((insight) => (
                    <motion.div
                      key={insight.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="glass-surface rounded-xl p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          {insight.source_layer && (
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium mb-2 ${layerColors[insight.source_layer]}`}>
                              {layerIcons[insight.source_layer]}
                              {layerNames[insight.source_layer]}
                            </span>
                          )}
                          <p className="text-foreground text-sm leading-relaxed whitespace-pre-wrap">
                            {insight.content}
                          </p>
                          {insight.tags && insight.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {insight.tags.map((tag) => (
                                <span 
                                  key={tag}
                                  className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(insight.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex flex-col gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleFavorite(insight)}
                            className={insight.is_favorite ? 'text-secondary' : 'text-muted-foreground'}
                          >
                            <Star className="w-4 h-4" fill={insight.is_favorite ? 'currentColor' : 'none'} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteInsight(insight.id)}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
