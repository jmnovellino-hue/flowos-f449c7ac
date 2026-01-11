import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowRight, ArrowLeft, Sparkles, CheckCircle, XCircle, Brain, Target, Flame, Users } from "lucide-react";
import logoDark from "@/assets/h2h-logo-dark.png";
import { trackBetaEvent } from "@/lib/betaAnalytics";

// Quiz questions designed to identify target users
const quizQuestions = [
  {
    id: 1,
    question: "What best describes your current professional role?",
    options: [
      { text: "C-Suite Executive or Founder", score: 3 },
      { text: "Senior Manager or Director", score: 3 },
      { text: "Team Lead or Manager", score: 2 },
      { text: "Individual Contributor", score: 1 },
      { text: "Entrepreneur or Solopreneur", score: 3 },
    ],
    category: "leadership"
  },
  {
    id: 2,
    question: "How many people do you directly or indirectly influence in your role?",
    options: [
      { text: "50+ people", score: 3 },
      { text: "10-50 people", score: 3 },
      { text: "5-10 people", score: 2 },
      { text: "1-5 people", score: 1 },
      { text: "I work primarily independently", score: 1 },
    ],
    category: "influence"
  },
  {
    id: 3,
    question: "How often do you feel internal friction between what you want to achieve and how you feel day-to-day?",
    options: [
      { text: "Almost daily - it's a constant battle", score: 3 },
      { text: "Several times a week", score: 3 },
      { text: "Occasionally, during stressful periods", score: 2 },
      { text: "Rarely - I feel mostly aligned", score: 1 },
      { text: "Never - I'm always in flow", score: 0 },
    ],
    category: "pain_point"
  },
  {
    id: 4,
    question: "Which statement resonates most with you right now?",
    options: [
      { text: "I'm successful externally but feel something is missing internally", score: 3 },
      { text: "I want to understand my leadership blind spots", score: 3 },
      { text: "I'm looking for structured personal development", score: 2 },
      { text: "I'm curious about self-improvement tools", score: 1 },
      { text: "I was just browsing and landed here", score: 0 },
    ],
    category: "motivation"
  },
  {
    id: 5,
    question: "How would you describe your interest in philosophy or psychology?",
    options: [
      { text: "Deeply interested - I read and practice regularly", score: 3 },
      { text: "Very interested - I've explored Stoicism, Jung, or similar", score: 3 },
      { text: "Somewhat interested - open to learning more", score: 2 },
      { text: "Mildly curious", score: 1 },
      { text: "Not interested", score: 0 },
    ],
    category: "philosophy"
  },
  {
    id: 6,
    question: "Do you currently have a structured daily practice for mental/emotional optimization?",
    options: [
      { text: "Yes, and I'm looking to deepen it", score: 3 },
      { text: "Yes, but it's inconsistent", score: 2 },
      { text: "I've tried but struggle to maintain habits", score: 3 },
      { text: "No, but I want to start", score: 2 },
      { text: "No, and I'm not interested", score: 0 },
    ],
    category: "practice"
  },
  {
    id: 7,
    question: "How important is it for you to understand the 'why' behind your behaviors?",
    options: [
      { text: "Critically important - I want deep self-awareness", score: 3 },
      { text: "Very important - helps me make better decisions", score: 3 },
      { text: "Somewhat important", score: 2 },
      { text: "Not very important - I prefer action over analysis", score: 1 },
      { text: "Not important at all", score: 0 },
    ],
    category: "self_awareness"
  },
  {
    id: 8,
    question: "When facing a difficult decision, what do you typically struggle with most?",
    options: [
      { text: "Managing my emotions so they don't cloud judgment", score: 3 },
      { text: "Understanding my true motivations vs. external pressures", score: 3 },
      { text: "Finding clarity when there's no obvious right answer", score: 2 },
      { text: "Having the courage to act on what I know is right", score: 2 },
      { text: "I don't struggle with decisions", score: 0 },
    ],
    category: "challenge"
  },
  {
    id: 9,
    question: "How would you rate your current energy management throughout the day?",
    options: [
      { text: "Poor - I often feel depleted and need better systems", score: 3 },
      { text: "Inconsistent - some days are great, others are a struggle", score: 3 },
      { text: "Average - I get by but know I could optimize", score: 2 },
      { text: "Good - I manage my energy fairly well", score: 1 },
      { text: "Excellent - I have mastered my energy", score: 0 },
    ],
    category: "energy"
  },
  {
    id: 10,
    question: "What is your approach to personal development investments?",
    options: [
      { text: "I actively invest in coaching, courses, and tools", score: 3 },
      { text: "I invest selectively in high-quality resources", score: 3 },
      { text: "I occasionally invest when something resonates", score: 2 },
      { text: "I prefer free resources", score: 1 },
      { text: "I don't invest in personal development", score: 0 },
    ],
    category: "investment"
  },
  {
    id: 11,
    question: "How do you typically respond when you receive critical feedback?",
    options: [
      { text: "I welcome it but struggle to process emotionally", score: 3 },
      { text: "I want to embrace it but often feel defensive initially", score: 3 },
      { text: "I can take it if delivered well", score: 2 },
      { text: "I prefer positive reinforcement", score: 1 },
      { text: "I avoid situations where I might receive criticism", score: 0 },
    ],
    category: "growth_mindset"
  },
  {
    id: 12,
    question: "How often do you reflect on your core values and whether you're living aligned with them?",
    options: [
      { text: "Regularly - but I want a better framework for this", score: 3 },
      { text: "Occasionally - usually during major life moments", score: 2 },
      { text: "Rarely - I know I should do this more", score: 3 },
      { text: "I haven't defined my core values clearly", score: 2 },
      { text: "Never - I don't think about values", score: 0 },
    ],
    category: "values"
  },
  {
    id: 13,
    question: "What's your relationship with meditation or mindfulness practices?",
    options: [
      { text: "I practice regularly and want to go deeper", score: 3 },
      { text: "I've tried it and see the value but struggle with consistency", score: 3 },
      { text: "I'm curious but haven't seriously tried", score: 2 },
      { text: "I've tried and it wasn't for me", score: 1 },
      { text: "Not interested", score: 0 },
    ],
    category: "mindfulness"
  },
  {
    id: 14,
    question: "How would you describe your current state of peak performance?",
    options: [
      { text: "I glimpse it but can't access it consistently", score: 3 },
      { text: "I know what it feels like but it's becoming rarer", score: 3 },
      { text: "I'm searching for it but haven't found my formula", score: 2 },
      { text: "I perform well but wouldn't call it 'peak'", score: 1 },
      { text: "I'm not focused on peak performance", score: 0 },
    ],
    category: "performance"
  },
  {
    id: 15,
    question: "If an app could help you build your 'internal operating system' - a structured approach to managing your mindset, energy, and leadership presence - how valuable would that be?",
    options: [
      { text: "Extremely valuable - this is exactly what I need", score: 3 },
      { text: "Very valuable - I'm looking for something like this", score: 3 },
      { text: "Somewhat valuable - I'd try it", score: 2 },
      { text: "Slightly valuable - might be useful", score: 1 },
      { text: "Not valuable to me", score: 0 },
    ],
    category: "product_fit"
  },
];

