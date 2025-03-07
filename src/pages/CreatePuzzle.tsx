
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import QuestionForm from '@/components/QuestionForm';
import { toast } from '@/components/ui/use-toast';
import { generateCrosswordPuzzle, generatePuzzleSlug } from '@/utils/puzzleGenerator';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';
import { LampContainer } from '@/components/ui/lamp';

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
    <div className="min-h-screen bg-background overflow-hidden">
      <Navbar />
      
      <div className="relative w-full">
        <LampContainer className="h-[40vh] min-h-[400px]">
          <motion.div
            initial={{ opacity: 0.5, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.3,
              duration: 0.8,
              ease: "easeInOut",
            }}
            className="relative z-50 mt-8"
          >
            <h1 className="bg-gradient-to-br from-beige-300 to-beige-600 py-4 bg-clip-text text-center text-4xl font-medium tracking-tight text-transparent md:text-6xl">
              {creatorName}'s <br /> Relationship Riddle
            </h1>
            <p className="text-beige-200 text-center mt-4 max-w-md mx-auto">
              Answer the questions below to create a custom crossword puzzle for your partner to solve.
            </p>
          </motion.div>
        </LampContainer>
      </div>
      
      <div className="page-container -mt-24 relative z-10 animate-fade-in">
        <Card className="glass-panel p-8 max-w-3xl mx-auto border-beige-200/50 shadow-xl">
          <QuestionForm onSubmit={handleSubmit} creatorName={creatorName} />
        </Card>
      </div>
    </div>
  );
};

export default CreatePuzzle;
