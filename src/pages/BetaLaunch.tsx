import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { 
  Rocket, 
  Brain, 
  Sparkles, 
  Layers, 
  Target, 
  Mic, 
  BookOpen,
  Flame,
  Clock,
  Shield,
  ArrowRight,
  Download,
  Play,
  Star
} from "lucide-react";
import logoDark from "@/assets/h2h-logo-dark.png";
import ProductSpecsDocument from "@/components/beta/ProductSpecsDocument";
import { trackBetaEvent } from "@/lib/betaAnalytics";

const features = [
  {
    icon: Brain,
    title: "Leadership Archetype Assessment",
    description: "Discover your unique blend of Hero, Judge, Teacher, and Servant archetypes through 30 calibrated questions.",
    tag: "Self-Discovery"
  },
  {
    icon: Layers,
    title: "The Architect AI",
    description: "Converse with an AI trained on 19 of history's greatest minds—from Marcus Aurelius to Carl Jung.",
    tag: "AI Coaching"
  },
  {
    icon: Mic,
    title: "The Studio",
    description: "Build personalized guided meditations and peak performance audio experiences with professional voice synthesis.",
    tag: "Audio Tools"
  },
  {
    icon: Target,
    title: "Iceberg Commitment Tool",
    description: "Transform surface behaviors by addressing the feelings and beliefs beneath them.",
    tag: "Behavior Change"
  },
  {
    icon: Flame,
    title: "Micro-Experiments",
    description: "Science-backed daily experiments to rewire habits and optimize your mental performance.",
    tag: "Optimization"
  },
  {
    icon: BookOpen,
    title: "The Codex",
    description: "Curated library of leadership wisdom organized by archetype and growth path.",
    tag: "Knowledge"
  },
];

const testimonialPlaceholders = [
  {
    quote: "FlowOS gave me the framework I was missing to understand why I lead the way I do.",
    author: "Beta Tester",
    role: "Startup Founder"
  },
  {
    quote: "The Architect conversations feel like having a Stoic philosopher on-demand.",
    author: "Beta Tester", 
    role: "Executive Coach"
  },
  {
    quote: "Finally, a tool that addresses the internal game of leadership.",
    author: "Beta Tester",
    role: "VP of Operations"
  },
];

const BetaLaunch = () => {
  const [showSpecs, setShowSpecs] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    // Track page view and that user accessed the launch page
    trackBetaEvent('launch_page_viewed');
    
    const trackAccess = async () => {
      const storedEmail = sessionStorage.getItem('beta_email');
      if (storedEmail) {
        setUserEmail(storedEmail);
        await supabase
          .from('beta_applications')
          .update({ accessed_app: true, accessed_at: new Date().toISOString() })
          .eq('email', storedEmail);
      }
    };
    trackAccess();
  }, []);

  const handleViewSpecs = () => {
    trackBetaEvent('specs_viewed');
    setShowSpecs(true);
  };

  const handleAccessApp = async () => {
    trackBetaEvent('app_accessed', { email: userEmail || undefined });
    
    if (userEmail) {
      await supabase
        .from('beta_applications')
        .update({ accessed_app: true, accessed_at: new Date().toISOString() })
        .eq('email', userEmail);
    }
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 neural-grid opacity-30" />
      <div className="absolute top-20 left-10 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-3xl" />

      {/* Specs Document Modal */}
      {showSpecs && <ProductSpecsDocument onClose={() => setShowSpecs(false)} />}

      <div className="relative z-10">
        {/* Header */}
        <header className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <img src={logoDark} alt="H2H Inner Lab" className="h-12 object-contain" />
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={handleViewSpecs}>
                <Download className="w-4 h-4 mr-2" />
                Product Specs
              </Button>
              <Button onClick={handleAccessApp} className="h2h-gradient">
                Enter FlowOS
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-8"
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Beta Access Granted</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
            >
              Your Internal
              <br />
              <span className="text-gradient-primary">Operating System</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto"
            >
              FlowOS is the leadership development platform that integrates ancient wisdom, 
              modern psychology, and cutting-edge bio-optimization into a single coherent system.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button 
                onClick={handleAccessApp}
                size="lg"
                className="h2h-gradient text-primary-foreground px-8 py-6 text-lg glow-turquoise"
              >
                <Rocket className="w-5 h-5 mr-2" />
                Launch FlowOS
              </Button>
              <Button 
                variant="outline"
                size="lg"
                onClick={() => setShowSpecs(true)}
                className="px-8 py-6 text-lg border-primary/30 hover:bg-primary/10"
              >
                <Play className="w-5 h-5 mr-2" />
                View Full Specs
              </Button>
            </motion.div>

            {/* Trust indicators */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap items-center justify-center gap-6 mt-12 text-sm text-muted-foreground"
            >
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                <span>Enterprise-Grade Security</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <span>5-Minute Daily Practice</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-primary" />
                <span>AI-Powered Insights</span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="container mx-auto px-4 py-16">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to <span className="text-gradient-primary">Master Your Mind</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Six integrated modules designed to work together as a complete leadership development ecosystem.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-surface rounded-2xl p-6 hover:border-primary/30 transition-all duration-300 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                    {feature.tag}
                  </span>
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Social Proof */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold mb-4">Early Beta Feedback</h2>
              <p className="text-muted-foreground">What leaders are saying about FlowOS</p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {testimonialPlaceholders.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-surface rounded-2xl p-6"
                >
                  <div className="flex gap-1 mb-4">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} className="w-4 h-4 fill-secondary text-secondary" />
                    ))}
                  </div>
                  <p className="text-sm mb-4 italic">"{testimonial.quote}"</p>
                  <div>
                    <p className="font-medium text-sm">{testimonial.author}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-16 md:py-24">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center glass-surface rounded-3xl p-8 md:p-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Build Your Internal Architecture?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join the beta program and be among the first leaders to experience FlowOS.
            </p>
            <Button 
              onClick={handleAccessApp}
              size="lg"
              className="h2h-gradient text-primary-foreground px-10 py-6 text-lg glow-turquoise"
            >
              <Rocket className="w-5 h-5 mr-2" />
              Enter FlowOS Now
            </Button>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="container mx-auto px-4 py-8 border-t border-border">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © 2025 The H2H Experiment. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="https://www.theh2hexperiment.com" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                The H2H Experiment
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default BetaLaunch;
