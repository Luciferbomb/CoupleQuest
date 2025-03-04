
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
    return <div className="crossword-cell bg-black" />;
  }

  const cellClassName = `
    crossword-cell relative
    border border-border
    w-10 h-10
    flex items-center justify-center
    select-none text-center 
    transition-all duration-200
    ${isActive ? 'border-primary bg-primary/10 shadow-sm z-10' : ''}
    ${isCorrect ? 'bg-green-100 border-green-400' : ''}
    ${isIncorrect ? 'bg-red-100 border-red-300' : ''}
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
        <span className="absolute top-0.5 left-1 text-xs font-medium text-muted-foreground">
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
