import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import QuestionForm from '@/components/QuestionForm';
import { toast } from '@/components/ui/use-toast';
import { generateCrosswordPuzzle, generatePuzzleSlug } from '@/utils/puzzleGenerator';
import Navbar from '@/components/Navbar';
import { Heart, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

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
      console.error('Error creating puzzle:', error);
      toast({
        title: "Error creating puzzle",
        description: "Please try again with different answers.",
        variant: "destructive"
      });
    }
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 10
      }
    }
  };
  
  return (
    <div className="page-container">
      <Navbar />
      
      <motion.div 
        className="w-full max-w-4xl mx-auto pt-16 md:pt-24"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="text-center mb-8" variants={itemVariants}>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            <span className="text-gradient">Create Your Puzzle</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Hi <span className="font-medium">{creatorName}</span>! Let's create a personalized crossword puzzle for your partner.
          </p>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <Card className="glass-panel">
            <div className="mb-6 flex items-center justify-center">
              <div className="flex items-center space-x-2 bg-primary/10 px-4 py-2 rounded-full">
                <Sparkles className="text-primary h-5 w-5" />
                <span className="font-medium">Answer the questions below to create your puzzle</span>
              </div>
            </div>
            
            <QuestionForm onSubmit={handleSubmit} creatorName={creatorName} />
          </Card>
        </motion.div>
        
        <motion.div 
          className="mt-12 text-center text-muted-foreground"
          variants={itemVariants}
        >
          <p className="flex items-center justify-center">
            <Heart className="text-primary h-5 w-5 mr-2" />
            Your answers will be used to generate a crossword puzzle for your partner
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default CreatePuzzle;
