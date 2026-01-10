import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Lock, Search, Filter, Star } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const categories = ['All', 'Leadership', 'Psychology', 'Templates', 'Frameworks'];

const resources = [
  {
    id: 1,
    title: 'The 90-Day Onboarding Checklist',
    category: 'Templates',
    type: 'PDF',
    locked: false,
    featured: true,
    description: 'A comprehensive guide to onboarding new team members effectively.',
  },
  {
    id: 2,
    title: 'The Difficult Conversation Script',
    category: 'Templates',
    type: 'PDF',
    locked: false,
    featured: false,
    description: 'Word-for-word scripts for handling challenging discussions.',
  },
  {
    id: 3,
    title: 'Jungian Shadow Work: Deep Dive',
    category: 'Psychology',
    type: 'White Paper',
    locked: false,
    featured: true,
    description: 'Understanding and integrating your shadow for leadership growth.',
  },
  {
    id: 4,
    title: 'The Vision Board Framework',
    category: 'Frameworks',
    type: 'Template',
    locked: false,
    featured: false,
    description: 'Structure your quarterly and annual vision with clarity.',
  },
  {
    id: 5,
    title: 'Stoic Decision Matrix',
    category: 'Frameworks',
    type: 'PDF',
    locked: true,
    featured: false,
    description: 'Apply Stoic philosophy to high-stakes business decisions.',
  },
  {
    id: 6,
    title: 'H2H Leadership Playbook',
    category: 'Leadership',
    type: 'eBook',
    locked: true,
    featured: true,
    description: 'The complete guide to Human-to-Human leadership methodology.',
  },
];

export const CodexTab = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredResources = resources.filter(resource => {
    const matchesCategory = activeCategory === 'All' || resource.category === activeCategory;
    const matchesSearch = searchQuery === '' || 
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredResource = filteredResources.find(r => r.featured && !r.locked) || resources.find(r => r.featured);

  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto pb-24 md:pb-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-display font-semibold text-foreground mb-2">
          The Codex
        </h1>
        <p className="text-lg text-muted-foreground">
          Battle-tested tools from The H2H Experiment, not just theory.
        </p>
      </motion.div>

      {/* Search & Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4 mb-8"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 h-12 bg-muted/50 border-border/50"
          />
        </div>
        <Button variant="outline" className="h-12 gap-2">
          <Filter className="w-4 h-4" />
          Filters
        </Button>
      </motion.div>

      {/* Categories */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none"
      >
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              activeCategory === cat
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            {cat}
          </button>
        ))}
      </motion.div>

      {/* Featured Banner */}
      {featuredResource && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-surface rounded-2xl p-8 mb-8 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-primary/20 to-secondary/10 rounded-full blur-3xl" />
          <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
              <FileText className="w-8 h-8 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-4 h-4 text-secondary fill-secondary" />
                <span className="text-xs font-medium text-secondary uppercase tracking-wider">Featured</span>
              </div>
              <h3 className="text-xl font-display font-semibold text-foreground mb-2">
                {featuredResource.title}
              </h3>
              <p className="text-muted-foreground">
                {featuredResource.description}
              </p>
            </div>
            <Button 
              className="bg-primary hover:bg-primary/90 glow-turquoise flex-shrink-0"
              disabled={featuredResource.locked}
            >
              {featuredResource.locked ? (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Upgrade to Access
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </>
              )}
            </Button>
          </div>
        </motion.div>
      )}

      {/* Resource Grid */}
      {filteredResources.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <p className="text-muted-foreground">No resources found matching your criteria.</p>
          <Button 
            variant="link" 
            onClick={() => { setActiveCategory('All'); setSearchQuery(''); }}
            className="mt-2"
          >
            Clear filters
          </Button>
        </motion.div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredResources.map((resource, index) => (
            <motion.div
              key={resource.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + index * 0.05 }}
              className={`glass-surface rounded-xl p-6 relative group ${
                resource.locked ? 'opacity-75' : ''
              }`}
            >
              {resource.locked && (
                <div className="absolute top-4 right-4">
                  <Lock className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
              {resource.featured && !resource.locked && (
                <div className="absolute top-4 right-4">
                  <Star className="w-4 h-4 text-secondary fill-secondary" />
                </div>
              )}
              
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-1 rounded-md bg-muted text-xs font-medium text-muted-foreground">
                  {resource.type}
                </span>
                <span className="px-2 py-1 rounded-md bg-primary/10 text-xs font-medium text-primary">
                  {resource.category}
                </span>
              </div>
              
              <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                {resource.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {resource.description}
              </p>
              
              <Button
                variant={resource.locked ? 'outline' : 'ghost'}
                size="sm"
                className={`w-full ${resource.locked ? 'border-muted-foreground/30' : ''}`}
                disabled={resource.locked}
              >
                {resource.locked ? (
                  <>
                    <Lock className="w-3 h-3 mr-2" />
                    Upgrade to Access
                  </>
                ) : (
                  <>
                    <Download className="w-3 h-3 mr-2" />
                    Download
                  </>
                )}
              </Button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
