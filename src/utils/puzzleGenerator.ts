
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

// Determine if two words intersect and get the intersection point
const getWordIntersection = (word1: Word, word2: Word): { intersects: boolean; x?: number; y?: number } => {
  // Only words in different directions can intersect
  if (word1.direction === word2.direction) return { intersects: false };
  
  const word1Positions = new Set<string>();
  
  // Get all positions that word1 covers
  if (word1.direction === 'across') {
    for (let i = 0; i < word1.answer.length; i++) {
      word1Positions.add(`${word1.position.y}-${word1.position.x + i}`);
    }
  } else {
    for (let i = 0; i < word1.answer.length; i++) {
      word1Positions.add(`${word1.position.y + i}-${word1.position.x}`);
    }
  }
  
  // Check if word2 crosses any position of word1
  if (word2.direction === 'across') {
    for (let i = 0; i < word2.answer.length; i++) {
      const pos = `${word2.position.y}-${word2.position.x + i}`;
      if (word1Positions.has(pos)) {
        return { 
          intersects: true, 
          x: word2.position.x + i,
          y: word2.position.y
        };
      }
    }
  } else {
    for (let i = 0; i < word2.answer.length; i++) {
      const pos = `${word2.position.y + i}-${word2.position.x}`;
      if (word1Positions.has(pos)) {
        return { 
          intersects: true, 
          x: word2.position.x,
          y: word2.position.y + i
        };
      }
    }
  }
  
  return { intersects: false };
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
  
  // Sort intersections by a priority score that favors middle intersections
  // and avoids edges of words where possible
  return intersections.sort((a, b) => {
    const scoreA = Math.min(
      Math.min(a.index1, word1.length - a.index1 - 1),
      Math.min(a.index2, word2.length - a.index2 - 1)
    );
    const scoreB = Math.min(
      Math.min(b.index1, word1.length - b.index1 - 1),
      Math.min(b.index2, word2.length - b.index2 - 1)
    );
    return scoreB - scoreA; // Higher score first (middle intersections)
  });
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
  
  // For better readability, ensure there's at least one cell spacing around words
  // unless they're properly intersecting
  const wordCells = new Set<string>();
  const adjacentCells = new Set<string>();
  
  if (word.direction === 'across') {
    // Word cells
    for (let i = 0; i < word.answer.length; i++) {
      wordCells.add(`${word.position.y}-${word.position.x + i}`);
      
      // Adjacent cells (above and below)
      if (word.position.y > 0) adjacentCells.add(`${word.position.y - 1}-${word.position.x + i}`);
      if (word.position.y < gridSize - 1) adjacentCells.add(`${word.position.y + 1}-${word.position.x + i}`);
    }
    
    // Adjacent cells (left and right)
    if (word.position.x > 0) adjacentCells.add(`${word.position.y}-${word.position.x - 1}`);
    if (word.position.x + word.answer.length < gridSize) {
      adjacentCells.add(`${word.position.y}-${word.position.x + word.answer.length}`);
    }
  } else {
    // Word cells
    for (let i = 0; i < word.answer.length; i++) {
      wordCells.add(`${word.position.y + i}-${word.position.x}`);
      
      // Adjacent cells (left and right)
      if (word.position.x > 0) adjacentCells.add(`${word.position.y + i}-${word.position.x - 1}`);
      if (word.position.x < gridSize - 1) adjacentCells.add(`${word.position.y + i}-${word.position.x + 1}`);
    }
    
    // Adjacent cells (above and below)
    if (word.position.y > 0) adjacentCells.add(`${word.position.y - 1}-${word.position.x}`);
    if (word.position.y + word.answer.length < gridSize) {
      adjacentCells.add(`${word.position.y + word.answer.length}-${word.position.x}`);
    }
  }
  
  for (const placedWord of placedWords) {
    const intersection = getWordIntersection(word, placedWord);
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
    
    // Check for invalid overlaps
    for (const cell of wordCells) {
      if (placedWordCells.has(cell)) {
        if (!intersection.intersects || 
            cell !== `${intersection.y}-${intersection.x}`) {
          return false; // Overlapping cells that are not at intersection
        }
        
        // Check if the intersection character matches
        const [yStr, xStr] = cell.split('-');
        const y = parseInt(yStr);
        const x = parseInt(xStr);
        
        let wordChar = '';
        let placedWordChar = '';
        
        if (word.direction === 'across') {
          wordChar = word.answer[x - word.position.x];
          placedWordChar = placedWord.answer[y - placedWord.position.y];
        } else {
          wordChar = word.answer[y - word.position.y];
          placedWordChar = placedWord.answer[x - placedWord.position.x];
        }
        
        if (wordChar !== placedWordChar) {
          return false; // Characters at intersection don't match
        }
      }
    }
    
    // Check for adjacent word cells (only allow at intersections)
    if (intersection.intersects) {
      // Allow adjacency only at intersection point and its immediate surroundings
      const allowedAdjacencies = new Set<string>();
      
      if (word.direction === 'across') {
        // For across word, allow adjacency at intersection column
        for (let y = 0; y < gridSize; y++) {
          allowedAdjacencies.add(`${y}-${intersection.x}`);
        }
      } else {
        // For down word, allow adjacency at intersection row
        for (let x = 0; x < gridSize; x++) {
          allowedAdjacencies.add(`${intersection.y}-${x}`);
        }
      }
      
      for (const cell of adjacentCells) {
        if (placedWordCells.has(cell) && !allowedAdjacencies.has(cell)) {
          return false; // Adjacent cells that shouldn't be adjacent
        }
      }
    } else {
      // If no intersection, don't allow any adjacency
      for (const cell of adjacentCells) {
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
  const gridSize = 20; // Increased grid size for better spacing
  
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
    
    // Shuffle existing words to get different layouts
    const shuffledWords = [...words].sort(() => Math.random() - 0.5);
    
    // Try to connect to each existing word with a stronger preference for
    // words that have fewer connections already
    for (const placedWord of shuffledWords) {
      // Count how many words already intersect with this word
      const intersectionCount = words.filter(w => 
        getWordIntersection(placedWord, w).intersects
      ).length;
      
      // Skip words with too many intersections to avoid crowding
      if (intersectionCount >= 3) continue;
      
      // Only try to connect words in the opposite direction
      const direction = placedWord.direction === 'across' ? 'down' : 'across';
      
      // Find possible intersections
      const intersections = findIntersections(placedWord.answer, currentAnswer.answer);
      
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
    
    // If we couldn't place the word, try again without intersection
    if (!placed) {
      for (let attempt = 0; attempt < 50; attempt++) {
        const direction = Math.random() > 0.5 ? 'across' : 'down';
        const x = Math.floor(Math.random() * (gridSize - currentAnswer.answer.length));
        const y = Math.floor(Math.random() * (gridSize - currentAnswer.answer.length));
        
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
