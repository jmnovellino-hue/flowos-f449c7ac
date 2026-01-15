import { motion } from 'framer-motion';
import { Play, Headphones, Clock, Lock, Brain, Moon, Zap, Volume2, Sparkles, Heart, Podcast, ExternalLink, Bell } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MeditationBuilder } from '@/components/studio/MeditationBuilder';
import { PerformanceBuilder } from '@/components/studio/PerformanceBuilder';
import { ScriptViewer } from '@/components/studio/ScriptViewer';
import { useAudioScripts } from '@/hooks/useAudioScripts';

interface AudioCategory {
  id: string;
  label: string;
  description: string;
  icon: typeof Brain;
  hasAiBuilder: boolean;
}

const audioCategories: AudioCategory[] = [
  { 
    id: 'meditation', 
    label: 'Meditation', 
    description: 'Craft a personalized guided meditation tailored to your intentions—choose breathing, grounding, affirmations, manifestation, or gratitude to build your practice.',
    icon: Brain,
    hasAiBuilder: true,
  },
  { 
    id: 'sleep', 
    label: 'Sleep Better', 
    description: 'Wind down with frequency-tuned audio designed to calm your nervous system and prepare you for deep, restorative rest.',
    icon: Moon,
    hasAiBuilder: false,
  },
  { 
    id: 'performance', 
    label: 'Peak Performance Primer', 
    description: 'Get mentally primed for high-stakes moments—receive wisdom, reframes, and grounding techniques tailored to the challenge you\'re about to face.',
    icon: Zap,
    hasAiBuilder: true,
  },
  { 
    id: 'podcast', 
    label: 'H2H Podcast', 
    description: 'Listen to The H2H Experiment podcast—deep conversations on leadership, performance psychology, and human transformation.',
    icon: Podcast,
    hasAiBuilder: false,
  },
];

// Sleep frequency options with real content
const sleepContent = [
  {
    id: 'sleep-delta',
    title: 'Delta Deep Rest',
    frequency: '0.5-4Hz',
    duration: '60:00',
    description: 'Delta wave frequencies guide your brain into the deepest stages of restorative sleep. This is where physical healing, immune function, and cellular regeneration occur. Best used when you need maximum recovery.',
    locked: false,
  },
  {
    id: 'sleep-theta',
    title: 'Theta Twilight',
    frequency: '4-8Hz',
    duration: '45:00',
    description: 'Theta frequencies accompany the hypnagogic state—the liminal space between waking and sleeping. This track helps quiet the analytical mind and drift into peaceful rest. Ideal for racing thoughts.',
    locked: false,
  },
  {
    id: 'sleep-schumann',
    title: 'Earth Resonance',
    frequency: '7.83Hz',
    duration: '60:00',
    description: 'The Schumann Resonance is Earth\'s natural electromagnetic frequency. Entraining your brainwaves to this frequency promotes grounding, circadian regulation, and deep harmony with natural rhythms.',
    locked: false,
  },
  {
    id: 'sleep-432',
    title: 'Harmonic Restoration',
    frequency: '432Hz',
    duration: '45:00',
    description: 'Known as the "natural tuning," 432Hz is said to be mathematically consistent with the patterns of the universe. This frequency calms the nervous system and reduces anxiety before sleep.',
    locked: true,
  },
  {
    id: 'sleep-528',
    title: 'DNA Repair Sleep',
    frequency: '528Hz',
    duration: '60:00',
    description: 'The "love frequency" or "miracle tone" is associated with DNA repair and cellular healing. Used by leaders who need to maximize recovery during limited sleep windows.',
    locked: true,
  },
  {
    id: 'sleep-rain',
    title: 'Neural Rain',
    frequency: 'Pink Noise',
    duration: '120:00',
    description: 'Filtered pink noise mimics the spectral pattern of natural rain. It masks disruptive sounds while providing consistent audio texture that promotes and maintains deep sleep throughout the night.',
    locked: true,
  },
];

