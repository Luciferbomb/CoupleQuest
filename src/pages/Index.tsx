
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import OnboardingModal from '@/components/OnboardingModal';
import { ArrowRight } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [creatorName, setCreatorName] = useState('');
  
  const handleNameSubmit = (name: string) => {
    setCreatorName(name);
    localStorage.setItem('creatorName', name);
    navigate('/create');
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16 sm:py-24">
        <div className="w-full max-w-4xl animate-fade-in">
          <div className="text-center mb-12">
            <div className="mb-6">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4 animate-pulse-soft">
                Strengthen your relationship through play
              </div>
              <h1 className="text-4xl sm:text-6xl font-bold mb-6 tracking-tight">
                How well does your partner
                <span className="text-primary block mt-2">really know you?</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Create a personalized crossword puzzle that tests your partner's knowledge about you. 
                Share it and see if they can solve all the clues!
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-10">
              <Button 
                size="lg" 
                className="group text-lg h-12 px-8 transition-all"
                onClick={() => setShowModal(true)}
              >
                Create Your Puzzle
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="text-lg h-12 px-8"
                onClick={() => navigate('/solve')}
              >
                Solve a Puzzle
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="glass-panel p-8 text-center animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <span className="text-primary font-bold text-xl">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Answer Questions</h3>
              <p className="text-muted-foreground">
                Answer a set of questions about yourself that your partner should know.
              </p>
            </div>
            
            <div className="glass-panel p-8 text-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <span className="text-primary font-bold text-xl">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Create Puzzle</h3>
              <p className="text-muted-foreground">
                We'll transform your answers into a personalized crossword puzzle.
              </p>
            </div>
            
            <div className="glass-panel p-8 text-center animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <span className="text-primary font-bold text-xl">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Share & Solve</h3>
              <p className="text-muted-foreground">
                Share the puzzle with your partner and see if they really know you.
              </p>
            </div>
          </div>
          
          <div className="mt-20 glass-panel p-10 text-center">
            <h2 className="text-2xl font-semibold mb-4">Why Couple Quest?</h2>
            <p className="text-lg mb-8 text-muted-foreground max-w-2xl mx-auto">
              Relationships thrive on understanding. Our fun, interactive puzzles help couples 
              discover how well they know each other in a playful, engaging way.
            </p>
            
            <Button
              variant="outline"
              className="mx-auto"
              onClick={() => setShowModal(true)}
            >
              Get Started
            </Button>
          </div>
        </div>
      </div>
      
      <OnboardingModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleNameSubmit}
      />
    </div>
  );
};

export default Index;
