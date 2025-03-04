
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
  // Clean and filter answers
  const cleanedAnswers = answers
    .map(a => ({
      ...a,
      answer: cleanAnswer(a.answer)
    }))
    .filter(a => a.answer.length > 2); // Filter out answers that are too short
  
  if (cleanedAnswers.length === 0) {
    throw new Error("No valid answers to create a puzzle");
  }
  
  // Sort answers by length (longest first)
  cleanedAnswers.sort((a, b) => b.answer.length - a.answer.length);
  
  const words: Word[] = [];
  let wordNumber = 1;
  const gridSize = Math.min(30, Math.max(15, Math.ceil(cleanedAnswers.length * 2))); // Dynamic grid size
  
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
  
  // Try to place second word vertically to ensure we have words in both directions
  if (cleanedAnswers.length > 1) {
    const secondAnswer = cleanedAnswers[1];
    let secondWordPlaced = false;
    
    // Find intersections between first and second words
    const intersections = findIntersections(firstWord.answer, secondAnswer.answer);
    
    // Try each intersection point
    for (const intersection of intersections) {
      const secondWord: Word = {
        answer: secondAnswer.answer,
        clue: secondAnswer.question,
        position: {
          x: firstWord.position.x + intersection.index1,
          y: firstWord.position.y - intersection.index2
        },
        direction: 'down',
        number: wordNumber
      };
      
      if (isValidPlacement(secondWord, words, gridSize)) {
        words.push(secondWord);
        wordNumber++;
        secondWordPlaced = true;
        break;
      }
    }
    
    // If we couldn't place the second word, try a few more spots
    if (!secondWordPlaced) {
      // Try middle position of first word
      const midPoint = Math.floor(firstWord.answer.length / 2);
      for (let i = 0; i < secondAnswer.answer.length; i++) {
        const secondWord: Word = {
          answer: secondAnswer.answer,
          clue: secondAnswer.question,
          position: {
            x: firstWord.position.x + midPoint,
            y: firstWord.position.y - i
          },
          direction: 'down',
          number: wordNumber
        };
        
        if (isValidPlacement(secondWord, words, gridSize)) {
          words.push(secondWord);
          wordNumber++;
          secondWordPlaced = true;
          break;
        }
      }
    }
  }
  
  // Make a few placement attempts for each remaining word
  const MAX_ATTEMPTS = 50;
  const REQUIRED_INTERSECTIONS = Math.min(2, Math.ceil(cleanedAnswers.length / 3));
  
  // Track how many across/down words we have
  let acrossCount = words.filter(w => w.direction === 'across').length;
  let downCount = words.filter(w => w.direction === 'down').length;
  
  // Try to place remaining words with multiple intersection attempts
  for (let i = words.length < 2 ? 1 : 2; i < cleanedAnswers.length; i++) {
    const currentAnswer = cleanedAnswers[i];
    let placed = false;
    
    // Prefer placing words in the direction that has fewer words
    const preferredDirection = acrossCount < downCount ? 'across' : 'down';
    
    // Try to connect to existing words with intersections
    for (let attempt = 0; attempt < MAX_ATTEMPTS && !placed; attempt++) {
      // Try alternating directions with a preference for the one with fewer words
      const direction = attempt % 2 === 0 ? preferredDirection 
        : (preferredDirection === 'across' ? 'down' : 'across');
      
      // Find a random placed word to try connecting to
      // But prioritize words with fewer connections
      const placedWordsByConnections = [...words].sort((a, b) => {
        const aConnections = words.filter(w => getWordIntersection(a, w).intersects).length;
        const bConnections = words.filter(w => getWordIntersection(b, w).intersects).length;
        return aConnections - bConnections;
      });
      
      // Try each placed word, prioritizing those with fewer connections
      for (const placedWord of placedWordsByConnections) {
        // Skip if trying to connect to a word in the same direction
        if (placedWord.direction === direction) continue;
        
        // Count existing connections for this word
        const connectionCount = words.filter(w => 
          getWordIntersection(placedWord, w).intersects
        ).length;
        
        // Skip if this word already has too many connections (to avoid crowding)
        if (connectionCount > REQUIRED_INTERSECTIONS) continue;
        
        // Find possible intersections
        const intersections = findIntersections(placedWord.answer, currentAnswer.answer);
        
        // Shuffle intersections to increase variety
        const shuffledIntersections = [...intersections].sort(() => Math.random() - 0.5);
        
        for (const intersection of shuffledIntersections) {
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
            
            // Update across/down count
            if (direction === 'across') acrossCount++;
            else downCount++;
            
            break;
          }
        }
        
        if (placed) break;
      }
    }
    
    // If all intersection attempts failed, try placing the word independently
    if (!placed) {
      // For better connectivity, still try to place near existing words
      for (let attempt = 0; attempt < 20; attempt++) {
        // Alternate direction but prefer the one with fewer words
        const direction = attempt % 2 === 0 ? preferredDirection 
          : (preferredDirection === 'across' ? 'down' : 'across');
        
        // Find a random position in the grid
        let x, y;
        if (direction === 'across') {
          x = Math.floor(Math.random() * (gridSize - currentAnswer.answer.length));
          y = Math.floor(Math.random() * gridSize);
        } else {
          x = Math.floor(Math.random() * gridSize);
          y = Math.floor(Math.random() * (gridSize - currentAnswer.answer.length));
        }
        
        // Place near existing words
        const nearX = Math.max(0, Math.min(gridSize - 1, x + Math.floor(Math.random() * 5) - 2));
        const nearY = Math.max(0, Math.min(gridSize - 1, y + Math.floor(Math.random() * 5) - 2));
        
        const newWord: Word = {
          answer: currentAnswer.answer,
          clue: currentAnswer.question,
          position: { 
            x: direction === 'across' ? nearX : x, 
            y: direction === 'down' ? nearY : y 
          },
          direction,
          number: wordNumber
        };
        
        if (isValidPlacement(newWord, words, gridSize)) {
          words.push(newWord);
          wordNumber++;
          
          // Update across/down count
          if (direction === 'across') acrossCount++;
          else downCount++;
          
          placed = true;
          break;
        }
      }
    }
    
    // If we still couldn't place the word, skip it for now
    if (!placed) {
      console.log(`Couldn't place word: ${currentAnswer.answer}`);
    }
  }
  
  // Ensure there are words in both directions
  if (acrossCount === 0 || downCount === 0) {
    // If we have no words in one direction, place at least one
    const missingDirection = acrossCount === 0 ? 'across' : 'down';
    
    for (let i = 0; i < cleanedAnswers.length && (acrossCount === 0 || downCount === 0); i++) {
      // Skip words we've already placed
      if (words.some(w => w.clue === cleanedAnswers[i].question)) continue;
      
      const answer = cleanedAnswers[i];
      
      // Place in the center of the grid
      const centerX = Math.floor(gridSize / 2) - (missingDirection === 'across' ? Math.floor(answer.answer.length / 2) : 0);
      const centerY = Math.floor(gridSize / 2) - (missingDirection === 'down' ? Math.floor(answer.answer.length / 2) : 0);
      
      const newWord: Word = {
        answer: answer.answer,
        clue: answer.question,
        position: { x: centerX, y: centerY },
        direction: missingDirection,
        number: wordNumber
      };
      
      if (isValidPlacement(newWord, words, gridSize)) {
        words.push(newWord);
        wordNumber++;
        
        if (missingDirection === 'across') acrossCount++;
        else downCount++;
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
  
  // Validate the final puzzle
  if (words.length < Math.min(3, cleanedAnswers.length)) {
    throw new Error("Failed to create a valid crossword puzzle with enough connected words");
  }
  
  if (acrossCount === 0 || downCount === 0) {
    throw new Error("Failed to create a valid crossword puzzle with words in both directions");
  }
  
  // Count intersections to ensure puzzle is connected
  let totalIntersections = 0;
  for (let i = 0; i < words.length; i++) {
    for (let j = i + 1; j < words.length; j++) {
      if (getWordIntersection(words[i], words[j]).intersects) {
        totalIntersections++;
      }
    }
  }
  
  if (totalIntersections < Math.min(words.length - 1, 2)) {
    throw new Error("Failed to create a sufficiently connected crossword puzzle");
  }
  
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
