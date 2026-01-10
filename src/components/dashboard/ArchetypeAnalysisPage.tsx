import { motion } from 'framer-motion';
import { ArrowLeft, Crown, Shield, Heart, Lightbulb, Target, Users, TrendingUp, AlertTriangle, Sparkles, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface ArchetypeAnalysisPageProps {
  userProfile: {
    name: string;
    archetype: string;
    values: string[];
  };
  onBack: () => void;
}

// Archetype data with full analysis
const archetypeData: Record<string, {
  title: string;
  subtitle: string;
  description: string;
  strengths: { name: string; description: string; level: number }[];
  challenges: { name: string; description: string }[];
  leadershipStyle: string;
  communicationStyle: string;
  decisionMaking: string;
  teamDynamics: string;
  growthPath: string[];
  shadowTriggers: string[];
  compatibleTypes: string[];
  conflictTypes: string[];
  dailyPractice: string;
  weeklyReflection: string;
}> = {
  'The Hero': {
    title: 'The Hero',
    subtitle: 'The Achiever Who Conquers',
    description: 'You are driven by a deep need to prove your worth through action and achievement. Heroes lead from the front, inspiring others through their courage, determination, and willingness to take on challenges that others avoid. Your leadership creates momentum and drives results.',
    strengths: [
      { name: 'Courage', description: 'Willingness to face difficult challenges head-on', level: 92 },
      { name: 'Drive', description: 'Relentless pursuit of goals and excellence', level: 88 },
      { name: 'Initiative', description: 'Taking action without waiting for permission', level: 85 },
      { name: 'Resilience', description: 'Bouncing back from setbacks stronger', level: 82 },
      { name: 'Inspiration', description: 'Motivating others through example', level: 78 },
    ],
    challenges: [
      { name: 'Delegation Difficulty', description: 'Tendency to take on too much personally instead of empowering the team' },
      { name: 'Burnout Risk', description: 'Pushing too hard without adequate rest and recovery' },
      { name: 'Competitive Blindness', description: 'Focusing on winning at the expense of collaboration' },
    ],
    leadershipStyle: 'Directive and inspirational. You lead by example and expect others to match your commitment. Your energy is contagious, but you must learn to pace yourself and others.',
    communicationStyle: 'Direct, action-oriented, and sometimes impatient with excessive discussion. You prefer to communicate through doing rather than lengthy explanations.',
    decisionMaking: 'Swift and confident. You trust your instincts and prefer to course-correct along the way rather than over-analyze upfront.',
    teamDynamics: 'You energize teams but may inadvertently intimidate those who work at a different pace. Create space for diverse working styles.',
    growthPath: [
      'Practice asking "Who else could lead this?" before volunteering',
      'Schedule recovery time as non-negotiable meetings',
      'Celebrate team wins as loudly as personal achievements',
      'Develop patience with process and deliberation',
    ],
    shadowTriggers: [
      'Being overlooked or undervalued',
      'Slow-moving processes',
      'Team members who seem uncommitted',
      'Failure or public mistakes',
    ],
    compatibleTypes: ['The Teacher', 'The Servant'],
    conflictTypes: ['The Judge'],
    dailyPractice: 'Before each meeting, ask yourself: "Am I here to lead, or to empower others to lead?"',
    weeklyReflection: 'What did I delegate this week that I would normally have done myself? How did it go?',
  },
  'The Judge': {
    title: 'The Judge',
    subtitle: 'The Guardian of Standards',
    description: 'You lead through discernment, fairness, and unwavering commitment to truth and justice. Judges bring order, accountability, and clear standards that others rely upon. Your leadership creates trust through consistency.',
    strengths: [
      { name: 'Discernment', description: 'Ability to see through complexity to core issues', level: 90 },
      { name: 'Fairness', description: 'Commitment to impartial and just decisions', level: 88 },
      { name: 'Consistency', description: 'Reliable application of principles', level: 92 },
      { name: 'Analysis', description: 'Thorough evaluation of situations', level: 85 },
      { name: 'Accountability', description: 'Holding self and others to standards', level: 87 },
    ],
    challenges: [
      { name: 'Rigidity', description: 'Difficulty adapting when circumstances require flexibility' },
      { name: 'Critical Nature', description: 'Tendency to focus on what\'s wrong rather than what\'s working' },
      { name: 'Emotional Distance', description: 'Prioritizing logic over emotional connection' },
    ],
    leadershipStyle: 'Principled and structured. You lead through clear expectations, consistent standards, and fair evaluation. Your reliability builds trust over time.',
    communicationStyle: 'Precise, logical, and sometimes perceived as cold. You value accuracy over warmth in professional settings.',
    decisionMaking: 'Methodical and evidence-based. You gather information, weigh options carefully, and commit to the most logical path.',
    teamDynamics: 'Teams value your fairness but may feel judged or inadequate. Balance critique with appreciation.',
    growthPath: [
      'Practice acknowledging what\'s working before addressing problems',
      'Ask about feelings, not just facts, in conversations',
      'Allow for exceptions when circumstances warrant',
      'Express appreciation more frequently and specifically',
    ],
    shadowTriggers: [
      'Inconsistency in others',
      'Unfair treatment',
      'Emotional decision-making',
      'Chaos or disorder',
    ],
    compatibleTypes: ['The Servant', 'The Hero'],
    conflictTypes: ['The Teacher'],
    dailyPractice: 'Before giving feedback, share one specific thing the person did well.',
    weeklyReflection: 'When did I choose connection over correctness this week? How did it feel?',
  },
  'The Teacher': {
    title: 'The Teacher',
    subtitle: 'The Illuminator of Potential',
    description: 'You lead through knowledge, wisdom, and the development of others. Teachers see potential where others see limitations and have the patience to nurture growth. Your leadership creates lasting capability.',
    strengths: [
      { name: 'Wisdom', description: 'Deep understanding applied to practical situations', level: 88 },
      { name: 'Patience', description: 'Allowing others the time they need to grow', level: 90 },
      { name: 'Communication', description: 'Explaining complex ideas accessibly', level: 92 },
      { name: 'Mentorship', description: 'Developing others\' capabilities', level: 94 },
      { name: 'Vision', description: 'Seeing the bigger picture and longer term', level: 85 },
    ],
    challenges: [
      { name: 'Over-Explanation', description: 'Teaching when people need autonomy to learn through experience' },
      { name: 'Superiority', description: 'Subtle sense of knowing better than others' },
      { name: 'Pace', description: 'Frustration with those who don\'t learn as quickly' },
    ],
    leadershipStyle: 'Developmental and patient. You invest in people\'s growth and take the long view. Your influence compounds over time as you multiply leaders.',
    communicationStyle: 'Thoughtful, instructive, and sometimes lengthy. You believe understanding "why" is as important as knowing "what."',
    decisionMaking: 'Consultative and educational. You use decisions as teaching moments and involve others in the thinking process.',
    teamDynamics: 'Teams grow under your guidance but may become dependent on your input. Foster independence.',
    growthPath: [
      'Ask questions instead of giving answers',
      'Let people fail when the stakes are low',
      'Recognize that different people learn differently',
      'Practice patience with those who resist learning',
    ],
    shadowTriggers: [
      'Willful ignorance',
      'Resistance to feedback',
      'Quick-fix mentality',
      'Being treated as irrelevant',
    ],
    compatibleTypes: ['The Hero', 'The Servant'],
    conflictTypes: ['The Judge'],
    dailyPractice: 'Replace one answer today with a question that helps the other person discover the answer themselves.',
    weeklyReflection: 'Who did I empower to solve their own problem this week instead of solving it for them?',
  },
  'The Servant': {
    title: 'The Servant',
    subtitle: 'The Enabler of Others',
    description: 'You lead through service, empathy, and selfless dedication to your team\'s success. Servants create environments where others can thrive and often lead from behind. Your leadership creates loyalty and belonging.',
    strengths: [
      { name: 'Empathy', description: 'Deep understanding of others\' experiences', level: 92 },
      { name: 'Humility', description: 'Putting team success above personal recognition', level: 90 },
      { name: 'Support', description: 'Creating conditions for others to excel', level: 94 },
      { name: 'Listening', description: 'Truly hearing what others need', level: 88 },
      { name: 'Loyalty', description: 'Unwavering commitment to people', level: 91 },
    ],
    challenges: [
      { name: 'Self-Neglect', description: 'Giving until depleted without adequate self-care' },
      { name: 'Boundary Issues', description: 'Difficulty saying no or setting limits' },
      { name: 'Visibility', description: 'Being overlooked for positions or recognition' },
    ],
    leadershipStyle: 'Supportive and enabling. You lead by removing obstacles and creating conditions for others to succeed. Your influence is often unseen but deeply felt.',
    communicationStyle: 'Warm, encouraging, and sometimes indirect. You prioritize others\' comfort and may soften difficult messages too much.',
    decisionMaking: 'Consensus-seeking and inclusive. You want everyone\'s voice heard but may struggle with decisions that disappoint anyone.',
    teamDynamics: 'Teams feel deeply supported but may take your efforts for granted. Make your contributions visible.',
    growthPath: [
      'Practice saying no to one request per day',
      'Schedule self-care as firmly as you schedule helping others',
      'Share your own needs and struggles with trusted colleagues',
      'Claim credit for your contributions',
    ],
    shadowTriggers: [
      'Being taken for granted',
      'Witnessing selfishness',
      'Having your sacrifices go unnoticed',
      'Confrontation and conflict',
    ],
    compatibleTypes: ['The Judge', 'The Teacher'],
    conflictTypes: ['The Hero'],
    dailyPractice: 'Before saying yes to a request, ask yourself: "Do I have the capacity for this, or am I overextending?"',
    weeklyReflection: 'What did I do for myself this week that had nothing to do with serving others?',
  },
};

export const ArchetypeAnalysisPage = ({ userProfile, onBack }: ArchetypeAnalysisPageProps) => {
  const archetype = archetypeData[userProfile.archetype] || archetypeData['The Hero'];

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
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
          <Crown className="w-4 h-4" />
          Leadership Archetype Analysis
        </div>
        <h1 className="text-4xl md:text-5xl font-display font-semibold text-foreground mb-2">
          {archetype.title}
        </h1>
        <p className="text-xl text-muted-foreground">{archetype.subtitle}</p>
      </motion.div>

      {/* Core Description */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-surface rounded-2xl p-8 mb-6 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/10 to-accent/5 rounded-full blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="font-medium text-foreground">Your Leadership Essence</span>
          </div>
          <p className="text-lg text-muted-foreground leading-relaxed">
            {archetype.description}
          </p>
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Strengths */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-surface rounded-2xl p-6"
        >
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-primary" />
            <span className="font-medium text-foreground">Core Strengths</span>
          </div>
          <div className="space-y-5">
            {archetype.strengths.map((strength) => (
              <div key={strength.name}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-foreground">{strength.name}</span>
                  <span className="text-sm font-medium text-primary">{strength.level}%</span>
                </div>
                <Progress value={strength.level} className="h-2 mb-1" />
                <p className="text-sm text-muted-foreground">{strength.description}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Challenges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-surface rounded-2xl p-6"
        >
          <div className="flex items-center gap-2 mb-6">
            <AlertTriangle className="w-5 h-5 text-secondary" />
            <span className="font-medium text-foreground">Growth Challenges</span>
          </div>
          <div className="space-y-4">
            {archetype.challenges.map((challenge) => (
              <div key={challenge.name} className="p-4 rounded-xl bg-secondary/10 border border-secondary/20">
                <h4 className="font-medium text-foreground mb-1">{challenge.name}</h4>
                <p className="text-sm text-muted-foreground">{challenge.description}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Leadership Style */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass-surface rounded-2xl p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-primary" />
            <span className="font-medium text-foreground">Leadership Style</span>
          </div>
          <p className="text-muted-foreground mb-6">{archetype.leadershipStyle}</p>

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-foreground mb-1">Communication</h4>
              <p className="text-sm text-muted-foreground">{archetype.communicationStyle}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-foreground mb-1">Decision Making</h4>
              <p className="text-sm text-muted-foreground">{archetype.decisionMaking}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-foreground mb-1">Team Dynamics</h4>
              <p className="text-sm text-muted-foreground">{archetype.teamDynamics}</p>
            </div>
          </div>
        </motion.div>

        {/* Type Compatibility */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-surface rounded-2xl p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-primary" />
            <span className="font-medium text-foreground">Type Compatibility</span>
          </div>
          
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-primary mb-2">Most Compatible With</h4>
              <div className="flex flex-wrap gap-2">
                {archetype.compatibleTypes.map((type) => (
                  <span key={type} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
                    {type}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-secondary mb-2">Potential Friction With</h4>
              <div className="flex flex-wrap gap-2">
                {archetype.conflictTypes.map((type) => (
                  <span key={type} className="px-3 py-1 rounded-full bg-secondary/10 text-secondary text-sm">
                    {type}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Growth Path */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="glass-surface rounded-2xl p-6 mt-6"
      >
        <div className="flex items-center gap-2 mb-6">
          <Target className="w-5 h-5 text-primary" />
          <span className="font-medium text-foreground">Your Growth Path</span>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {archetype.growthPath.map((step, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-medium text-primary">{index + 1}</span>
              </div>
              <p className="text-muted-foreground">{step}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Shadow Triggers */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-surface rounded-2xl p-6 mt-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-destructive" />
          <span className="font-medium text-foreground">Shadow Triggers</span>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          These situations are most likely to activate your shadow side:
        </p>
        <div className="flex flex-wrap gap-2">
          {archetype.shadowTriggers.map((trigger) => (
            <span key={trigger} className="px-3 py-2 rounded-lg bg-destructive/10 text-destructive text-sm">
              {trigger}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Daily Practices */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="grid gap-6 md:grid-cols-2 mt-6"
      >
        <div className="glass-surface rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-gradient-to-br from-primary/20 to-accent/10 rounded-full blur-2xl" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-5 h-5 text-secondary" />
              <span className="font-medium text-foreground">Daily Practice</span>
            </div>
            <p className="text-muted-foreground">{archetype.dailyPractice}</p>
          </div>
        </div>

        <div className="glass-surface rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-gradient-to-br from-secondary/20 to-primary/10 rounded-full blur-2xl" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-primary" />
              <span className="font-medium text-foreground">Weekly Reflection</span>
            </div>
            <p className="text-muted-foreground">{archetype.weeklyReflection}</p>
          </div>
        </div>
      </motion.div>

      {/* Core Values Integration */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-surface rounded-2xl p-6 mt-6"
      >
        <div className="flex items-center gap-2 mb-6">
          <Heart className="w-5 h-5 text-secondary" />
          <span className="font-medium text-foreground">Your Values Integration</span>
        </div>
        <p className="text-muted-foreground mb-4">
          Your core values shape how your archetype expresses itself:
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          {userProfile.values.map((value, index) => (
            <div key={value} className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-accent/5 border border-primary/20">
              <div className="text-2xl font-display font-bold text-gradient-primary mb-1">#{index + 1}</div>
              <h4 className="font-medium text-foreground">{value}</h4>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};
