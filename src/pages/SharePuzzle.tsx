
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Share2, Copy, Heart, Gift, MessageCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';

const SharePuzzle = () => {
  const { puzzleSlug } = useParams<{ puzzleSlug: string }>();
  const navigate = useNavigate();
  const [puzzleData, setPuzzleData] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  
  useEffect(() => {
    if (puzzleSlug) {
      const storedPuzzle = localStorage.getItem(`puzzle_${puzzleSlug}`);
      
      if (storedPuzzle) {
        setPuzzleData(JSON.parse(storedPuzzle));
      } else {
        navigate('/create');
      }
    }
  }, [puzzleSlug, navigate]);
  
  const shareLink = `${window.location.origin}/solve/${puzzleSlug}`;
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink).then(() => {
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "Puzzle link has been copied to your clipboard.",
      });
      
      setTimeout(() => setCopied(false), 2000);
    });
  };
  
  const shareViaWhatsApp = () => {
    const text = `Can you solve my relationship crossword puzzle? Test how well you know me! ${shareLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };
  
  // Decorative elements
  const heartPositions = [
    { top: '10%', left: '5%', size: 30, rotation: '15deg', opacity: 0.1 },
    { top: '25%', right: '8%', size: 24, rotation: '-10deg', opacity: 0.15 },
    { top: '60%', left: '7%', size: 18, rotation: '5deg', opacity: 0.12 },
    { top: '75%', right: '10%', size: 35, rotation: '-5deg', opacity: 0.1 },
  ];
  
  if (!puzzleData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse-soft">Loading puzzle...</div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      <div className="couple-bg-pattern"></div>
      {heartPositions.map((heart, i) => (
        <div key={i} style={{
          position: 'absolute',
          top: heart.top,
          left: heart.left,
          right: heart.right,
          transform: `rotate(${heart.rotation})`,
          zIndex: -1
        }}>
          <Heart 
            size={heart.size} 
            fill="rgba(240, 169, 80, 0.2)" 
            stroke="none" 
            style={{ opacity: heart.opacity }}
          />
        </div>
      ))}
      
      <Navbar />
      
      <div className="page-container pt-24 animate-fade-in">
        <Card className="glass-panel p-8 max-w-2xl mx-auto text-center">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 animate-pulse-soft shadow-elevation-low">
              <Gift className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Your Puzzle is Ready!</h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              Share this unique link with {puzzleData.creatorName === 'your' ? 'your partner' : `${puzzleData.creatorName}'s partner`} to let them solve your relationship crossword.
            </p>
          </div>
          
          <div className="bg-secondary/50 p-4 rounded-lg flex items-center justify-between mb-8 border border-beige-200/30">
            <div className="text-sm truncate mr-2 text-muted-foreground">
              {shareLink}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={copyToClipboard}
              className={copied ? 'bg-primary text-primary-foreground' : ''}
            >
              <Copy className="h-4 w-4 mr-2" />
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button 
              className="w-full h-12 bg-[#25D366] hover:bg-[#128C7E] text-white flex items-center justify-center gap-2 shadow-sm"
              onClick={shareViaWhatsApp}
            >
              <MessageCircle className="h-5 w-5" />
              Share via WhatsApp
            </Button>
            
            <Button 
              variant="secondary"
              className="w-full h-12 shadow-sm"
              onClick={() => navigate(`/solve/${puzzleSlug}`)}
            >
              <Heart className="h-4 w-4 mr-2" fill="currentColor" strokeWidth={1.5} />
              Preview Puzzle
            </Button>
          </div>
          
          <div className="mt-8 pt-8 border-t border-border">
            <h3 className="font-medium mb-2">Puzzle Stats</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-secondary/50 p-4 rounded-lg border border-beige-200/30 shadow-sm">
                <div className="text-2xl font-bold">{puzzleData.answers.length}</div>
                <div className="text-xs text-muted-foreground">Questions</div>
              </div>
              <div className="bg-secondary/50 p-4 rounded-lg border border-beige-200/30 shadow-sm">
                <div className="text-2xl font-bold">{puzzleData.puzzle.words.length}</div>
                <div className="text-xs text-muted-foreground">Words</div>
              </div>
              <div className="bg-secondary/50 p-4 rounded-lg border border-beige-200/30 shadow-sm">
                <div className="text-2xl font-bold">{puzzleData.puzzle.gridSize}×{puzzleData.puzzle.gridSize}</div>
                <div className="text-xs text-muted-foreground">Grid Size</div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SharePuzzle;
