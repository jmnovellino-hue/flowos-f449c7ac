import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Download, FileText } from "lucide-react";
import { trackBetaEvent } from "@/lib/betaAnalytics";

interface ProductSpecsDocumentProps {
  onClose: () => void;
}

const ProductSpecsDocument = ({ onClose }: ProductSpecsDocumentProps) => {
  const handleDownload = () => {
    trackBetaEvent('specs_downloaded');
    
    // Create the document content
    const content = generateSpecsContent();
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'FlowOS-Product-Specifications.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm"
    >
      <div className="container mx-auto px-4 py-6 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold">FlowOS Product Specifications</h2>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={handleDownload} variant="outline" className="border-primary/30">
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Document Content */}
        <ScrollArea className="flex-1 glass-surface rounded-2xl p-8">
          <div className="max-w-4xl mx-auto prose prose-invert prose-headings:font-serif">
            
            {/* Title Page */}
            <div className="text-center mb-16 pb-16 border-b border-border">
              <p className="text-primary text-sm tracking-widest mb-4">H2H INNER LAB</p>
              <h1 className="text-5xl font-bold mb-6 text-gradient-primary">FlowOS</h1>
              <p className="text-2xl text-muted-foreground mb-8">
                The Operating System for High-Performing Leaders
              </p>
              <p className="text-sm text-muted-foreground">
                Product Specifications Document • Beta Version 1.0 • January 2025
              </p>
            </div>

            {/* Executive Summary */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-primary mb-4">Executive Summary</h2>
              <p className="text-muted-foreground leading-relaxed">
                FlowOS is a premium SaaS platform designed for high-performing leaders who recognize that 
                external success without internal mastery is unsustainable. By integrating leadership 
                psychology, philosophical wisdom, and bio-optimization science, FlowOS provides a 
                comprehensive system for managing the internal architecture that drives exceptional performance.
              </p>
            </section>

            {/* Core Value Proposition */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-primary mb-4">Core Value Proposition</h2>
              <div className="bg-muted/30 rounded-xl p-6 mb-6">
                <p className="text-lg italic text-center">
                  "Master your internal operating system before it defaults to chaos."
                </p>
              </div>
              <ul className="space-y-3 text-muted-foreground">
                <li><strong className="text-foreground">Comprehensive Self-Awareness:</strong> Deep understanding of your leadership archetype, values, and shadow patterns</li>
                <li><strong className="text-foreground">Structured Development:</strong> Daily, weekly, and monthly rhythms that compound into transformation</li>
                <li><strong className="text-foreground">AI-Powered Guidance:</strong> 24/7 access to coaching synthesized from history's greatest minds</li>
                <li><strong className="text-foreground">Practical Application:</strong> Science-backed experiments and tools for real-world implementation</li>
              </ul>
            </section>

            {/* Feature Breakdown */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-primary mb-6">Complete Feature Breakdown</h2>
              
              {/* Assessment */}
              <div className="mb-8 p-6 bg-muted/20 rounded-xl">
                <h3 className="text-xl font-semibold mb-3">1. Leadership Archetype Assessment</h3>
                <p className="text-muted-foreground mb-4">
                  A comprehensive assessment system that reveals your unique leadership DNA through:
                </p>
                <ul className="space-y-2 text-muted-foreground text-sm">
                  <li>• <strong>30 Rapid-Fire Questions:</strong> Determines your archetype blend (Hero, Judge, Teacher, Servant)</li>
                  <li>• <strong>10 Ethical Scenarios:</strong> Identifies core value categories</li>
                  <li>• <strong>Shadow Analysis:</strong> Reveals how strengths become weaknesses under stress</li>
                  <li>• <strong>Percentage Breakdown:</strong> Quantified results with detailed explanations</li>
                </ul>
              </div>

              {/* The Architect */}
              <div className="mb-8 p-6 bg-muted/20 rounded-xl">
                <h3 className="text-xl font-semibold mb-3">2. The Architect — AI Leadership Mentor</h3>
                <p className="text-muted-foreground mb-4">
                  A synthetic persona that synthesizes 19 distinct thinkers across 5 wisdom layers:
                </p>
                <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                  <div>
                    <p className="font-medium text-foreground">The Bedrock (Philosophy)</p>
                    <p>Marcus Aurelius, Epictetus, Lao Tzu</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">The Mirror (Psychology)</p>
                    <p>Carl Jung, Viktor Frankl, Jordan Peterson</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">The Bridge (Connection)</p>
                    <p>Brené Brown, Marshall Rosenberg</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">The Engine (Bio-Neuro)</p>
                    <p>Andrew Huberman, David Sinclair</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">The Weapon (Strategy)</p>
                    <p>Alex Hormozi, Naval Ravikant, Ray Dalio</p>
                  </div>
                </div>
              </div>

              {/* The Studio */}
              <div className="mb-8 p-6 bg-muted/20 rounded-xl">
                <h3 className="text-xl font-semibold mb-3">3. The Studio — Audio Experience Builder</h3>
                <p className="text-muted-foreground mb-4">
                  Create personalized audio experiences with professional-grade synthesis:
                </p>
                <ul className="space-y-2 text-muted-foreground text-sm">
                  <li>• <strong>Guided Meditation Builder:</strong> 7-step customization with binaural beats</li>
                  <li>• <strong>Peak Performance Primer:</strong> Pre-event mental preparation</li>
                  <li>• <strong>Sleep Better Audio:</strong> Relaxation and sleep optimization</li>
                  <li>• <strong>ElevenLabs Integration:</strong> Professional "Laura" voice synthesis</li>
                  <li>• <strong>Binaural Frequencies:</strong> 432Hz, 777Hz, 1111Hz options</li>
                </ul>
              </div>

              {/* The Lab */}
              <div className="mb-8 p-6 bg-muted/20 rounded-xl">
                <h3 className="text-xl font-semibold mb-3">4. The Lab — Behavioral Change Engine</h3>
                <p className="text-muted-foreground mb-4">
                  Transform behaviors through systematic practice and tracking:
                </p>
                <ul className="space-y-2 text-muted-foreground text-sm">
                  <li>• <strong>Iceberg Commitment Tool:</strong> Address behaviors, feelings, and beliefs</li>
                  <li>• <strong>Daily Check-ins:</strong> Mood and practice logging</li>
                  <li>• <strong>Micro-Experiments:</strong> Science-backed daily challenges</li>
                  <li>• <strong>Wellness Score:</strong> 7 activity tracking (sleep, nutrition, exercise, etc.)</li>
                  <li>• <strong>Journaling:</strong> Structured reflection with visualization</li>
                </ul>
              </div>

              {/* The Codex */}
              <div className="mb-8 p-6 bg-muted/20 rounded-xl">
                <h3 className="text-xl font-semibold mb-3">5. The Codex — Knowledge Library</h3>
                <p className="text-muted-foreground mb-4">
                  Curated leadership wisdom organized for immediate application:
                </p>
                <ul className="space-y-2 text-muted-foreground text-sm">
                  <li>• Resources organized by archetype and growth path</li>
                  <li>• Featured content and recommended reading</li>
                  <li>• Search and filter by topic or format</li>
                  <li>• Integration with Architect for contextual recommendations</li>
                </ul>
              </div>

              {/* Analysis Reports */}
              <div className="mb-8 p-6 bg-muted/20 rounded-xl">
                <h3 className="text-xl font-semibold mb-3">6. Analysis Reports</h3>
                <p className="text-muted-foreground mb-4">
                  In-depth leadership analysis for deep self-understanding:
                </p>
                <ul className="space-y-2 text-muted-foreground text-sm">
                  <li>• <strong>Archetype Analysis:</strong> Strengths, growth paths, team dynamics</li>
                  <li>• <strong>Shadow Report:</strong> Triggers, unconscious patterns, integration exercises</li>
                  <li>• <strong>Weekly Wisdom Digest:</strong> Automated email summary of progress</li>
                </ul>
              </div>
            </section>

            {/* Target Audience */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-primary mb-4">Target Audience</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Primary Users</h4>
                  <ul className="text-muted-foreground text-sm space-y-1">
                    <li>• C-Suite Executives and Founders</li>
                    <li>• Senior Managers and Directors</li>
                    <li>• High-growth Entrepreneurs</li>
                    <li>• Executive Coaches</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Psychographic Profile</h4>
                  <ul className="text-muted-foreground text-sm space-y-1">
                    <li>• High achievers feeling internal friction</li>
                    <li>• Interested in philosophy and psychology</li>
                    <li>• Value structured personal development</li>
                    <li>• Willing to invest in growth tools</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Subscription Tiers */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-primary mb-4">Subscription Tiers</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-muted/20 rounded-xl">
                  <h4 className="font-semibold text-center mb-2">The Mirror</h4>
                  <p className="text-sm text-muted-foreground text-center">Basic: Assessment, Journaling, Codex</p>
                </div>
                <div className="p-4 bg-primary/10 rounded-xl border border-primary/30">
                  <h4 className="font-semibold text-center mb-2 text-primary">The Flow</h4>
                  <p className="text-sm text-muted-foreground text-center">Standard: + Studio, Lab, Experiments</p>
                </div>
                <div className="p-4 bg-muted/20 rounded-xl">
                  <h4 className="font-semibold text-center mb-2">The Architect</h4>
                  <p className="text-sm text-muted-foreground text-center">Premium: + AI Coach, Priority Support</p>
                </div>
              </div>
            </section>

            {/* Unique Differentiators */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-primary mb-4">Unique Differentiators</h2>
              <ol className="space-y-4 text-muted-foreground">
                <li><strong className="text-foreground">1. The Iceberg Model:</strong> Addresses visible behaviors by working on underlying feelings and beliefs</li>
                <li><strong className="text-foreground">2. Synthetic Wisdom:</strong> AI trained on 19 thinkers provides nuanced, multi-perspective guidance</li>
                <li><strong className="text-foreground">3. Audio-First Experience:</strong> Custom meditation and performance audio with professional synthesis</li>
                <li><strong className="text-foreground">4. Dark-Mode Native Design:</strong> Premium aesthetic that respects the seriousness of inner work</li>
                <li><strong className="text-foreground">5. Integrated System:</strong> Not isolated tools—everything works together as a coherent OS</li>
              </ol>
            </section>

            {/* Footer */}
            <div className="text-center pt-12 border-t border-border">
              <p className="text-sm text-muted-foreground">
                © 2025 The H2H Experiment • FlowOS Beta v1.0
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                www.theh2hexperiment.com
              </p>
            </div>
          </div>
        </ScrollArea>
      </div>
    </motion.div>
  );
};

// Generate markdown content for download
const generateSpecsContent = () => `# FlowOS - Product Specifications Document
## The Operating System for High-Performing Leaders
### H2H Inner Lab • Beta Version 1.0 • January 2025

---

## Executive Summary

FlowOS is a premium SaaS platform designed for high-performing leaders who recognize that external success without internal mastery is unsustainable. By integrating leadership psychology, philosophical wisdom, and bio-optimization science, FlowOS provides a comprehensive system for managing the internal architecture that drives exceptional performance.

---

## Core Value Proposition

> "Master your internal operating system before it defaults to chaos."

- **Comprehensive Self-Awareness:** Deep understanding of your leadership archetype, values, and shadow patterns
- **Structured Development:** Daily, weekly, and monthly rhythms that compound into transformation
- **AI-Powered Guidance:** 24/7 access to coaching synthesized from history's greatest minds
- **Practical Application:** Science-backed experiments and tools for real-world implementation

---

## Complete Feature Breakdown

### 1. Leadership Archetype Assessment

A comprehensive assessment system that reveals your unique leadership DNA:

- **30 Rapid-Fire Questions:** Determines your archetype blend (Hero, Judge, Teacher, Servant)
- **10 Ethical Scenarios:** Identifies core value categories
- **Shadow Analysis:** Reveals how strengths become weaknesses under stress
- **Percentage Breakdown:** Quantified results with detailed explanations

### 2. The Architect — AI Leadership Mentor

A synthetic persona synthesizing 19 distinct thinkers across 5 wisdom layers:

| Layer | Thinkers |
|-------|----------|
| The Bedrock (Philosophy) | Marcus Aurelius, Epictetus, Lao Tzu |
| The Mirror (Psychology) | Carl Jung, Viktor Frankl, Jordan Peterson |
| The Bridge (Connection) | Brené Brown, Marshall Rosenberg |
| The Engine (Bio-Neuro) | Andrew Huberman, David Sinclair |
| The Weapon (Strategy) | Alex Hormozi, Naval Ravikant, Ray Dalio |

### 3. The Studio — Audio Experience Builder

Create personalized audio experiences:

- Guided Meditation Builder (7-step customization)
- Peak Performance Primer
- Sleep Better Audio
- ElevenLabs professional voice synthesis
- Binaural frequencies (432Hz, 777Hz, 1111Hz)

### 4. The Lab — Behavioral Change Engine

- Iceberg Commitment Tool
- Daily check-ins and mood tracking
- Micro-Experiments with scientific backing
- 7-category wellness score
- Structured journaling

### 5. The Codex — Knowledge Library

- Resources organized by archetype
- Featured and recommended content
- Search and filter functionality
- AI-powered recommendations

### 6. Analysis Reports

- Archetype Analysis Page
- Shadow Report Page
- Weekly Wisdom Digest

---

## Target Audience

**Primary Users:**
- C-Suite Executives and Founders
- Senior Managers and Directors
- High-growth Entrepreneurs
- Executive Coaches

**Psychographic Profile:**
- High achievers feeling internal friction
- Interested in philosophy and psychology
- Value structured personal development
- Willing to invest in growth tools

---

## Subscription Tiers

| Tier | Name | Features |
|------|------|----------|
| Basic | The Mirror | Assessment, Journaling, Codex |
| Standard | The Flow | + Studio, Lab, Experiments |
| Premium | The Architect | + AI Coach, Priority Support |

---

## Unique Differentiators

1. **The Iceberg Model:** Addresses visible behaviors through underlying feelings and beliefs
2. **Synthetic Wisdom:** AI trained on 19 thinkers for multi-perspective guidance
3. **Audio-First Experience:** Custom meditation with professional synthesis
4. **Dark-Mode Native Design:** Premium aesthetic for serious inner work
5. **Integrated System:** Coherent OS, not isolated tools

---

© 2025 The H2H Experiment • FlowOS Beta v1.0
www.theh2hexperiment.com
`;

export default ProductSpecsDocument;