// Pre-made meditation content with real H2H scripts
const meditationContent = [
  {
    id: 'med-morning',
    title: 'The Morning Architect',
    duration: '12:00',
    description: 'Start your day by consciously designing your internal state. This guided practice combines breathwork, intention-setting, and visualization to architect your mindset before the world demands your attention.',
    locked: false,
    script: `Welcome to The Morning Architect.

Before the emails. Before the meetings. Before the demands of the world reach you—you have this moment to architect your internal state.

Take a deep breath in through your nose... hold it at the top... and release slowly through your mouth.

You are not just waking up today. You are building yourself.

Let your awareness settle into your body. Feel the weight of your limbs. The rhythm of your heart. You are here. You are present. You are alive.

Now, ask yourself: Who do I need to be today? Not what do I need to do—but who must I become to meet this day with power?

See that version of yourself clearly. How do they hold themselves? How do they speak? How do they respond to challenge?

This is your North Star for today. Not a to-do list, but an identity to embody.

Take three more deep breaths, anchoring this vision into your nervous system...

You are ready. Not because the day will be easy—but because you have chosen who you will be when it gets hard.

Open your eyes when you're ready. Go architect your day.`,
  },
  {
    id: 'med-breath',
    title: 'The 3-Breath Reset',
    duration: '3:00',
    description: 'A rapid pattern interrupt for high-pressure moments. When your nervous system is hijacked by stress, these three intentional breaths return you to center. Used before crucial decisions or after triggering events.',
    locked: false,
    script: `The 3-Breath Reset.

Stop everything. Right now, you get three breaths to change your state.

Breath One—The Pause.
Inhale deeply through your nose for 4 counts... Hold for 4... Exhale for 6.
This breath stops the momentum of reaction.

Breath Two—The Release.
Inhale again, and this time, imagine breathing out everything that's not serving you... The tension. The story. The urgency that's lying to you.
Let it go on the exhale.

Breath Three—The Return.
One final breath. As you inhale, feel yourself returning to center. To presence. To choice.
You exhale, and you are here.

Whatever was running you five seconds ago no longer has control.

You're ready. Move forward with intention.`,
  },
  {
    id: 'med-body',
    title: 'The Leader\'s Body Scan',
    duration: '15:00',
    description: 'Your body holds the wisdom your mind ignores. This practice guides you through a complete body scan, releasing stored tension and reconnecting with somatic intelligence. Essential for leaders who live in their heads.',
    locked: true,
    script: `The Leader's Body Scan.

Most leaders live from the neck up. They've outsourced their body to caffeine and willpower. But your body is speaking—and today, you're going to listen.

Lie down or sit comfortably. Close your eyes.

We'll move through each area of your body, not trying to change anything, just noticing what's there.

Starting with the crown of your head...
What sensation lives here? Pressure? Tightness? Nothing at all?
Just notice.

Moving down to your forehead... your eyes... your jaw.
The jaw holds the words we didn't say. What's living there?

Your neck and shoulders—where responsibility often calcifies into tension...
Breathe into whatever you find.

Down through your arms... your hands... fingertips.
Leaders act with their hands. What energy lives there?

Your chest—the seat of emotion.
What's present in your heart right now?

Your belly—where gut instinct lives.
What does your gut know that your mind hasn't admitted?

Your lower back... hips... legs... feet.

Your body has been carrying your leadership. Thank it. And let it rest.`,
  },
  {
    id: 'med-evening',
    title: 'The Day Completion',
    duration: '10:00',
    description: 'Close the loops of your day before sleep. This practice helps you process experiences, release what no longer serves, and consciously close the chapter so tomorrow starts fresh.',
    locked: true,
    script: `The Day Completion.

The day is done. Before you carry it into sleep, let's close it properly.

Take a breath and let your body settle.

First, recall three moments of genuine effort today. Not necessarily success—but moments you showed up fully. Let yourself feel satisfaction for those.

Now, is there anything you're still holding? A conversation that went sideways. A decision you're second-guessing. A tension that followed you home.

See it clearly. Name it internally.

And now, consciously, set it down. Not because it's resolved—but because holding it overnight won't help you. Tomorrow's version of you can pick it up if needed.

Finally, plant a seed for tomorrow. What quality do you want to embody when you wake? Patience. Courage. Clarity. Choose one.

The day is complete. You did your best with what you had. That's always enough.

Sleep well, leader. Tomorrow needs the rested version of you.`,
  },
];

