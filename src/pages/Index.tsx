import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import OnboardingModal from '@/components/OnboardingModal';
import { ArrowRight, Heart, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const Index = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [creatorName, setCreatorName] = useState('');
  
  const handleNameSubmit = (name: string) => {
    setCreatorName(name);
    localStorage.setItem('creatorName', name);
    navigate('/create');
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
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 sm:py-20">
        <motion.div 
          className="w-full max-w-4xl"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="text-center mb-12">
            <motion.div className="mb-6" variants={itemVariants}>
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                <Heart className="mr-2 h-4 w-4" />
                Strengthen your relationship through play
              </div>
              <h1 className="text-4xl sm:text-6xl font-bold mb-6 tracking-tight">
                How well does your partner
                <span className="text-gradient block mt-2">really know you?</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Create a personalized crossword puzzle that tests your partner's knowledge about you. 
                Share it and see if they can solve all the clues!
              </p>
            </motion.div>
            
            <motion.div 
              className="flex flex-col sm:flex-row justify-center gap-4 mt-10"
              variants={itemVariants}
            >
              <Button 
                size="lg" 
                className="group text-lg h-12 px-8 transition-all bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                onClick={() => setShowModal(true)}
              >
                Create Your Puzzle
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="text-lg h-12 px-8 border-primary/20 hover:bg-primary/5"
                onClick={() => navigate('/solve')}
              >
                Solve a Puzzle
                <Sparkles className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          </div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12"
            variants={itemVariants}
          >
            {[
              {
                title: "Create",
                description: "Answer questions about yourself to generate a unique crossword puzzle.",
                icon: "✏️"
              },
              {
                title: "Share",
                description: "Send the puzzle to your partner with a unique code or link.",
                icon: "🔗"
              },
              {
                title: "Connect",
                description: "See how well they know you and strengthen your bond.",
                icon: "❤️"
              }
            ].map((feature, index) => (
              <motion.div 
                key={index}
                className="glass-panel text-center p-6"
                whileHover={{ y: -5 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
      
      {/* Floating hearts background decoration */}
      <div className="floating-hearts">
        {Array.from({ length: 15 }).map((_, i) => (
          <div 
            key={i}
            className="floating-heart"
            style={{
              left: `${Math.random() * 100}%`,
              animationDuration: `${15 + Math.random() * 15}s`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
      </div>
      
      {/* Onboarding modal */}
      <OnboardingModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)}
        onSubmit={handleNameSubmit}
      />
    </div>
  );
};

export default Index;
