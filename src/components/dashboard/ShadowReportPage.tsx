import { motion } from 'framer-motion';
import { ArrowLeft, Brain, Eye, AlertTriangle, Shield, Target, Lightbulb, Heart, Moon, Sun, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface ShadowReportPageProps {
  userProfile: {
    name: string;
    archetype: string;
    values: string[];
  };
  onBack: () => void;
}

// Shadow data based on archetype
const shadowData: Record<string, {
  title: string;
  introduction: string;
  primaryShadows: { name: string; level: number; description: string; manifestations: string[]; integration: string }[];
  triggers: { situation: string; reaction: string; awareness: string }[];
  unconsciousPatterns: { pattern: string; origin: string; cost: string }[];
  integrationExercises: { title: string; description: string; frequency: string }[];
  projections: string[];
  goldShadow: { name: string; description: string; reclaim: string };
  weeklyPractice: string;
}> = {
  'The Hero': {
    title: 'The Hero\'s Shadow',
    introduction: 'Your Hero archetype casts a shadow that emerges when your strengths become rigid or unconscious. The same drive that makes you effective can, when unchecked, lead to patterns that undermine your leadership and relationships.',
    primaryShadows: [
      {
        name: 'Martyr Syndrome',
        level: 72,
        description: 'The belief that you must sacrifice yourself for success. You take on burdens that aren\'t yours, then feel resentful when others don\'t match your effort.',
        manifestations: [
          'Working longer hours than necessary and feeling bitter about it',
          'Taking on work that should be delegated',
          'Secretly hoping others notice your sacrifices',
          'Feeling indispensable and anxious about taking breaks',
        ],
        integration: 'Recognize that your worth isn\'t measured by how much you suffer. Practice receiving help without shame.',
      },
      {
        name: 'Control Compulsion',
        level: 58,
        description: 'The need to manage every outcome personally. Difficulty trusting others stems from a deep fear that things will fall apart without your oversight.',
        manifestations: [
          'Micromanaging team members',
          'Difficulty fully delegating tasks',
          'Checking on completed work repeatedly',
          'Taking back delegated tasks when stress increases',
        ],
        integration: 'Build tolerance for imperfection. Allow others to succeed AND fail without your intervention.',
      },
      {
        name: 'Validation Hunger',
        level: 45,
        description: 'An insatiable need for recognition. Beneath your confident exterior lies a fear that your accomplishments aren\'t enough unless witnessed by others.',
        manifestations: [
          'Subtly steering conversations to your achievements',
          'Feeling deflated when efforts go unrecognized',
          'Comparing yourself to peers constantly',
          'Overreacting to criticism',
        ],
        integration: 'Develop internal measures of success. Practice celebrating privately before seeking external validation.',
      },
    ],
    triggers: [
      {
        situation: 'Being overlooked or passed over',
        reaction: 'Anger masked as withdrawal, working harder to "prove" worth',
        awareness: 'Ask: What am I afraid this means about me?',
      },
      {
        situation: 'Failure or public mistake',
        reaction: 'Shame spiral, over-correction, blaming others or circumstances',
        awareness: 'Ask: Can I separate what happened from who I am?',
      },
      {
        situation: 'Team members not performing',
        reaction: 'Taking over, frustrated micromanagement, subtle contempt',
        awareness: 'Ask: Am I helping them grow or just getting my way?',
      },
    ],
    unconsciousPatterns: [
      {
        pattern: 'Chronic over-commitment',
        origin: 'Early messages that love and approval came through achievement',
        cost: 'Exhaustion, relationship neglect, hollow success',
      },
      {
        pattern: 'Competitive comparison',
        origin: 'Learned that worth is relative, not intrinsic',
        cost: 'Never feeling "enough," inability to celebrate others genuinely',
      },
      {
        pattern: 'Emotional suppression',
        origin: 'Belief that "heroes don\'t feel," vulnerability equals weakness',
        cost: 'Disconnection from self and others, physical tension',
      },
    ],
    integrationExercises: [
      {
        title: 'The Pause Practice',
        description: 'When you feel the urge to take action, pause for 2 minutes. Notice the physical sensations. Ask: "Is this mine to do?"',
        frequency: 'Daily',
      },
      {
        title: 'Vulnerability Audit',
        description: 'Share one genuine struggle with a trusted colleague each week. Notice your resistance and do it anyway.',
        frequency: 'Weekly',
      },
      {
        title: 'Celebration Journal',
        description: 'Write down three things you\'re proud of that no one else saw. Practice being your own witness.',
        frequency: 'Daily',
      },
      {
        title: 'Delegation Deep Dive',
        description: 'Hand over one project completely. No check-ins for a week. Journal about the anxiety that surfaces.',
        frequency: 'Monthly',
      },
    ],
    projections: [
      'Seeing others as lazy or uncommitted (projection of your own exhaustion)',
      'Viewing vulnerability in others as weakness (projection of your disowned softness)',
      'Perceiving slow workers as incompetent (projection of your fear of inadequacy)',
    ],
    goldShadow: {
      name: 'The Gentle Warrior',
      description: 'Within your shadow lies your "golden shadow"—a positive quality you\'ve disowned. For The Hero, this is often gentleness, receptivity, and the ability to simply be rather than constantly do.',
      reclaim: 'Practice letting yourself be helped. Allow yourself to rest without earning it. Notice moments when "doing nothing" creates more than action could.',
    },
    weeklyPractice: 'Each Sunday, ask yourself: "Where did my drive serve the mission this week? Where did it serve my ego?"',
  },
  'The Judge': {
    title: 'The Judge\'s Shadow',
    introduction: 'Your Judge archetype\'s shadow emerges when your commitment to truth and standards becomes a weapon rather than a gift. The very discernment that makes you wise can become cold criticism when unconscious.',
    primaryShadows: [
      {
        name: 'Critical Coldness',
        level: 68,
        description: 'An inability to see the good when problems exist. Your high standards become impossible standards that leave everyone—including yourself—feeling inadequate.',
        manifestations: [
          'Leading feedback with criticism, ending with faint praise',
          'Noticing errors before acknowledging effort',
          'Internal running commentary on everyone\'s flaws',
          'Difficulty giving unconditional positive regard',
        ],
        integration: 'Practice appreciation first, always. Train yourself to find three good things before addressing one concern.',
      },
      {
        name: 'Righteous Rigidity',
        level: 62,
        description: 'Confusing your perspective with objective truth. When you can\'t see any valid alternative, your wisdom becomes arrogance.',
        manifestations: [
          'Difficulty updating opinions with new evidence',
          'Dismissing perspectives that challenge yours',
          'Feeling personally attacked when questioned',
          'Confusing being right with being effective',
        ],
        integration: 'Cultivate genuine curiosity about opposing views. Ask "What might I be missing?" before defending your position.',
      },
      {
        name: 'Emotional Detachment',
        level: 55,
        description: 'Using logic as a shield against feeling. Your emphasis on rationality can disconnect you from the emotional truth of situations.',
        manifestations: [
          'Dismissing feelings as "irrational"',
          'Being uncomfortable with emotional expression',
          'Analyzing situations when empathy is needed',
          'Appearing cold in moments that call for warmth',
        ],
        integration: 'Practice asking "How does this feel?" before "What do I think?" Let emotions inform, not just interrupt.',
      },
    ],
    triggers: [
      {
        situation: 'Others making decisions without proper analysis',
        reaction: 'Contempt, unsolicited correction, withdrawal',
        awareness: 'Ask: Is their process wrong, or just different from mine?',
      },
      {
        situation: 'Being accused of unfairness',
        reaction: 'Defensive justification, emotional shutdown, counter-attack',
        awareness: 'Ask: What legitimate need is behind their perception?',
      },
      {
        situation: 'Chaos or lack of structure',
        reaction: 'Anxiety masked as criticism, immediate correction mode',
        awareness: 'Ask: Can I tolerate uncertainty for a moment before fixing?',
      },
    ],
    unconsciousPatterns: [
      {
        pattern: 'Constant evaluation',
        origin: 'Early experiences where love felt conditional on performance',
        cost: 'Inability to relax, damaged relationships',
      },
      {
        pattern: 'Emotional suppression',
        origin: 'Messages that logic was safe, feelings were not',
        cost: 'Disconnection, appearing cold and unapproachable',
      },
      {
        pattern: 'Perfectionism',
        origin: 'Belief that worth comes through being right',
        cost: 'Paralysis, delayed action, harsh self-judgment',
      },
    ],
    integrationExercises: [
      {
        title: 'Appreciation First',
        description: 'Before any critique, share three specific appreciations. Make this mandatory for yourself.',
        frequency: 'Daily',
      },
      {
        title: 'Feeling Check-In',
        description: 'Set three alarms daily. Each time, pause and name the emotion present. Just name it—don\'t analyze.',
        frequency: 'Daily',
      },
      {
        title: 'Devil\'s Advocate',
        description: 'Argue the opposite position from your own for 10 minutes. Find the wisdom in what you resist.',
        frequency: 'Weekly',
      },
      {
        title: 'Chaos Tolerance',
        description: 'Deliberately leave one area of your life "messy" for a week. Notice the anxiety and let it be.',
        frequency: 'Monthly',
      },
    ],
    projections: [
      'Seeing others as careless (projection of your disowned spontaneity)',
      'Viewing emotional people as weak (projection of your buried feelings)',
      'Perceiving flexibility as lack of standards (projection of your rigidity)',
    ],
    goldShadow: {
      name: 'The Compassionate Sage',
      description: 'Your golden shadow is the capacity for unconditional acceptance—wisdom that holds truth AND love simultaneously.',
      reclaim: 'Practice being fair to yourself first. Give yourself the same understanding you\'d give a beloved friend. Let wisdom include mercy.',
    },
    weeklyPractice: 'Each Sunday, ask: "Where did my discernment serve others this week? Where did it wound?"',
  },
  'The Teacher': {
    title: 'The Teacher\'s Shadow',
    introduction: 'Your Teacher archetype\'s shadow emerges when your desire to enlighten becomes a need to be needed. The same patience and wisdom that develops others can become condescension when unconscious.',
    primaryShadows: [
      {
        name: 'Superiority Complex',
        level: 65,
        description: 'A subtle sense of knowing better that creates distance. Your knowledge becomes a pedestal rather than a bridge.',
        manifestations: [
          'Explaining when people just want to be heard',
          'Difficulty learning from those with less experience',
          'Subtle condescension masked as helpfulness',
          'Frustration with those who "don\'t get it"',
        ],
        integration: 'Practice genuine curiosity about what others know that you don\'t. Become a student again.',
      },
      {
        name: 'Enabling Dependency',
        level: 58,
        description: 'Creating followers rather than leaders. The need to be needed leads you to help too much, stunting others\' growth.',
        manifestations: [
          'Giving answers instead of asking questions',
          'Enjoying being the "go-to" person too much',
          'Subtle disappointment when students succeed independently',
          'Over-involvement in others\' learning processes',
        ],
        integration: 'Celebrate when people outgrow you. Make your success measured by their independence.',
      },
      {
        name: 'Patience Theater',
        level: 48,
        description: 'Performing patience while feeling frustration underneath. Your calm exterior masks impatience with slower learners.',
        manifestations: [
          'Sighing while "patiently" explaining again',
          'Subtle condescension in "simple" explanations',
          'Inner frustration leaking through body language',
          'Giving up on people you deem "unteachable"',
        ],
        integration: 'Acknowledge your frustration honestly rather than performing patience. Real patience includes yourself.',
      },
    ],
    triggers: [
      {
        situation: 'People ignoring your advice',
        reaction: 'Withdrawal, subtle punishment through reduced help',
        awareness: 'Ask: Is this about their growth or my ego?',
      },
      {
        situation: 'Being treated as irrelevant or outdated',
        reaction: 'Over-proving your worth, excessive sharing of expertise',
        awareness: 'Ask: Can my value exist without being constantly demonstrated?',
      },
      {
        situation: 'Students succeeding without you',
        reaction: 'Subtle resentment, minimizing their achievement',
        awareness: 'Ask: Isn\'t this exactly what I should want?',
      },
    ],
    unconsciousPatterns: [
      {
        pattern: 'Knowledge hoarding',
        origin: 'Early experiences where knowing things meant being valued',
        cost: 'Others feeling inferior, isolation',
      },
      {
        pattern: 'Over-helping',
        origin: 'Need to be needed for self-worth',
        cost: 'Dependent relationships, exhaustion',
      },
      {
        pattern: 'Eternal expert',
        origin: 'Discomfort with not-knowing',
        cost: 'Closed to learning, disconnection from humility',
      },
    ],
    integrationExercises: [
      {
        title: 'Question Only Day',
        description: 'Spend one day only asking questions, never giving answers or advice.',
        frequency: 'Weekly',
      },
      {
        title: 'Beginner Mind',
        description: 'Learn something completely new where you\'re truly incompetent. Notice the feelings.',
        frequency: 'Monthly',
      },
      {
        title: 'Graduation Celebration',
        description: 'When someone outgrows your teaching, throw an internal celebration. Journal about it.',
        frequency: 'As needed',
      },
      {
        title: 'Teach Me',
        description: 'Ask someone with less experience to teach you something they know.',
        frequency: 'Weekly',
      },
    ],
    projections: [
      'Seeing others as closed-minded (projection of your own fixed views)',
      'Viewing practicality as shallow (projection of your disowned groundedness)',
      'Perceiving students as dependent (projection of your need to be needed)',
    ],
    goldShadow: {
      name: 'The Eternal Student',
      description: 'Your golden shadow is the capacity for genuine not-knowing—wisdom that remains curious, humble, and open.',
      reclaim: 'Practice saying "I don\'t know" with genuine peace. Find joy in being taught. Let yourself be surprised.',
    },
    weeklyPractice: 'Each Sunday, ask: "Where did I teach from generosity this week? Where did I teach from ego?"',
  },
  'The Servant': {
    title: 'The Servant\'s Shadow',
    introduction: 'Your Servant archetype\'s shadow emerges when giving becomes giving away—when selflessness becomes self-abandonment. The same care that nurtures others can lead to resentment when your own needs are chronically ignored.',
    primaryShadows: [
      {
        name: 'Self-Abandonment',
        level: 78,
        description: 'Systematic neglect of your own needs in service to others. You\'ve learned to ignore your own signals until they become crises.',
        manifestations: [
          'Not knowing what you want or need',
          'Feeling guilty when taking care of yourself',
          'Physical symptoms from chronic self-neglect',
          'Relationships where you give far more than you receive',
        ],
        integration: 'Your needs are not optional. Practice asking "What do I need?" before "What do they need?"',
      },
      {
        name: 'Covert Resentment',
        level: 65,
        description: 'Hidden anger about the sacrifices you make. The giving looks generous, but bitter bookkeeping happens underneath.',
        manifestations: [
          'Keeping score of what you\'ve given',
          'Passive-aggressive hints about your sacrifices',
          'Martyrdom stories shared a bit too often',
          'Explosive anger that seems to come from nowhere',
        ],
        integration: 'Give freely or don\'t give. Stop the hidden contracts. If you need something in return, ask for it clearly.',
      },
      {
        name: 'Invisibility Complex',
        level: 52,
        description: 'Hiding behind service to avoid being truly seen. Your help becomes a shield against vulnerability.',
        manifestations: [
          'Deflecting compliments about yourself to others',
          'Discomfort with receiving attention',
          'Using busyness to avoid intimacy',
          'Not sharing your true thoughts and feelings',
        ],
        integration: 'Practice being seen without doing anything. Let people know you, not just what you do for them.',
      },
    ],
    triggers: [
      {
        situation: 'Your help being taken for granted',
        reaction: 'Withdrawal, passive-aggressive service, exhaustion',
        awareness: 'Ask: Did I communicate my limits, or just expect them to be noticed?',
      },
      {
        situation: 'Witnessing selfishness',
        reaction: 'Judgment, moral superiority, secret envy',
        awareness: 'Ask: What am I not allowing myself that they are?',
      },
      {
        situation: 'Being asked for help when depleted',
        reaction: 'Automatic yes followed by resentment',
        awareness: 'Ask: Is "no" really not an option, or does it just feel that way?',
      },
    ],
    unconsciousPatterns: [
      {
        pattern: 'Compulsive giving',
        origin: 'Early messages that your worth came through what you provided',
        cost: 'Exhaustion, empty relationships, lost identity',
      },
      {
        pattern: 'Conflict avoidance',
        origin: 'Fear that asserting needs will lead to abandonment',
        cost: 'Unmet needs, inauthentic relationships',
      },
      {
        pattern: 'Self-erasure',
        origin: 'Learned that being "low maintenance" was the path to love',
        cost: 'Not knowing who you are, depression',
      },
    ],
    integrationExercises: [
      {
        title: 'Daily No',
        description: 'Decline one request per day, even a small one. Notice the anxiety. Do it anyway.',
        frequency: 'Daily',
      },
      {
        title: 'Selfish Saturday',
        description: 'One day per month dedicated entirely to your own pleasure. No service allowed.',
        frequency: 'Monthly',
      },
      {
        title: 'Need Naming',
        description: 'Three times daily, pause and name one thing you need right now. Write it down.',
        frequency: 'Daily',
      },
      {
        title: 'Receiving Practice',
        description: 'When offered help, say yes. Don\'t reciprocate immediately. Let yourself be given to.',
        frequency: 'Daily',
      },
    ],
    projections: [
      'Seeing others as selfish (projection of your disowned healthy self-interest)',
      'Viewing self-care as indulgence (projection of your own unmet needs)',
      'Perceiving assertive people as aggressive (projection of your suppressed voice)',
    ],
    goldShadow: {
      name: 'The Sacred Self',
      description: 'Your golden shadow is healthy self-prioritization—the truth that you cannot pour from an empty cup, and your needs matter as much as anyone\'s.',
      reclaim: 'Practice putting yourself first without guilt. Let yourself be served. Value yourself as you value others.',
    },
    weeklyPractice: 'Each Sunday, ask: "Where did I give from fullness this week? Where did I give from emptiness?"',
  },
};

export const ShadowReportPage = ({ userProfile, onBack }: ShadowReportPageProps) => {
  const shadow = shadowData[userProfile.archetype] || shadowData['The Hero'];

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto pb-24 md:pb-10">
      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-6"
      >
        <Button variant="ghost" onClick={onBack} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Profile
        </Button>
      </motion.div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/10 text-destructive text-sm font-medium mb-4">
          <Moon className="w-4 h-4" />
          Shadow Analysis Report
        </div>
        <h1 className="text-4xl md:text-5xl font-display font-semibold text-foreground mb-2">
          {shadow.title}
        </h1>
        <p className="text-xl text-muted-foreground">Understanding the unconscious patterns of {userProfile.archetype}</p>
      </motion.div>

      {/* Introduction */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-surface rounded-2xl p-8 mb-6 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-destructive/10 to-secondary/5 rounded-full blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="w-5 h-5 text-destructive" />
            <span className="font-medium text-foreground">The Nature of Your Shadow</span>
          </div>
          <p className="text-lg text-muted-foreground leading-relaxed">
            {shadow.introduction}
          </p>
        </div>
      </motion.div>

      {/* Primary Shadow Traits */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="space-y-4 mb-6"
      >
        <div className="flex items-center gap-2 mb-2">
          <Eye className="w-5 h-5 text-destructive" />
          <span className="font-medium text-foreground text-lg">Primary Shadow Traits</span>
        </div>
        
        {shadow.primaryShadows.map((trait, index) => (
          <motion.div
            key={trait.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.05 }}
            className="glass-surface rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-display font-semibold text-foreground">{trait.name}</h3>
              <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                trait.level > 70 ? 'bg-destructive/20 text-destructive' : 
                trait.level > 50 ? 'bg-secondary/20 text-secondary' : 'bg-primary/20 text-primary'
              }`}>
                {trait.level}% Active
              </span>
            </div>
            <Progress 
              value={trait.level} 
              className={`h-2 mb-4 ${
                trait.level > 70 ? '[&>div]:bg-destructive' : 
                trait.level > 50 ? '[&>div]:bg-secondary' : ''
              }`}
            />
            <p className="text-muted-foreground mb-4">{trait.description}</p>
            
            <div className="mb-4">
              <h4 className="text-sm font-medium text-foreground mb-2">How It Shows Up:</h4>
              <ul className="space-y-2">
                {trait.manifestations.map((manifestation, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-destructive mt-1">•</span>
                    {manifestation}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
              <h4 className="text-sm font-medium text-primary mb-1">Integration Path:</h4>
              <p className="text-sm text-muted-foreground">{trait.integration}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Trigger Patterns */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="glass-surface rounded-2xl p-6 mb-6"
      >
        <div className="flex items-center gap-2 mb-6">
          <Zap className="w-5 h-5 text-secondary" />
          <span className="font-medium text-foreground">Trigger Patterns</span>
        </div>
        
        <div className="space-y-4">
          {shadow.triggers.map((trigger, index) => (
            <div key={index} className="p-4 rounded-xl bg-muted/50">
              <div className="grid gap-3 md:grid-cols-3">
                <div>
                  <h4 className="text-xs font-medium text-secondary uppercase tracking-wider mb-1">Situation</h4>
                  <p className="text-sm text-foreground">{trigger.situation}</p>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-destructive uppercase tracking-wider mb-1">Shadow Reaction</h4>
                  <p className="text-sm text-muted-foreground">{trigger.reaction}</p>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-primary uppercase tracking-wider mb-1">Awareness Practice</h4>
                  <p className="text-sm text-primary">{trigger.awareness}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Unconscious Patterns */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-surface rounded-2xl p-6 mb-6"
      >
        <div className="flex items-center gap-2 mb-6">
          <AlertTriangle className="w-5 h-5 text-destructive" />
          <span className="font-medium text-foreground">Unconscious Patterns</span>
        </div>
        
        <div className="grid gap-4 md:grid-cols-3">
          {shadow.unconsciousPatterns.map((pattern, index) => (
            <div key={index} className="p-4 rounded-xl bg-destructive/10 border border-destructive/20">
              <h4 className="font-medium text-foreground mb-2">{pattern.pattern}</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Origin: </span>
                  <span className="text-foreground">{pattern.origin}</span>
                </div>
                <div>
                  <span className="text-destructive">Cost: </span>
                  <span className="text-muted-foreground">{pattern.cost}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Projections */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="glass-surface rounded-2xl p-6 mb-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-secondary" />
          <span className="font-medium text-foreground">Your Projections</span>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          What frustrates you in others often reflects disowned parts of yourself:
        </p>
        <div className="space-y-2">
          {shadow.projections.map((projection, index) => (
            <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/10">
              <span className="text-secondary">→</span>
              <p className="text-sm text-muted-foreground">{projection}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Integration Exercises */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-surface rounded-2xl p-6 mb-6"
      >
        <div className="flex items-center gap-2 mb-6">
          <Target className="w-5 h-5 text-primary" />
          <span className="font-medium text-foreground">Shadow Integration Exercises</span>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
          {shadow.integrationExercises.map((exercise, index) => (
            <div key={index} className="p-4 rounded-xl bg-primary/10 border border-primary/20">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-foreground">{exercise.title}</h4>
                <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary">
                  {exercise.frequency}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{exercise.description}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Golden Shadow */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        className="glass-surface rounded-2xl p-8 mb-6 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-secondary/20 to-primary/10 rounded-full blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-4">
            <Sun className="w-5 h-5 text-secondary" />
            <span className="font-medium text-foreground">Your Golden Shadow: {shadow.goldShadow.name}</span>
          </div>
          <p className="text-muted-foreground mb-4">{shadow.goldShadow.description}</p>
          <div className="p-4 rounded-xl bg-secondary/10 border border-secondary/20">
            <h4 className="text-sm font-medium text-secondary mb-1">How to Reclaim:</h4>
            <p className="text-muted-foreground">{shadow.goldShadow.reclaim}</p>
          </div>
        </div>
      </motion.div>

      {/* Weekly Practice */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass-surface rounded-2xl p-6 relative overflow-hidden"
      >
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-gradient-to-br from-primary/20 to-accent/10 rounded-full blur-2xl" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-primary" />
            <span className="font-medium text-foreground">Weekly Shadow Reflection</span>
          </div>
          <p className="text-lg text-muted-foreground italic">"{shadow.weeklyPractice}"</p>
        </div>
      </motion.div>
    </div>
  );
};