// Pre-made performance content with real H2H primers
const performanceContent = [
  {
    id: 'perf-board',
    title: 'Before the Board',
    duration: '4:32',
    description: 'Prime your nervous system for high-stakes boardroom presence. This primer combines grounding, power posing, and strategic mindset preparation. You\'ll walk in regulated and ready.',
    locked: false,
    script: `Before the Board.

In a few minutes, you'll walk into a room where eyes will be on you. Where your words will be measured. Where your presence matters as much as your content.

Let's prepare you properly.

First, your body. Stand or sit tall. Shoulders back. Jaw relaxed. You are not going in to prove yourself—you belong in that room.

Take a deep breath. On the exhale, release any need for approval.

Remember: You are not performing. You are serving. Every word you speak is in service of the mission, not your ego.

Now, see the room in your mind. See the faces. And imagine them not as judges—but as allies you haven't convinced yet.

Your job is simple: Be clear. Be calm. Be compelling.

Whatever happens in there, your worth is not on the table. Only your ideas.

One final breath. Ground yourself in your feet. You're ready.

Walk in like you've been there a thousand times. Because in a way, you have.`,
  },
  {
    id: 'perf-convo',
    title: 'The Hard Conversation',
    duration: '5:22',
    description: 'Mental preparation before difficult conversations—performance reviews, terminations, boundary-setting, or crucial feedback. Ground yourself in compassion and clarity.',
    locked: false,
    script: `The Hard Conversation.

You're about to have a conversation you've been dreading. That discomfort? It means you care about doing this right. Let's use that energy.

First, ground yourself. Feel your feet on the floor. You are solid. You are present.

Remind yourself why this conversation matters. It's not about being liked—it's about being truthful. And sometimes truth is the greatest gift we can give someone.

Take a breath and recall your intention. What do you want this person to understand? Not just hear—but truly get?

Now, prepare for their reaction. They might be defensive. They might be hurt. They might surprise you. Whatever happens, you can hold space for it.

Your job is not to control their response. Your job is to speak your truth with respect and listen to theirs.

One more thing: You don't have to be perfect. You just have to be honest and kind in equal measure.

Take a final breath. You've prepared. You're ready.

This is what leadership looks like. Not the easy conversations—but the necessary ones.

Go.`,
  },
  {
    id: 'perf-negotiate',
    title: 'Negotiation State',
    duration: '6:45',
    description: 'Enter any negotiation centered and strategic. This primer activates calm confidence, detachment from outcome, and the ability to hold multiple perspectives simultaneously.',
    locked: true,
    script: `Negotiation State.

Every negotiation is a dance between positions. And the person who is most grounded, most present, most able to detach from needing a specific outcome—has the advantage.

Let's get you there.

Close your eyes. Take three slow breaths, each one deeper than the last.

Now, remember: This negotiation is not about winning. It's about creating value. The goal is not to beat them—it's to find the solution that serves both parties.

Imagine the best possible outcome. See it clearly. Feel what it would be like to walk away with that result.

Now, let it go. Release your attachment to that specific outcome.

Why? Because attachment makes you rigid. And rigidity loses negotiations.

Instead, anchor yourself in your BATNA—your best alternative. You know what you'll do if this doesn't work out. That knowledge gives you power.

When you walk in, be curious. Ask more questions than you answer. Seek to understand their world before demanding they understand yours.

And remember: Silence is a tool. You don't have to fill every pause.

Take one more breath. You're calm. You're prepared. You're ready to dance.

Let's go.`,
  },
  {
    id: 'perf-present',
    title: 'The Big Presentation',
    duration: '5:00',
    description: 'Transform presentation anxiety into performance energy. This primer helps you channel nervous activation into compelling delivery. Perfect before keynotes, pitches, or all-hands.',
    locked: true,
    script: `The Big Presentation.

Those butterflies in your stomach? They're not weakness. They're power waiting to be channeled.

Your nervous system knows something important is about to happen. Good. That means you care. Let's convert that energy into presence.

Stand up if you can. Shake out your hands. Roll your shoulders back. Your body language speaks before your words do.

Now, take a breath deep into your belly. Hold for a moment. And release slowly.

Remember this: You are not the content. You are the vessel. Your job is to serve your audience, not to impress them.

Think about one person in that audience who needs what you're about to share. Maybe they're struggling with exactly what you'll address. Speak to them.

When you walk on that stage or into that room, make eye contact. Pause before you begin. Let them see that you're present.

You don't need to be perfect. You need to be real.

And if you lose your place? Pause. Breathe. The audience will wait. In fact, they'll respect you more for being human.

One final breath. You've prepared. You know your material. Now trust yourself to deliver it.

It's showtime.`,
  },
];

