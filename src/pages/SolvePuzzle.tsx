import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';
import CrosswordGrid from '@/components/CrosswordGrid';
import Navbar from '@/components/Navbar';
import { Clock, Medal, Send } from 'lucide-react';
import { formatTime } from '@/utils/timeUtils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

const SolvePuzzle = () => {
  const { puzzleSlug } = useParams<{ puzzleSlug: string }>();
  const navigate = useNavigate();
  const [puzzleData, setPuzzleData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeClue, setActiveClue] = useState<number | null>(null);
  const [activeDirection, setActiveDirection] = useState<'across' | 'down'>('across');
  const [completed, setCompleted] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState<number>(0);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [completionTime, setCompletionTime] = useState<number | null>(null);
  const [puzzleCode, setPuzzleCode] = useState('');
  
  useEffect(() => {
    if (puzzleSlug) {
      const storedPuzzle = localStorage.getItem(`puzzle_${puzzleSlug}`);
      
      if (storedPuzzle) {
        setPuzzleData(JSON.parse(storedPuzzle));
      } else {
        // Handle case where no puzzle exists
        toast({
          title: "Puzzle not found",
          description: "This puzzle doesn't exist or has expired.",
          variant: "destructive",
        });
      }
    }
    
    setLoading(false);
  }, [puzzleSlug]);
  
  const handleSolve = (isCorrect: boolean, time?: number) => {
    if (isCorrect) {
      setCompleted(true);
      if (time) setTimeElapsed(time);
      
      toast({
        title: "Congratulations!",
        description: "You've solved the puzzle correctly!",
      });
    } else {
      toast({
        title: "Not quite right",
        description: "Some answers are incorrect. Keep trying!",
      });
    }
  };
  
  const handleLoadPuzzle = () => {
    // Implement the logic to load the puzzle
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse-soft">Loading puzzle...</div>
      </div>
    );
  }
  
  if (!puzzleData && !puzzleSlug) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <div className="page-container pt-24 animate-fade-in">
          <Card className="glass-panel p-8 max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-4">Solve a Relationship Puzzle</h1>
              <p className="text-muted-foreground">
                Enter a puzzle code to solve a relationship crossword made just for you.
              </p>
            </div>
            
            <div className="max-w-sm mx-auto">
              <input
                type="text"
                placeholder="Enter puzzle code (e.g., abc123)"
                className="w-full p-4 border rounded-lg mb-4"
              />
              
              <Button className="w-full">
                Find Puzzle
              </Button>
            </div>
            
            <div className="mt-8 pt-8 border-t border-border">
              <p className="text-muted-foreground mb-4">
                Don't have a puzzle code? Create your own!
              </p>
              <Button 
                variant="outline" 
                onClick={() => navigate('/')}
              >
                Create a Puzzle
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }
  
  if (!puzzleData) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <div className="page-container pt-24 animate-fade-in">
          <Card className="glass-panel p-8 max-w-2xl mx-auto text-center">
            <h1 className="text-3xl font-bold mb-4">Puzzle Not Found</h1>
            <p className="text-muted-foreground mb-8">
              The puzzle you're looking for doesn't exist or has expired.
            </p>
            <Button onClick={() => navigate('/')}>
              Return Home
            </Button>
          </Card>
        </div>
      </div>
    );
  }
  
  // Sort clues by number and direction (across first, then down)
  const acrossClues = puzzleData.puzzle.words
    .filter((word: any) => word.direction === 'across')
    .sort((a: any, b: any) => a.number - b.number);
    
  const downClues = puzzleData.puzzle.words
    .filter((word: any) => word.direction === 'down')
    .sort((a: any, b: any) => a.number - b.number);
  
  return (
    <div className="page-container">
      <Navbar />
      
      {loading ? (
        <div className="flex items-center justify-center h-[70vh]">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-12 w-12 rounded-full bg-primary/20 mb-4"></div>
            <div className="h-4 w-48 bg-primary/20 rounded"></div>
          </div>
        </div>
      ) : !puzzleData && !puzzleSlug ? (
        <div className="flex flex-col items-center justify-center h-[70vh]">
          <div className="text-center max-w-md glass-panel animate-fade-in">
            <h2 className="text-2xl font-bold mb-4">Enter Puzzle Code</h2>
            <p className="text-muted-foreground mb-6">
              Enter the code shared with you to solve the puzzle.
            </p>
            <div className="space-y-4">
              <Input 
                placeholder="Enter puzzle code" 
                value={puzzleCode} 
                onChange={(e) => setPuzzleCode(e.target.value)}
                className="input-modern"
              />
              <Button onClick={handleLoadPuzzle} className="w-full">
                Load Puzzle
              </Button>
            </div>
          </div>
        </div>
      ) : !puzzleData ? (
        <div className="flex flex-col items-center justify-center h-[70vh]">
          <div className="text-center max-w-md glass-panel animate-fade-in">
            <h2 className="text-2xl font-bold mb-4">Puzzle Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The puzzle you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate('/')} className="w-full">
              Go Home
            </Button>
          </div>
        </div>
      ) : (
        <div className="animate-fade-in pt-16 md:pt-20">
          <div className="text-center mb-6">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              <span className="text-gradient">Solve the Puzzle</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Created by <span className="font-medium">{puzzleData.creatorName}</span>
            </p>
          </div>
          
          <div className="puzzle-container flex flex-col lg:flex-row gap-6">
            <div className="grid-container lg:flex-1 flex justify-center order-1 lg:order-none">
              <CrosswordGrid 
                words={puzzleData.puzzle.words} 
                gridSize={puzzleData.puzzle.gridSize}
                onSolve={handleSolve}
              />
            </div>
            
            <div className="clues-container lg:w-80 glass-panel order-2 lg:order-none">
              <div className="mb-4">
                <h3 className="font-semibold text-lg mb-2 flex items-center">
                  <span className="inline-block w-4 h-0.5 bg-primary mr-2"></span>
                  Across
                </h3>
                <ul className="clue-list">
                  {puzzleData.puzzle.words
                    .filter((word: any) => word.direction === 'across')
                    .sort((a: any, b: any) => a.number - b.number)
                    .map((word: any) => (
                      <li 
                        key={`across-${word.number}`}
                        className={`clue-item ${
                          activeClue === word.number && activeDirection === 'across' 
                            ? 'active' 
                            : ''
                        }`}
                        onClick={() => {
                          setActiveClue(word.number);
                          setActiveDirection('across');
                        }}
                      >
                        <span className="font-medium">{word.number}.</span> {word.clue}
                      </li>
                    ))}
                </ul>
              </div>
              
              <Separator className="my-4" />
              
              <div>
                <h3 className="font-semibold text-lg mb-2 flex items-center">
                  <span className="inline-block w-4 h-0.5 bg-secondary mr-2"></span>
                  Down
                </h3>
                <ul className="clue-list">
                  {puzzleData.puzzle.words
                    .filter((word: any) => word.direction === 'down')
                    .sort((a: any, b: any) => a.number - b.number)
                    .map((word: any) => (
                      <li 
                        key={`down-${word.number}`}
                        className={`clue-item ${
                          activeClue === word.number && activeDirection === 'down' 
                            ? 'active' 
                            : ''
                        }`}
                        onClick={() => {
                          setActiveClue(word.number);
                          setActiveDirection('down');
                        }}
                      >
                        <span className="font-medium">{word.number}.</span> {word.clue}
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
      
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
      
      {/* Success modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold">
              Congratulations! 🎉
            </DialogTitle>
            <DialogDescription className="text-center">
              You've successfully completed the crossword puzzle!
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4">
            <div className="bg-primary/10 p-4 rounded-lg text-center">
              <p className="text-sm text-muted-foreground mb-1">Time to complete</p>
              <p className="text-2xl font-bold">{formatTime(completionTime || 0)}</p>
            </div>
            <Button onClick={() => navigate('/')} className="w-full">
              Create Your Own Puzzle
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SolvePuzzle;
