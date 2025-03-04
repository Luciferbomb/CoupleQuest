
interface Answer {
  question: string;
  answer: string;
}

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

interface CrosswordPuzzle {
  words: Word[];
  gridSize: number;
}

// Helper function to clean answers (remove spaces, special chars, etc.)
const cleanAnswer = (answer: string): string => {
  return answer.toUpperCase().replace(/[^A-Z]/g, '');
};

// Determine if two words intersect
const wordsIntersect = (word1: Word, word2: Word): boolean => {
  // Only words in different directions can intersect
  if (word1.direction === word2.direction) return false;
  
  const word1Range = 
    word1.direction === 'across' 
      ? { 
          x: { start: word1.position.x, end: word1.position.x + word1.answer.length - 1 },
          y: { start: word1.position.y, end: word1.position.y }
        }
      : { 
          x: { start: word1.position.x, end: word1.position.x },
          y: { start: word1.position.y, end: word1.position.y + word1.answer.length - 1 }
        };
        
  const word2Range = 
    word2.direction === 'across' 
      ? { 
          x: { start: word2.position.x, end: word2.position.x + word2.answer.length - 1 },
          y: { start: word2.position.y, end: word2.position.y }
        }
      : { 
          x: { start: word2.position.x, end: word2.position.x },
          y: { start: word2.position.y, end: word2.position.y + word2.answer.length - 1 }
        };
  
  // Check if ranges overlap
  const xOverlap = !(word1Range.x.end < word2Range.x.start || word1Range.x.start > word2Range.x.end);
  const yOverlap = !(word1Range.y.end < word2Range.y.start || word1Range.y.start > word2Range.y.end);
  
  return xOverlap && yOverlap;
};

// Find all possible intersections between words
const findIntersections = (word1: string, word2: string): { index1: number; index2: number }[] => {
  const intersections: { index1: number; index2: number }[] = [];
  
  for (let i = 0; i < word1.length; i++) {
    for (let j = 0; j < word2.length; j++) {
      if (word1[i] === word2[j]) {
        intersections.push({ index1: i, index2: j });
      }
    }
  }
  
  return intersections;
};

// Check if a word placement is valid
const isValidPlacement = (word: Word, placedWords: Word[], gridSize: number): boolean => {
  // Check if word extends beyond grid bounds
  if (word.direction === 'across') {
    if (word.position.x < 0 || word.position.x + word.answer.length > gridSize || word.position.y < 0 || word.position.y >= gridSize) {
      return false;
    }
  } else {
    if (word.position.y < 0 || word.position.y + word.answer.length > gridSize || word.position.x < 0 || word.position.x >= gridSize) {
      return false;
    }
  }
  
  // Check for overlaps/conflicts with already placed words
  for (const placedWord of placedWords) {
    if (wordsIntersect(word, placedWord)) {
      // Check if the intersection character matches
      const intersection = 
        word.direction === 'across' 
          ? { 
              wordIndex: word.position.x - (placedWord.position.x - placedWord.position.y + word.position.y),
              placedWordIndex: placedWord.position.y - placedWord.position.y + word.position.y
            }
          : { 
              wordIndex: word.position.y - (placedWord.position.y - placedWord.position.x + word.position.x),
              placedWordIndex: placedWord.position.x - placedWord.position.x + word.position.x
            };
      
      if (word.answer[intersection.wordIndex] !== placedWord.answer[intersection.placedWordIndex]) {
        return false;
      }
    } else {
      // Check if the word occupies any cell that's already occupied by another word
      const wordCells = new Set<string>();
      if (word.direction === 'across') {
        for (let i = 0; i < word.answer.length; i++) {
          wordCells.add(`${word.position.y}-${word.position.x + i}`);
        }
      } else {
        for (let i = 0; i < word.answer.length; i++) {
          wordCells.add(`${word.position.y + i}-${word.position.x}`);
        }
      }
      
      const placedWordCells = new Set<string>();
      if (placedWord.direction === 'across') {
        for (let i = 0; i < placedWord.answer.length; i++) {
          placedWordCells.add(`${placedWord.position.y}-${placedWord.position.x + i}`);
        }
      } else {
        for (let i = 0; i < placedWord.answer.length; i++) {
          placedWordCells.add(`${placedWord.position.y + i}-${placedWord.position.x}`);
        }
      }
      
      // Check if there's any cell that both words occupy
      for (const cell of wordCells) {
        if (placedWordCells.has(cell)) {
          return false;
        }
      }
    }
  }
  
  return true;
};