// Podcast episodes
const podcastEpisodes = [
  {
    id: 'ep-latest',
    title: 'Latest Episode',
    description: 'Listen to the newest episode of The H2H Experiment podcast.',
    isLatest: true,
  },
  {
    id: 'ep-all',
    title: 'All Episodes',
    description: 'Browse and listen to the full podcast archive on Spotify.',
    isLatest: false,
  },
];

const SPOTIFY_PODCAST_URL = 'https://open.spotify.com/show/2ETfRLDqlvv2kfH6y8vs69?si=34acb65b2294464c';

export const StudioTab = () => {
  const [activeCategory, setActiveCategory] = useState<string>('meditation');
  const [showMeditationBuilder, setShowMeditationBuilder] = useState(false);
  const [showPerformanceBuilder, setShowPerformanceBuilder] = useState(false);
  const [generatedScript, setGeneratedScript] = useState<{ script: string; title: string; category: 'meditation' | 'performance'; backgroundFrequency?: 'nature' | 'elevate' | 'enlightenment' } | null>(null);
  const [viewingSavedScript, setViewingSavedScript] = useState<{ id: string; script: string; title: string; category: 'meditation' | 'performance'; isFavorite: boolean; audioUrl?: string; backgroundFrequency?: string } | null>(null);
  const [viewingPremadeContent, setViewingPremadeContent] = useState<{ script: string; title: string; category: 'meditation' | 'performance' } | null>(null);

  const { scripts, favorites, saveScript, toggleFavorite, loading } = useAudioScripts();

  const activeCategoryData = audioCategories.find(c => c.id === activeCategory);
  const CategoryIcon = activeCategoryData?.icon || Headphones;

  const getContentForCategory = () => {
    switch (activeCategory) {
      case 'meditation': return meditationContent;
      case 'sleep': return sleepContent;
      case 'performance': return performanceContent;
      default: return [];
    }
  };

  const getSavedScriptsForCategory = () => {
    if (activeCategory === 'sleep' || activeCategory === 'podcast') return [];
    return scripts.filter(s => s.category === activeCategory);
  };

  const handleMeditationComplete = (script: string, backgroundFrequency: 'nature' | 'elevate' | 'enlightenment') => {
    setShowMeditationBuilder(false);
    setGeneratedScript({ script, title: 'Custom Meditation', category: 'meditation', backgroundFrequency });
  };

  const handlePerformanceComplete = (script: string, situation: string) => {
    setShowPerformanceBuilder(false);
    setGeneratedScript({ script, title: `Primer: ${situation}`, category: 'performance' });
  };

  const handleSaveScript = async (title: string, script: string, category: 'meditation' | 'performance') => {
    return await saveScript(title, script, category);
  };

  const openSpotifyPodcast = () => {
    window.open(SPOTIFY_PODCAST_URL, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto pb-24 md:pb-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-display font-semibold text-foreground mb-2">
          The Studio
        </h1>
        <p className="text-lg text-muted-foreground">
          H2H AI-powered audio for the liminal spaces of your day.
        </p>
      </motion.div>

      {/* Now Playing Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-surface rounded-2xl p-6 mb-8"
      >
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0 glow-turquoise">
            <Headphones className="w-8 h-8 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-primary font-medium uppercase tracking-wider mb-1">Now Playing</p>
            <h3 className="text-lg font-semibold text-foreground truncate">Select an audio to play</h3>
            <p className="text-sm text-muted-foreground">Choose from the categories below</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-muted-foreground" />
              <div className="w-24 h-1 bg-muted rounded-full">
                <div className="w-0 h-full bg-primary rounded-full" />
              </div>
            </div>
            <Button
              size="icon"
              className="w-12 h-12 rounded-full bg-muted hover:bg-muted/80"
              disabled
            >
              <Play className="w-5 h-5 text-muted-foreground ml-0.5" />
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Categories */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mb-8"
      >
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-none">
          {audioCategories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                  activeCategory === cat.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon className="w-4 h-4" />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Category Description */}
        {activeCategoryData?.description && (
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-muted/30 rounded-lg p-4 mt-2"
          >
            <p className="text-sm text-muted-foreground mb-3">
              {activeCategoryData.description}
            </p>
            {activeCategoryData.hasAiBuilder && (
              <Button
                onClick={() => {
                  if (activeCategory === 'meditation') setShowMeditationBuilder(true);
                  if (activeCategory === 'performance') setShowPerformanceBuilder(true);
                }}
                className="gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Create Custom {activeCategory === 'meditation' ? 'Meditation' : 'Primer'}
              </Button>
            )}
            {activeCategory === 'podcast' && (
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={openSpotifyPodcast}
                  className="gap-2"
                >
                  <Podcast className="w-4 h-4" />
                  Open on Spotify
                  <ExternalLink className="w-3 h-3" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    // This could be enhanced with push notifications
                    window.open(SPOTIFY_PODCAST_URL, '_blank', 'noopener,noreferrer');
                  }}
                  className="gap-2"
                >
                  <Bell className="w-4 h-4" />
                  Follow for Updates
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* Podcast Section */}
      {activeCategory === 'podcast' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* Spotify Embed */}
          <div className="glass-surface rounded-2xl p-6 overflow-hidden">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2 mb-4">
              <Podcast className="w-4 h-4 text-primary" />
              The H2H Experiment Podcast
            </h3>
            <div className="rounded-xl overflow-hidden">
              <iframe 
                style={{ borderRadius: '12px' }}
                src="https://open.spotify.com/embed/show/2ETfRLDqlvv2kfH6y8vs69?utm_source=generator&theme=0" 
                width="100%" 
                height="352" 
                frameBorder="0" 
                allowFullScreen 
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                loading="lazy"
                className="bg-background"
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid gap-4 md:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="glass-surface rounded-xl p-5 flex items-start gap-4 group hover:border-primary/30 transition-all cursor-pointer"
              onClick={openSpotifyPodcast}
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/10 flex items-center justify-center flex-shrink-0">
                <Podcast className="w-5 h-5 text-green-500" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                  Listen on Spotify
                </h3>
                <p className="text-sm text-muted-foreground">
                  Access the full podcast library and subscribe for new episodes.
                </p>
              </div>
              <ExternalLink className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-surface rounded-xl p-5 flex items-start gap-4 group hover:border-primary/30 transition-all cursor-pointer"
              onClick={() => window.open('https://theh2hexperiment.com/our-podcast', '_blank', 'noopener,noreferrer')}
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center flex-shrink-0">
                <ExternalLink className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                  Visit Podcast Website
                </h3>
                <p className="text-sm text-muted-foreground">
                  Show notes, resources, and additional content for each episode.
                </p>
              </div>
              <ExternalLink className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* Favorites Section */}
      {favorites.length > 0 && activeCategory !== 'podcast' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2 mb-3">
            <Heart className="w-4 h-4 text-red-500" />
            Favorites
          </h3>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
            {favorites.map((script) => (
              <button
                key={script.id}
                onClick={() => setViewingSavedScript({
                  id: script.id,
                  script: script.script,
                  title: script.title,
                  category: script.category,
                  isFavorite: script.is_favorite,
                  audioUrl: script.audio_url || undefined,
                })}
                className="flex-shrink-0 glass-surface rounded-xl p-4 hover:border-primary/30 transition-all text-left min-w-[200px]"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                  <span className="text-xs text-muted-foreground capitalize">{script.category}</span>
                </div>
                <h4 className="font-medium text-foreground truncate">{script.title}</h4>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Saved Scripts Section */}
      {getSavedScriptsForCategory().length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mb-8"
        >
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-primary" />
            Your Library
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {getSavedScriptsForCategory().map((script) => (
              <motion.button
                key={script.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setViewingSavedScript({
                  id: script.id,
                  script: script.script,
                  title: script.title,
                  category: script.category,
                  isFavorite: script.is_favorite,
                  audioUrl: script.audio_url || undefined,
                })}
                className="glass-surface rounded-xl p-5 flex items-start gap-4 group hover:border-primary/30 transition-all text-left"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">AI Generated</span>
                    {script.is_favorite && <Heart className="w-3 h-3 text-red-500 fill-red-500" />}
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-1 truncate group-hover:text-primary transition-colors">
                    {script.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {script.script.substring(0, 80)}...
                  </p>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Audio Grid - Only show for non-podcast categories */}
      {activeCategory !== 'podcast' && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <CategoryIcon className="w-4 h-4" />
            {activeCategory === 'sleep' ? 'Frequency Library' : 'Ready-Made Sessions'}
          </h3>
          
          <div className="grid gap-4 md:grid-cols-2">
            {getContentForCategory().map((audio, index) => (
              <motion.div
                key={audio.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.05 }}
                className={`glass-surface rounded-xl p-5 flex items-start gap-4 group hover:border-primary/30 transition-all ${
                  audio.locked ? 'opacity-70' : ''
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  audio.locked 
                    ? 'bg-muted' 
                    : 'bg-gradient-to-br from-primary/20 to-accent/10 group-hover:from-primary/30 group-hover:to-accent/20'
                }`}>
                  {audio.locked ? (
                    <Lock className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <CategoryIcon className="w-5 h-5 text-primary" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {'frequency' in audio && typeof audio.frequency === 'string' && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-accent/20 text-accent">
                        {audio.frequency}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-1 truncate group-hover:text-primary transition-colors">
                    {audio.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {audio.description}
                  </p>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span className="text-xs">{audio.duration}</span>
                  </div>
                  {!audio.locked && 'script' in audio && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="w-10 h-10 rounded-full hover:bg-primary/10"
                      onClick={() => setViewingPremadeContent({
                        script: (audio as typeof meditationContent[0]).script,
                        title: audio.title,
                        category: activeCategory === 'performance' ? 'performance' : 'meditation'
                      })}
                    >
                      <Play className="w-4 h-4 text-primary ml-0.5" />
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      {showMeditationBuilder && (
        <MeditationBuilder
          onComplete={handleMeditationComplete}
          onCancel={() => setShowMeditationBuilder(false)}
        />
      )}
      {showPerformanceBuilder && (
        <PerformanceBuilder
          onComplete={handlePerformanceComplete}
          onCancel={() => setShowPerformanceBuilder(false)}
        />
      )}
      {generatedScript && (
        <ScriptViewer
          script={generatedScript.script}
          title={generatedScript.title}
          category={generatedScript.category}
          backgroundFrequency={generatedScript.backgroundFrequency}
          onClose={() => setGeneratedScript(null)}
          onSave={handleSaveScript}
        />
      )}
      {viewingSavedScript && (
        <ScriptViewer
          script={viewingSavedScript.script}
          title={viewingSavedScript.title}
          category={viewingSavedScript.category}
          onClose={() => setViewingSavedScript(null)}
          onSave={handleSaveScript}
          savedScriptId={viewingSavedScript.id}
          isFavorite={viewingSavedScript.isFavorite}
          onToggleFavorite={toggleFavorite}
          existingAudioUrl={viewingSavedScript.audioUrl}
        />
      )}
      {viewingPremadeContent && (
        <ScriptViewer
          script={viewingPremadeContent.script}
          title={viewingPremadeContent.title}
          category={viewingPremadeContent.category}
          backgroundFrequency="nature"
          onClose={() => setViewingPremadeContent(null)}
          onSave={handleSaveScript}
        />
      )}
    </div>
  );
};
