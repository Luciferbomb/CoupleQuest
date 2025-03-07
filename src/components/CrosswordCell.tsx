import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface CrosswordCellProps {
  row: number;
  col: number;
  value: string;
  onChange: (value: string) => void;
  isActive: boolean;
  isCorrect?: boolean;
  isIncorrect?: boolean;
  number?: number;
  isBlack?: boolean;
  onFocus: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  activeDirection: 'across' | 'down';
}

const CrosswordCell: React.FC<CrosswordCellProps> = ({
  value,
  onChange,
  isActive,
  isCorrect,
  isIncorrect,
  number,
  isBlack,
  onFocus,
  onKeyDown,
  activeDirection
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isActive && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isActive]);

  // Detect if we're on a mobile device
  const isMobile = typeof window !== 'undefined' && 
    (window.innerWidth < 768 || 'ontouchstart' in window);

  if (isBlack) {
    return (
      <div className="bg-black w-full h-full rounded-sm" style={{ aspectRatio: '1/1' }} />
    );
  }

  // Determine cell status for styling
  const getCellStatus = () => {
    if (isCorrect) return 'correct';
    if (isIncorrect) return 'incorrect';
    if (isActive) return 'active';
    return 'default';
  };

  const cellStatus = getCellStatus();

  // Animation variants for different cell states
  const cellVariants = {
    default: { scale: 1 },
    active: { scale: 1.05, transition: { type: 'spring', stiffness: 400, damping: 15 } },
    correct: { 
      scale: 1,
      backgroundColor: 'var(--color-primary-light)',
      transition: { duration: 0.3 }
    },
    incorrect: { 
      scale: 1,
      backgroundColor: 'rgba(255, 107, 107, 0.2)',
      transition: { duration: 0.3 }
    }
  };

  // For mobile, we'll use a div instead of an input to prevent keyboard popup
  const handleCellClick = () => {
    onFocus();
    // On mobile, we don't want to focus the input directly
    // as it will bring up the keyboard
    if (!isMobile && inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <motion.div
      className={`
        relative
        flex items-center justify-center
        w-full h-full
        text-center select-none
        border rounded-sm
        bg-white
        no-select
        ${isActive ? 'border-primary' : 'border-gray-200'}
        ${isCorrect ? 'border-green-400' : ''}
        ${isIncorrect ? 'border-red-400' : ''}
        ${isActive && activeDirection === 'across' ? 'after:absolute after:h-[2px] after:bg-primary/40 after:left-0 after:right-0 after:top-1/2 after:-translate-y-1/2 after:z-[-1]' : ''}
        ${isActive && activeDirection === 'down' ? 'after:absolute after:w-[2px] after:bg-primary/40 after:top-0 after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:z-[-1]' : ''}
      `}
      variants={cellVariants}
      initial="default"
      animate={cellStatus}
      onClick={handleCellClick}
      style={{ aspectRatio: '1/1' }}
    >
      {number && (
        <span className="absolute top-0.5 left-1 text-[10px] font-medium text-gray-600">
          {number}
        </span>
      )}
      {isMobile ? (
        <div className="w-full h-full flex items-center justify-center font-semibold uppercase text-lg">
          {value}
        </div>
      ) : (
        <input
          ref={inputRef}
          type="text"
          maxLength={1}
          value={value || ''}
          onChange={(e) => {
            const newValue = e.target.value.toUpperCase();
            if (newValue.match(/^[A-Z]?$/)) {
              onChange(newValue);
            }
          }}
          onFocus={onFocus}
          onKeyDown={onKeyDown}
          className={`
            w-full h-full
            text-center font-semibold
            bg-transparent
            focus:outline-none
            uppercase
            ${isCorrect ? 'text-green-600' : ''}
            ${isIncorrect ? 'text-red-600' : ''}
            ${isActive ? 'text-primary' : 'text-gray-800'}
            touch-manipulation
          `}
          aria-label={`Crossword cell ${number ? `number ${number}` : ''}`}
          data-direction={activeDirection}
          inputMode="text"
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
        />
      )}
    </motion.div>
  );
};

export default CrosswordCell;
