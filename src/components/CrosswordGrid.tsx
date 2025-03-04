import { useState, useEffect, useCallback, useRef } from 'react';
import CrosswordCell from './CrosswordCell';
import { Button } from '@/components/ui/button';
import { Check, Clock } from 'lucide-react';
import { formatTime } from '@/utils/timeUtils';

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
  
  // Find the next cell in the current direction
  const findNextCell = useCallback((row: number, col: number, direction: 'across' | 'down') => {
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
  }, [blackCells, gridSize]);
  
  // Find the previous cell in the current direction
  const findPrevCell = useCallback((row: number, col: number, direction: 'across' | 'down') => {
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
  }, [blackCells, gridSize]);
  
  // Calculate cell numbers
  const cellNumbers = (() => {
    const numbers: Record<string, number> = {};
    let currentNumber = 1;
    
    words.forEach(word => {
      const key = `${word.position.y}-${word.position.x}`;
      if (!numbers[key]) {
        numbers[key] = currentNumber++;
      }
    });
    
    return numbers;
  })();
  
  // Handle cell value change
  const handleCellChange = (row: number, col: number, value: string) => {
    const newGrid = [...grid];
    newGrid[row][col] = value;
    setGrid(newGrid);
    
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
  };
  
  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent, row: number, col: number) => {
    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        const rightCell = findNextCell(row, col, 'across');
        if (rightCell) {
          setActiveCell(rightCell);
          setActiveDirection('across');
        }
        break;
      case 'ArrowLeft':
        e.preventDefault();
        const leftCell = findPrevCell(row, col, 'across');
        if (leftCell) {
          setActiveCell(leftCell);
          setActiveDirection('across');
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        const downCell = findNextCell(row, col, 'down');
        if (downCell) {
          setActiveCell(downCell);
          setActiveDirection('down');
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        const upCell = findPrevCell(row, col, 'down');
        if (upCell) {
          setActiveCell(upCell);
          setActiveDirection('down');
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
        } else {
          incorrect.add(cellKey);
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
  
  // Render the grid
  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="flex items-center justify-between w-full max-w-xl mb-4">
        <div className="flex items-center bg-muted/50 py-2 px-4 rounded-full">
          <Clock className="mr-2 text-muted-foreground" size={18} />
          <span className="text-lg">{formatTime(timeElapsed)}</span>
        </div>
      </div>
      
      <div 
        className="crossword-grid shadow-lg bg-white rounded-lg overflow-hidden"
        style={{ 
          display: 'grid',
          gridTemplateRows: `repeat(${gridSize}, minmax(0, 1fr))`,
          gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
          gap: '1px',
          padding: '8px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          maxWidth: '100%',
          width: 'fit-content'
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
                  style={{ minWidth: '2.5rem', minHeight: '2.5rem' }}
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
              />
            );
          })
        ))}
      </div>
      
      <div className="w-full max-w-md">
        <Button onClick={validateGrid} className="w-full flex items-center justify-center">
          <Check className="mr-2" size={18} />
          Check Answers
        </Button>
      </div>
    </div>
  );
};

export default CrosswordGrid;
