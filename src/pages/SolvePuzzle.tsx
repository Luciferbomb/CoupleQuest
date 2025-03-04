
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

const SolvePuzzle = () => {
  const { puzzleSlug } = useParams<{ puzzleSlug: string }>();
  const navigate = useNavigate();
  const [puzzleData, setPuzzleData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeClue, setActiveClue] = useState<number | null>(null);
  const [activeDirection, setActiveDirection] = useState<'across' | 'down'>('across');
  const [completed, setCompleted] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState<number>(0);
  
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
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="page-container pt-24 animate-fade-in">
        <Card className="glass-panel p-6 sm:p-8 max-w-5xl mx-auto">
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold mb-2">
              {puzzleData.creatorName}'s Relationship Riddle
            </h1>
            <p className="text-muted-foreground">
              Solve this crossword puzzle to see how well you know {puzzleData.creatorName}.
            </p>
          </div>
          
          {completed ? (
            <div className="text-center my-12 animate-fade-in">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <Medal className="text-green-600 h-10 w-10" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Perfect Match!</h2>
              <p className="text-muted-foreground mb-2">
                You've successfully completed {puzzleData.creatorName}'s relationship puzzle.
                You really know them well!
              </p>
              
              <div className="flex items-center justify-center text-lg font-medium mb-6">
                <Clock className="mr-2 text-primary" />
                <span>Time: {formatTime(timeElapsed)}</span>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/')}
                  className="sm:flex-1 max-w-xs mx-auto"
                >
                  Create Your Own Puzzle
                </Button>
                <Button
                  className="sm:flex-1 max-w-xs mx-auto"
                  onClick={() => {
                    // Share functionality
                    toast({
                      title: "Share your results",
                      description: `I solved ${puzzleData.creatorName}'s puzzle in ${formatTime(timeElapsed)}!`
                    });
                  }}
                >
                  <Send className="mr-2" size={16} />
                  Share Your Results
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 flex justify-center">
                <CrosswordGrid 
                  words={puzzleData.puzzle.words} 
                  gridSize={puzzleData.puzzle.gridSize}
                  onSolve={handleSolve}
                />
              </div>
              
              <div className="bg-secondary/30 p-4 rounded-lg overflow-auto max-h-[500px] lg:max-h-full">
                <div className="mb-4">
                  <h3 className="font-semibold text-lg mb-2">Across</h3>
                  <ul className="space-y-2">
                    {acrossClues.map((word: any) => (
                      <li 
                        key={`across-${word.number}`}
                        className={`text-sm p-2 rounded-md transition-colors cursor-pointer ${
                          activeClue === word.number && activeDirection === 'across' 
                            ? 'bg-primary/10 font-medium' 
                            : 'hover:bg-secondary'
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
                  <h3 className="font-semibold text-lg mb-2">Down</h3>
                  <ul className="space-y-2">
                    {downClues.map((word: any) => (
                      <li 
                        key={`down-${word.number}`}
                        className={`text-sm p-2 rounded-md transition-colors cursor-pointer ${
                          activeClue === word.number && activeDirection === 'down'
                            ? 'bg-primary/10 font-medium' 
                            : 'hover:bg-secondary'
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
          )}
        </Card>
      </div>
    </div>
  );
};

export default SolvePuzzle;
