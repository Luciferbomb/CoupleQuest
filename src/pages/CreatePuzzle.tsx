
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import QuestionForm from '@/components/QuestionForm';
import { toast } from '@/components/ui/use-toast';
import { generateCrosswordPuzzle, generatePuzzleSlug } from '@/utils/puzzleGenerator';
import Navbar from '@/components/Navbar';

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
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="page-container pt-24 animate-fade-in">
        <Card className="glass-panel p-8 max-w-3xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">{creatorName}'s Relationship Riddle</h1>
            <p className="text-muted-foreground">
              Answer the questions below to create a custom crossword puzzle for your partner to solve.
            </p>
          </div>
          
          <QuestionForm onSubmit={handleSubmit} creatorName={creatorName} />
        </Card>
      </div>
    </div>
  );
};

export default CreatePuzzle;