// Generate crossword puzzle from a list of answers
export const generateCrosswordPuzzle = (answers: Answer[]): CrosswordPuzzle => {
  const cleanedAnswers = answers.map(a => ({
    ...a,
    answer: cleanAnswer(a.answer)
  })).filter(a => a.answer.length > 2); // Filter out answers that are too short
  
  const words: Word[] = [];
  let wordNumber = 1;
  const gridSize = 15; // Fixed grid size
  
  // Start with the longest answer
  cleanedAnswers.sort((a, b) => b.answer.length - a.answer.length);
  
  // Place first word horizontally in the middle
  const firstWord: Word = {
    answer: cleanedAnswers[0].answer,
    clue: cleanedAnswers[0].question,
    position: {
      x: Math.floor((gridSize - cleanedAnswers[0].answer.length) / 2),
      y: Math.floor(gridSize / 2)
    },
    direction: 'across',
    number: wordNumber++
  };
  
  words.push(firstWord);
  
  // Try to place remaining words
  for (let i = 1; i < cleanedAnswers.length; i++) {
    const currentAnswer = cleanedAnswers[i];
    let placed = false;
    
    // Try to connect to each existing word
    for (const placedWord of words) {
      // Only try to connect words in the opposite direction
      const direction = placedWord.direction === 'across' ? 'down' : 'across';
      
      // Find possible intersections
      const intersections = findIntersections(placedWord.answer, currentAnswer.answer);
      
      // Shuffle intersections to get different layouts each time
      intersections.sort(() => Math.random() - 0.5);
      
      for (const intersection of intersections) {
        let newWord: Word;
        
        if (direction === 'across') {
          newWord = {
            answer: currentAnswer.answer,
            clue: currentAnswer.question,
            position: {
              x: placedWord.position.x - intersection.index1,
              y: placedWord.position.y + intersection.index2
            },
            direction,
            number: wordNumber
          };
        } else {
          newWord = {
            answer: currentAnswer.answer,
            clue: currentAnswer.question,
            position: {
              x: placedWord.position.x + intersection.index2,
              y: placedWord.position.y - intersection.index1
            },
            direction,
            number: wordNumber
          };
        }
        
        if (isValidPlacement(newWord, words, gridSize)) {
          words.push(newWord);
          wordNumber++;
          placed = true;
          break;
        }
      }
      
      if (placed) break;
    }
    
    // If we couldn't place the word, try again with a random orientation
    if (!placed) {
      const direction = Math.random() > 0.5 ? 'across' : 'down';
      
      // Try a few random positions
      for (let attempt = 0; attempt < 50; attempt++) {
        const x = Math.floor(Math.random() * gridSize);
        const y = Math.floor(Math.random() * gridSize);
        
        const newWord: Word = {
          answer: currentAnswer.answer,
          clue: currentAnswer.question,
          position: { x, y },
          direction,
          number: wordNumber
        };
        
        if (isValidPlacement(newWord, words, gridSize)) {
          words.push(newWord);
          wordNumber++;
          placed = true;
          break;
        }
      }
    }
  }
  
  // Renumber words based on their position
  const cellNumbers: Record<string, number> = {};
  let newNumber = 1;
  
  // Sort words by position (top-to-bottom, left-to-right)
  const sortedWords = [...words].sort((a, b) => {
    if (a.position.y === b.position.y) {
      return a.position.x - b.position.x;
    }
    return a.position.y - b.position.y;
  });
  
  // Assign new numbers
  sortedWords.forEach(word => {
    const key = `${word.position.y}-${word.position.x}`;
    if (!cellNumbers[key]) {
      cellNumbers[key] = newNumber++;
    }
    word.number = cellNumbers[key];
  });
  
  return {
    words: sortedWords,
    gridSize
  };
};

// Generate a unique slug for sharing
export const generatePuzzleSlug = (): string => {
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};
