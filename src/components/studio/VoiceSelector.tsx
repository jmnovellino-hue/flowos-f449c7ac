import { motion } from 'framer-motion';
import { User, Users } from 'lucide-react';

export interface VoiceOption {
  id: string;
  name: string;
  gender: 'female' | 'male';
  age: 'young' | 'middle' | 'mature';
  origin: string;
  description: string;
}

export const VOICE_OPTIONS: VoiceOption[] = [
  {
    id: 'FGY2WhTYpPnrIDTdsKH5',
    name: 'Laura',
    gender: 'female',
    age: 'middle',
    origin: 'American',
    description: 'Warm and calming female voice',
  },
  {
    id: 'pFZP5JQG7iQjIQuC4Bku',
    name: 'Lily',
    gender: 'female',
    age: 'young',
    origin: 'British',
    description: 'Gentle and soothing young voice',
  },
  {
    id: 'XrExE9yKIg1WjnnlVkGX',
    name: 'Matilda',
    gender: 'female',
    age: 'mature',
    origin: 'American',
    description: 'Mature and reassuring voice',
  },
  {
    id: 'SAz9YHcvj6GT2YYXdXww',
    name: 'River',
    gender: 'male',
    age: 'middle',
    origin: 'American',
    description: 'Warm and grounding male voice',
  },
  {
    id: 'nPczCjzI2devNBz1zQrb',
    name: 'Brian',
    gender: 'male',
    age: 'mature',
    origin: 'American',
    description: 'Deep and soothing male voice',
  },
  {
    id: 'onwK4e9ZLuTAKqWW03F9',
    name: 'Daniel',
    gender: 'male',
    age: 'young',
    origin: 'British',
    description: 'Calm and articulate young voice',
  },
];

interface VoiceSelectorProps {
  selectedVoice: string;
  onSelect: (voiceId: string) => void;
}

export const VoiceSelector = ({ selectedVoice, onSelect }: VoiceSelectorProps) => {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-foreground">Choose Narrator Voice</label>
      <div className="grid grid-cols-2 gap-2">
        {VOICE_OPTIONS.map((voice) => (
          <motion.button
            key={voice.id}
            onClick={() => onSelect(voice.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`p-3 rounded-xl text-left transition-all ${
              selectedVoice === voice.id
                ? 'bg-primary/20 border-2 border-primary'
                : 'bg-muted/30 border-2 border-transparent hover:bg-muted/50'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              {voice.gender === 'female' ? (
                <User className={`w-4 h-4 ${selectedVoice === voice.id ? 'text-primary' : 'text-muted-foreground'}`} />
              ) : (
                <Users className={`w-4 h-4 ${selectedVoice === voice.id ? 'text-primary' : 'text-muted-foreground'}`} />
              )}
              <span className="font-medium text-sm text-foreground">{voice.name}</span>
            </div>
            <p className="text-xs text-muted-foreground">{voice.description}</p>
            <div className="flex gap-1 mt-2">
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground capitalize">
                {voice.age}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                {voice.origin}
              </span>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};
