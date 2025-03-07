
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import QuestionForm from '@/components/QuestionForm';
import { toast } from '@/components/ui/use-toast';
import { generateCrosswordPuzzle, generatePuzzleSlug } from '@/utils/puzzleGenerator';
import Navbar from '@/components/Navbar';
import { Heart, Sparkles } from 'lucide-react';

interface Answer {
  question: string;
  answer: string;
}

const CreatePuzzle = () => {
  const navigate = useNavigate();
  const [creatorName, setCreatorName] = useState('');
  
  useEffect(() => {
    const storedName = localStorage.getItem('creatorName');
    if (storedName) {
      setCreatorName(storedName);
    } else {
      navigate('/');
    }
  }, [navigate]);
  
  const handleSubmit = (answers: Answer[]) => {
    try {
      // Generate a crossword puzzle
      const puzzle = generateCrosswordPuzzle(answers);
      
      // Generate a unique slug for sharing
      const puzzleSlug = generatePuzzleSlug();
      
      // Store puzzle data in localStorage (in a real app, this would use a database)
      const puzzleData = {
        creatorName,
        answers,
        puzzle,
        createdAt: new Date().toISOString()
      };
      
      localStorage.setItem(`puzzle_${puzzleSlug}`, JSON.stringify(puzzleData));
      
      toast({
        title: "Puzzle created!",
        description: "Your crossword puzzle has been generated successfully.",
      });
      
      // Navigate to the share page
      navigate(`/share/${puzzleSlug}`);
    } catch (error) {
      console.error('Error generating puzzle:', error);
      toast({
        title: "Error creating puzzle",
        description: "There was a problem generating your crossword puzzle. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Decorative sparkles
  const sparklePositions = [
    { top: '5%', left: '10%' },
    { top: '20%', right: '15%' },
    { top: '50%', left: '5%' },
    { top: '70%', right: '8%' },
    { top: '85%', left: '15%' },
    { top: '30%', left: '80%' }
  ];
  
  return (
    <div className="min-h-screen bg-background">
      <div className="couple-bg-pattern"></div>
      {sparklePositions.map((pos, i) => (
        <div key={i} className="sparkle" style={pos}></div>
      ))}
      
      <Navbar />
      
      <div className="page-container pt-24 animate-fade-in">
        <Card className="glass-panel p-4 sm:p-6 md:p-8 max-w-3xl mx-auto relative overflow-hidden">
          <div className="heart-decoration">
            <Heart size={120} className="md:w-[180px] md:h-[180px]" fill="rgba(240, 169, 80, 0.15)" stroke="none" />
          </div>
          
          <div className="mb-6 relative">
            <div className="flex flex-col sm:flex-row items-center justify-center mb-4">
              <div className="p-2 sm:p-3 bg-beige-100 rounded-full mb-2 sm:mb-0 sm:mr-3">
                <Sparkles className="text-beige-500 h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-center">{creatorName}'s Relationship Riddle</h1>
            </div>
            <p className="text-muted-foreground text-center text-sm sm:text-base max-w-lg mx-auto">
              Answer the questions below to create a custom crossword puzzle for your partner to solve.
              Make it personal and meaningful!
            </p>
          </div>
          
          <QuestionForm onSubmit={handleSubmit} creatorName={creatorName} />
        </Card>
      </div>
    </div>
  );
};

export default CreatePuzzle;
