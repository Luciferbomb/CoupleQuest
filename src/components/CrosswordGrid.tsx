import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import CrosswordCell from './CrosswordCell';
import { Button } from '@/components/ui/button';
import { Check, Clock, Keyboard } from 'lucide-react';
import { formatTime } from '@/utils/timeUtils';
import MobileKeyboard from './MobileKeyboard';
import { AnimatePresence } from 'framer-motion';

interface Word {
  answer: string;
  clue: string;
  position: {
    x: number;
    y: number;
  };
  direction: 'across' | 'down';
  number: number;
}

interface CrosswordGridProps {
  words: Word[];
  gridSize: number;
  onSolve: (isCorrect: boolean, timeElapsed?: number) => void;
}

const CrosswordGrid = ({ words, gridSize, onSolve }: CrosswordGridProps) => {
  // Initialize grid state
  const [grid, setGrid] = useState<string[][]>(() => {
    const newGrid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(''));
    return newGrid;
  });
  
  // Timer state
  const [startTime] = useState<number>(Date.now());
  const [timeElapsed, setTimeElapsed] = useState<number>(0);
  const timerRef = useRef<number | null>(null);
  
  // Track which cells are part of the puzzle
  const [blackCells, setBlackCells] = useState<boolean[][]>(() => {
    const cells = Array(gridSize).fill(null).map(() => Array(gridSize).fill(true));
    
    // Mark cells that are part of words as not black
    words.forEach(word => {
      const { x, y } = word.position;
      const length = word.answer.length;
      
      for (let i = 0; i < length; i++) {
        if (word.direction === 'across') {
          cells[y][x + i] = false;
        } else {
          cells[y + i][x] = false;
        }
      }
    });
    
    return cells;
  });
  
  // Active cell tracking
  const [activeCell, setActiveCell] = useState<{ row: number; col: number } | null>(null);
  const [activeDirection, setActiveDirection] = useState<'across' | 'down'>('across');
  const [cellValidation, setCellValidation] = useState<{ correct: Set<string>; incorrect: Set<string> }>({
    correct: new Set(),
    incorrect: new Set()
  });
  const [completed, setCompleted] = useState<boolean>(false);
  
  // Track active words
  const [activeWords, setActiveWords] = useState<Word[]>([]);
  
  // Add this to the CrosswordGrid component, after the existing state variables
  const [showMobileKeyboard, setShowMobileKeyboard] = useState(false);
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  
  // Start the timer
  useEffect(() => {
    timerRef.current = window.setInterval(() => {
      setTimeElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [startTime]);
  
  // Stop timer when puzzle is completed
  useEffect(() => {
    if (completed && timerRef.current) {
      window.clearInterval(timerRef.current);
    }
  }, [completed]);
  
  // Find words that include the current cell
  useEffect(() => {
    if (!activeCell) return;
    
    const wordsAtCell = words.filter(word => {
      const { x, y } = word.position;
      if (word.direction === 'across') {
        return activeCell.row === y && 
               activeCell.col >= x && 
               activeCell.col < x + word.answer.length;
      } else {
        return activeCell.col === x && 
               activeCell.row >= y && 
               activeCell.row < y + word.answer.length;
      }
    });
    
    // Prioritize words in the current direction
    const acrossWords = wordsAtCell.filter(w => w.direction === 'across');
    const downWords = wordsAtCell.filter(w => w.direction === 'down');
    
    if (activeDirection === 'across' && acrossWords.length > 0) {
      setActiveWords([...acrossWords, ...downWords]);
    } else if (activeDirection === 'down' && downWords.length > 0) {
      setActiveWords([...downWords, ...acrossWords]);
    } else {
      setActiveWords(wordsAtCell);
      
      // If no words in current direction but we have words in the other direction,
      // switch direction
      if (activeDirection === 'across' && downWords.length > 0) {
        setActiveDirection('down');
      } else if (activeDirection === 'down' && acrossWords.length > 0) {
        setActiveDirection('across');
      }
    }
  }, [activeCell, activeDirection, words]);
  
  // Find the next cell in the current direction
  const findNextCell = useCallback((row: number, col: number, direction: 'across' | 'down') => {
    // First, try to find next cell in the current word
    if (activeWords.length > 0) {
      const activeWord = activeWords.find(w => w.direction === direction);
      if (activeWord) {
        const { x, y } = activeWord.position;
        const index = direction === 'across' ? col - x : row - y;
        
        if (index < activeWord.answer.length - 1) {
          // Move to next cell in current word
          if (direction === 'across') {
            return { row, col: col + 1 };
          } else {
            return { row: row + 1, col };
          }
        }
      }
    }
    
    // If we're at the end of the word or no active word, find next word cell
    if (direction === 'across') {
      for (let c = col + 1; c < gridSize; c++) {
        if (!blackCells[row][c]) return { row, col: c };
      }
      // Wrap to next row
      for (let r = row + 1; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
          if (!blackCells[r][c]) return { row: r, col: c };
        }
      }
    } else {
      for (let r = row + 1; r < gridSize; r++) {
        if (!blackCells[r][col]) return { row: r, col };
      }
      // Wrap to next column
      for (let c = col + 1; c < gridSize; c++) {
        for (let r = 0; r < gridSize; r++) {
          if (!blackCells[r][c]) return { row: r, col: c };
        }
      }
    }
    
    // If no next cell, return the first available cell
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        if (!blackCells[r][c]) return { row: r, col: c };
      }
    }
    
    return null;
  }, [blackCells, gridSize, activeWords]);
  
  // Find the previous cell in the current direction
  const findPrevCell = useCallback((row: number, col: number, direction: 'across' | 'down') => {
    // First, try to find previous cell in the current word
    if (activeWords.length > 0) {
      const activeWord = activeWords.find(w => w.direction === direction);
      if (activeWord) {
        const { x, y } = activeWord.position;
        const index = direction === 'across' ? col - x : row - y;
        
        if (index > 0) {
          // Move to previous cell in current word
          if (direction === 'across') {
            return { row, col: col - 1 };
          } else {
            return { row: row - 1, col };
          }
        }
      }
    }
    
    // If we're at the start of the word or no active word, find previous word cell
    if (direction === 'across') {
      for (let c = col - 1; c >= 0; c--) {
        if (!blackCells[row][c]) return { row, col: c };
      }
      // Wrap to previous row
      for (let r = row - 1; r >= 0; r--) {
        for (let c = gridSize - 1; c >= 0; c--) {
          if (!blackCells[r][c]) return { row: r, col: c };
        }
      }
    } else {
      for (let r = row - 1; r >= 0; r--) {
        if (!blackCells[r][col]) return { row: r, col };
      }
      // Wrap to previous column
      for (let c = col - 1; c >= 0; c--) {
        for (let r = gridSize - 1; r >= 0; r--) {
          if (!blackCells[r][c]) return { row: r, col: c };
        }
      }
    }
    
    // If no previous cell, return the last available cell
    for (let r = gridSize - 1; r >= 0; r--) {
      for (let c = gridSize - 1; c >= 0; c--) {
        if (!blackCells[r][c]) return { row: r, col: c };
      }
    }
    
    return null;
  }, [blackCells, gridSize, activeWords]);
  
  // Calculate cell numbers
  const cellNumbers = (() => {
    const numbers: Record<string, number> = {};
    
    words.forEach(word => {
      const key = `${word.position.y}-${word.position.x}`;
      if (!numbers[key]) {
        numbers[key] = word.number;
      }
    });
    
    return numbers;
  })();
  
  // Handle cell value change
  const handleCellChange = (row: number, col: number, value: string) => {
    const newGrid = [...grid];
    newGrid[row][col] = value;
    setGrid(newGrid);
    
    // Restore any validation styling that might have been set
    setCellValidation({
      correct: new Set([...cellValidation.correct].filter(key => key !== `${row}-${col}`)),
      incorrect: new Set([...cellValidation.incorrect].filter(key => key !== `${row}-${col}`))
    });
    
    // Auto-advance to next cell if a value was entered
    if (value && activeCell) {
      const nextCell = findNextCell(row, col, activeDirection);
      if (nextCell) {
        setActiveCell(nextCell);
      }
    }
  };
  
  // Handle cell focus
  const handleCellFocus = (row: number, col: number) => {
    setActiveCell({ row, col });
    
    // Determine direction based on which words are available at this cell
    const acrossWord = words.find(word => 
      word.direction === 'across' && 
      row === word.position.y && 
      col >= word.position.x && 
      col < word.position.x + word.answer.length
    );
    
    const downWord = words.find(word => 
      word.direction === 'down' && 
      col === word.position.x && 
      row >= word.position.y && 
      row < word.position.y + word.answer.length
    );
    
    // If we have both directions, keep current direction if possible
    if (acrossWord && downWord) {
      // Keep current direction if valid
      if (activeDirection === 'across' && acrossWord) {
        // Keep across
      } else if (activeDirection === 'down' && downWord) {
        // Keep down
      } else {
        // Default to across if available, otherwise down
        setActiveDirection(acrossWord ? 'across' : 'down');
      }
    } else {
      // Set direction based on available word
      if (acrossWord) setActiveDirection('across');
      else if (downWord) setActiveDirection('down');
    }
  };
  
  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent, row: number, col: number) => {
    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        if (activeDirection === 'down') {
          setActiveDirection('across');
        } else {
          const rightCell = findNextCell(row, col, 'across');
          if (rightCell) {
            setActiveCell(rightCell);
          }
        }
        break;
      case 'ArrowLeft':
        e.preventDefault();
        if (activeDirection === 'down') {
          setActiveDirection('across');
        } else {
          const leftCell = findPrevCell(row, col, 'across');
          if (leftCell) {
            setActiveCell(leftCell);
          }
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (activeDirection === 'across') {
          setActiveDirection('down');
        } else {
          const downCell = findNextCell(row, col, 'down');
          if (downCell) {
            setActiveCell(downCell);
          }
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (activeDirection === 'across') {
          setActiveDirection('down');
        } else {
          const upCell = findPrevCell(row, col, 'down');
          if (upCell) {
            setActiveCell(upCell);
          }
        }
        break;
      case 'Tab':
        e.preventDefault();
        if (e.shiftKey) {
          const prevCell = findPrevCell(row, col, activeDirection);
          if (prevCell) {
            setActiveCell(prevCell);
          }
        } else {
          const nextCell = findNextCell(row, col, activeDirection);
          if (nextCell) {
            setActiveCell(nextCell);
          }
        }
        break;
      case 'Backspace':
        if (grid[row][col] === '') {
          e.preventDefault();
          const prevCell = findPrevCell(row, col, activeDirection);
          if (prevCell) {
            setActiveCell(prevCell);
            const newGrid = [...grid];
            newGrid[prevCell.row][prevCell.col] = '';
            setGrid(newGrid);
          }
        }
        break;
      case 'Space':
        e.preventDefault();
        setActiveDirection(activeDirection === 'across' ? 'down' : 'across');
        break;
    }
  };
  
  // Validate the entire grid
  const validateGrid = () => {
    const correct = new Set<string>();
    const incorrect = new Set<string>();
    let allCorrect = true;
    
    words.forEach(word => {
      const { x, y } = word.position;
      const length = word.answer.length;
      
      for (let i = 0; i < length; i++) {
        const expectedChar = word.answer[i].toUpperCase();
        let currentRow = y;
        let currentCol = x;
        
        if (word.direction === 'across') {
          currentCol = x + i;
        } else {
          currentRow = y + i;
        }
        
        const currentChar = grid[currentRow][currentCol].toUpperCase();
        const cellKey = `${currentRow}-${currentCol}`;
        
        if (currentChar === expectedChar) {
          correct.add(cellKey);
          incorrect.delete(cellKey); // Ensure it's not in incorrect
        } else if (currentChar !== '') {
          incorrect.add(cellKey);
          correct.delete(cellKey); // Ensure it's not in correct
          allCorrect = false;
        } else {
          // Empty cell
          allCorrect = false;
        }
      }
    });
    
    setCellValidation({ correct, incorrect });
    
    if (allCorrect) {
      setCompleted(true);
      onSolve(true, timeElapsed);
    } else {
      onSolve(false);
    }
  };
  
  // Set initial active cell
  useEffect(() => {
    if (words.length > 0 && !activeCell) {
      const firstWord = words[0];
      setActiveCell({ row: firstWord.position.y, col: firstWord.position.x });
      setActiveDirection(firstWord.direction);
    }
  }, [words, activeCell]);
  
  // Add this useEffect to detect mobile devices
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileDevice(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Add these handlers for the mobile keyboard
  const handleKeyPress = (key: string) => {
    if (activeCell) {
      const { row, col } = activeCell;
      handleCellChange(row, col, key);
    }
  };
  
  const handleArrowPress = (direction: 'up' | 'down' | 'left' | 'right') => {
    if (!activeCell) return;
    
    const { row, col } = activeCell;
    let newRow = row;
    let newCol = col;
    
    switch (direction) {
      case 'up':
        newRow = Math.max(0, row - 1);
        break;
      case 'down':
        newRow = Math.min(gridSize - 1, row + 1);
        break;
      case 'left':
        newCol = Math.max(0, col - 1);
        break;
      case 'right':
        newCol = Math.min(gridSize - 1, col + 1);
        break;
    }
    
    // Skip black cells
    if (!blackCells[newRow][newCol]) {
      setActiveCell({ row: newRow, col: newCol });
    }
  };
  
  const handleDelete = () => {
    if (activeCell) {
      const { row, col } = activeCell;
      handleCellChange(row, col, '');
      
      // Move to previous cell if in across mode
      if (activeDirection === 'across' && col > 0) {
        const prevCol = col - 1;
        if (!blackCells[row][prevCol]) {
          setActiveCell({ row, col: prevCol });
        }
      }
      // Move to previous cell if in down mode
      else if (activeDirection === 'down' && row > 0) {
        const prevRow = row - 1;
        if (!blackCells[prevRow][col]) {
          setActiveCell({ row: prevRow, col });
        }
      }
    }
  };
  
  // Render the grid
  return (
    <div className="flex flex-col items-center space-y-6 w-full">
      <div className="flex items-center justify-between w-full max-w-xl mb-4">
        <div className="flex items-center bg-secondary/10 py-2 px-4 rounded-full">
          <Clock className="mr-2 text-muted-foreground" size={18} />
          <span className="text-lg font-medium">{formatTime(timeElapsed)}</span>
        </div>
        
        {isMobileDevice && (
          <Button
            variant="outline"
            size="sm"
            className="ml-auto"
            onClick={() => setShowMobileKeyboard(!showMobileKeyboard)}
          >
            <Keyboard className="mr-2" size={16} />
            {showMobileKeyboard ? 'Hide' : 'Show'} Keyboard
          </Button>
        )}
      </div>
      
      <div className="grid-container w-full overflow-x-auto pb-4">
        <div 
          className="crossword-grid mx-auto"
          style={{ 
            display: 'grid',
            gridTemplateRows: `repeat(${gridSize}, minmax(0, 1fr))`,
            gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
            gap: '1px',
            padding: '8px',
            maxWidth: '100%',
            width: 'fit-content',
            boxShadow: 'var(--shadow-soft)',
            borderRadius: 'var(--border-radius-md)',
            background: 'white'
          }}
        >
          {grid.map((row, rowIndex) => (
            row.map((cell, colIndex) => {
              const isBlack = blackCells[rowIndex][colIndex];
              if (isBlack) {
                return (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className="crossword-cell bg-black"
                    style={{ aspectRatio: '1/1' }}
                  />
                );
              }
              
              const cellKey = `${rowIndex}-${colIndex}`;
              const isActive = activeCell?.row === rowIndex && activeCell?.col === colIndex;
              const number = cellNumbers[cellKey];
              const isCorrect = cellValidation.correct.has(cellKey);
              const isIncorrect = cellValidation.incorrect.has(cellKey);
              
              return (
                <CrosswordCell
                  key={cellKey}
                  row={rowIndex}
                  col={colIndex}
                  value={cell}
                  onChange={(value) => handleCellChange(rowIndex, colIndex, value)}
                  isActive={isActive}
                  isCorrect={isCorrect}
                  isIncorrect={isIncorrect}
                  number={number}
                  onFocus={() => handleCellFocus(rowIndex, colIndex)}
                  onKeyDown={(e) => handleKeyDown(e, rowIndex, colIndex)}
                  activeDirection={activeDirection}
                />
              );
            })
          ))}
        </div>
      </div>
      
      <div className="w-full max-w-md">
        <Button 
          onClick={validateGrid} 
          className="w-full flex items-center justify-center bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-all"
        >
          <Check className="mr-2" size={18} />
          Check Answers
        </Button>
      </div>
      
      <AnimatePresence>
        {showMobileKeyboard && (
          <MobileKeyboard 
            onKeyPress={handleKeyPress}
            onClose={() => setShowMobileKeyboard(false)}
            onArrowPress={handleArrowPress}
            onDelete={handleDelete}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default CrosswordGrid;
