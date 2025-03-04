
import { useState } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
}

const OnboardingModal = ({ isOpen, onClose, onSubmit }: OnboardingModalProps) => {
  const [name, setName] = useState('');
  const [step, setStep] = useState(0);
  
  const steps = [
    {
      title: "Welcome to Couple Quest",
      description: "Create a personalized crossword puzzle that tests how well your partner knows you.",
      icon: "👋"
    },
    {
      title: "How It Works",
      description: "You'll answer some questions about yourself, and we'll turn your answers into a crossword puzzle for your partner to solve.",
      icon: "🧩"
    },
    {
      title: "Tell Us Your Name",
      description: "We'll use your name to personalize the puzzle (e.g., 'Sarah's Relationship Riddle').",
      icon: "✨"
    }
  ];
  
  const handleSubmit = () => {
    if (name.trim()) {
      onSubmit(name);
      onClose();
    }
  };
  
  const currentStep = steps[step];
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-background rounded-2xl shadow-elevation-high w-full max-w-md mx-4 overflow-hidden animate-scale-in">
          <div className="px-6 py-8">
            <div className="flex flex-col items-center text-center mb-6">
              {currentStep.icon && (
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 animate-pulse-soft">
                  <span className="text-2xl">{currentStep.icon}</span>
                </div>
              )}
              <h3 className="text-xl font-semibold mb-2">{currentStep.title}</h3>
              <p className="text-muted-foreground">{currentStep.description}</p>
            </div>
            
            {step === 2 && (
              <div className="space-y-4 mb-6">
                <Input
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full"
                  autoFocus
                />
              </div>
            )}
            
            <div className="flex items-center justify-between">
              {step > 0 ? (
                <Button 
                  variant="outline" 
                  onClick={() => setStep(step - 1)}
                  className="transition-all"
                >
                  Back
                </Button>
              ) : (
                <div></div>
              )}
              
              {step < steps.length - 1 ? (
                <Button 
                  onClick={() => setStep(step + 1)}
                  className="transition-all"
                >
                  Next
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit}
                  className="transition-all"
                  disabled={!name.trim()}
                >
                  Get Started
                </Button>
              )}
            </div>
          </div>
          
          <div className="px-6 py-3 bg-muted">
            <div className="flex space-x-2">
              {steps.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1 rounded-full flex-1 transition-colors ${
                    i <= step ? 'bg-primary' : 'bg-border'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default OnboardingModal;
