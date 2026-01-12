import { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { QuantumBubble } from './QuantumBubble';

export const QuantumBubbleButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 md:bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-lg flex items-center justify-center glow-turquoise"
        aria-label="Open Quantum Bubble"
      >
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute inset-0 rounded-full bg-primary/30 blur-lg"
        />
        <Zap className="w-6 h-6 relative z-10" />
      </motion.button>

      <QuantumBubble isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};
