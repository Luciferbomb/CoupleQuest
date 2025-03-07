
import React, { useEffect, useRef } from 'react';

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

  if (isBlack) {
    return null; // Return null instead of a black cell to reduce black space
  }

  const cellClassName = `
    relative
    flex items-center justify-center
    w-9 h-9 sm:w-10 sm:h-10
    text-center select-none
    border transition-all duration-200
    ${isActive ? 'shadow-[0_0_0_2px] shadow-primary z-10' : 'border-warmgray-300 bg-white'}
    ${isCorrect ? 'bg-green-50 border-green-300' : ''}
    ${isIncorrect ? 'bg-red-50 border-red-300' : ''}
    ${isActive && !isCorrect && !isIncorrect ? 'bg-beige-50' : ''}
    ${activeDirection === 'across' && isActive ? 'after:absolute after:h-[2px] after:bg-primary/40 after:left-0 after:right-0 after:top-1/2 after:-translate-y-1/2 after:z-[-1]' : ''}
    ${activeDirection === 'down' && isActive ? 'after:absolute after:w-[2px] after:bg-primary/40 after:top-0 after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:z-[-1]' : ''}
  `;

  const inputClassName = `
    w-full h-full
    text-center font-semibold
    bg-transparent
    focus:outline-none
    uppercase
    ${isCorrect ? 'text-green-700' : ''}
    ${isIncorrect ? 'text-red-700' : ''}
  `;

  return (
    <div className={cellClassName} onClick={onFocus}>
      {number && (
        <span className="absolute top-0.5 left-1 text-[10px] font-medium text-warmgray-600">
          {number}
        </span>
      )}
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
        className={inputClassName}
        aria-label={`Crossword cell ${number ? `number ${number}` : ''}`}
        data-direction={activeDirection}
      />
    </div>
  );
};

export default CrosswordCell;