const BetaLanding = () => {
  const [step, setStep] = useState<'intro' | 'quiz' | 'info' | 'result'>('intro');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [userInfo, setUserInfo] = useState({ fullName: '', email: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ qualified: boolean; percentage: number } | null>(null);

  // Track page view on mount
  useEffect(() => {
    trackBetaEvent('page_view');
  }, []);

  const calculateMatchPercentage = () => {
    const totalPossibleScore = quizQuestions.length * 3;
    const actualScore = Object.values(answers).reduce((sum, score) => sum + score, 0);
    return Math.round((actualScore / totalPossibleScore) * 100);
  };

  const handleStartQuiz = () => {
    trackBetaEvent('quiz_started');
    setStep('quiz');
  };

  const handleAnswer = (questionId: number, score: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: score }));
    trackBetaEvent('quiz_question_answered', { questionNumber: currentQuestion + 1 });
    
    if (currentQuestion < quizQuestions.length - 1) {
      setTimeout(() => setCurrentQuestion(prev => prev + 1), 300);
    } else {
      trackBetaEvent('quiz_completed');
      setStep('info');
    }
  };

  const handleSubmit = async () => {
    if (!userInfo.fullName.trim() || !userInfo.email.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    const matchPercentage = calculateMatchPercentage();
    const qualified = matchPercentage >= 80;

    const quizResponses = quizQuestions.map(q => ({
      questionId: q.id,
      question: q.question,
      category: q.category,
      score: answers[q.id] || 0,
      selectedOption: q.options.find(o => o.score === answers[q.id])?.text || '',
    }));

    try {
      const { error } = await supabase.from('beta_applications').insert({
        email: userInfo.email.trim().toLowerCase(),
        full_name: userInfo.fullName.trim(),
        quiz_responses: quizResponses,
        match_percentage: matchPercentage,
        qualified,
      });

      if (error) {
        if (error.code === '23505') {
          toast.error("You've already applied with this email");
        } else {
          throw error;
        }
        setIsSubmitting(false);
        return;
      }

      // Track analytics and store email for tracking (using sessionStorage for security)
      sessionStorage.setItem('beta_email', userInfo.email.trim().toLowerCase());
      trackBetaEvent('info_submitted', { email: userInfo.email, matchPercentage });
      trackBetaEvent(qualified ? 'qualified' : 'not_qualified', { email: userInfo.email, matchPercentage });

      // Send welcome or waitlist email
      try {
        await supabase.functions.invoke('beta-emails', {
          body: {
            type: qualified ? 'welcome' : 'not_qualified',
            email: userInfo.email.trim().toLowerCase(),
            name: userInfo.fullName.trim(),
            matchPercentage,
          },
        });
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        // Don't block the flow if email fails
      }

      setResult({ qualified, percentage: matchPercentage });
      setStep('result');
    } catch (error) {
      console.error('Submission error:', error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = (currentQuestion / quizQuestions.length) * 100;

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Neural background */}
      <div className="absolute inset-0 neural-grid opacity-50" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mb-12"
        >
          <img src={logoDark} alt="H2H Inner Lab" className="h-16 object-contain" />
        </motion.div>

        <AnimatePresence mode="wait">
          {/* INTRO SCREEN */}
          {step === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-3xl mx-auto text-center"
            >
              <div className="glass-surface rounded-2xl p-8 md:p-12">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-8"
                >
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-primary">Beta Access • Limited Spots</span>
                </motion.div>

                <h1 className="text-4xl md:text-5xl font-bold mb-6">
                  Is <span className="text-gradient-primary">FlowOS</span> Built For You?
                </h1>
                
                <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                  FlowOS is an exclusive operating system for high-performing leaders who want to master their internal architecture. 
                  Take our 2-minute assessment to discover if you're a fit for our beta program.
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                  {[
                    { icon: Brain, label: "Deep Self-Awareness" },
                    { icon: Target, label: "Peak Performance" },
                    { icon: Flame, label: "Emotional Mastery" },
                    { icon: Users, label: "Leadership Presence" },
                  ].map((item, i) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                      className="p-4 rounded-xl bg-muted/50 border border-border"
                    >
                      <item.icon className="w-8 h-8 text-primary mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                    </motion.div>
                  ))}
                </div>

                <Button 
                  onClick={handleStartQuiz}
                  size="lg"
                  className="h2h-gradient text-primary-foreground px-8 py-6 text-lg glow-turquoise"
                >
                  Start Assessment
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>

                <p className="text-xs text-muted-foreground mt-6">
                  ⏱️ Takes only 2 minutes • 🔒 Your answers are confidential
                </p>
              </div>
            </motion.div>
          )}

          {/* QUIZ SCREEN */}
          {step === 'quiz' && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto"
            >
              <div className="glass-surface rounded-2xl p-6 md:p-8">
                {/* Progress */}
                <div className="mb-8">
                  <div className="flex justify-between text-sm text-muted-foreground mb-2">
                    <span>Question {currentQuestion + 1} of {quizQuestions.length}</span>
                    <span>{Math.round(progress)}% complete</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                {/* Question */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentQuestion}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h2 className="text-xl md:text-2xl font-semibold mb-6">
                      {quizQuestions[currentQuestion].question}
                    </h2>

                    <div className="space-y-3">
                      {quizQuestions[currentQuestion].options.map((option, index) => (
                        <motion.button
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => handleAnswer(quizQuestions[currentQuestion].id, option.score)}
                          className={`w-full p-4 text-left rounded-xl border transition-all duration-200 
                            ${answers[quizQuestions[currentQuestion].id] === option.score 
                              ? 'border-primary bg-primary/10 text-foreground' 
                              : 'border-border bg-muted/30 hover:border-primary/50 hover:bg-muted/50 text-foreground'
                            }`}
                        >
                          <span className="text-sm md:text-base">{option.text}</span>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Navigation */}
                <div className="flex justify-between mt-8">
                  <Button
                    variant="ghost"
                    onClick={() => currentQuestion > 0 && setCurrentQuestion(prev => prev - 1)}
                    disabled={currentQuestion === 0}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>

                  {answers[quizQuestions[currentQuestion].id] !== undefined && currentQuestion === quizQuestions.length - 1 && (
                    <Button onClick={() => setStep('info')} className="h2h-gradient">
                      Continue
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* INFO COLLECTION SCREEN */}
          {step === 'info' && (
            <motion.div
              key="info"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-md mx-auto"
            >
              <div className="glass-surface rounded-2xl p-8">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Assessment Complete!</h2>
                  <p className="text-muted-foreground">
                    Enter your details to see if you qualify for beta access.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Full Name</label>
                    <Input
                      placeholder="Your full name"
                      value={userInfo.fullName}
                      onChange={(e) => setUserInfo(prev => ({ ...prev, fullName: e.target.value }))}
                      className="bg-muted/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email Address</label>
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={userInfo.email}
                      onChange={(e) => setUserInfo(prev => ({ ...prev, email: e.target.value }))}
                      className="bg-muted/50"
                    />
                  </div>

                  <Button 
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full h2h-gradient text-primary-foreground py-6"
                  >
                    {isSubmitting ? "Processing..." : "See My Results"}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    By submitting, you agree to receive updates about FlowOS.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* RESULT SCREEN */}
          {step === 'result' && result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-2xl mx-auto"
            >
              <div className="glass-surface rounded-2xl p-8 md:p-12 text-center">
                {result.qualified ? (
                  <>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", delay: 0.2 }}
                      className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6 glow-turquoise"
                    >
                      <CheckCircle className="w-12 h-12 text-primary" />
                    </motion.div>

                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                      You're a <span className="text-gradient-primary">Perfect Match!</span>
                    </h2>

                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-6">
                      <span className="text-2xl font-bold text-primary">{result.percentage}%</span>
                      <span className="text-sm text-muted-foreground">Profile Match</span>
                    </div>

                    <p className="text-lg text-muted-foreground mb-8 max-w-lg mx-auto">
                      Congratulations! Your profile aligns exceptionally well with the leaders FlowOS was designed for. 
                      You've been granted exclusive beta access.
                    </p>

                    <Button 
                      onClick={() => window.location.href = '/beta/launch'}
                      size="lg"
                      className="h2h-gradient text-primary-foreground px-8 py-6 text-lg glow-turquoise"
                    >
                      Access FlowOS Beta
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </>
                ) : (
                  <>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", delay: 0.2 }}
                      className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mx-auto mb-6"
                    >
                      <XCircle className="w-12 h-12 text-muted-foreground" />
                    </motion.div>

                    <h2 className="text-3xl font-bold mb-4">
                      Thanks for Your Interest
                    </h2>

                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted border border-border mb-6">
                      <span className="text-2xl font-bold">{result.percentage}%</span>
                      <span className="text-sm text-muted-foreground">Profile Match</span>
                    </div>

                    <p className="text-lg text-muted-foreground mb-8 max-w-lg mx-auto">
                      Based on your responses, FlowOS may not be the best fit for your current needs. 
                      We've added you to our waitlist and will notify you when we expand our program.
                    </p>

                    <p className="text-sm text-muted-foreground">
                      In the meantime, follow{" "}
                      <a href="https://www.theh2hexperiment.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        The H2H Experiment
                      </a>{" "}
                      for leadership insights.
                    </p>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default BetaLanding;
