
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
  onKeyDown
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
    ${isActive ? 'crossword-cell-active' : ''}
    ${isCorrect ? 'crossword-cell-correct' : ''}
    ${isIncorrect ? 'crossword-cell-incorrect' : ''}
  `;

  return (
    <div className={cellClassName} onClick={onFocus}>
      {number && <span className="crossword-cell-number">{number}</span>}
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
        className="crossword-cell-input"
        aria-label={`Crossword cell ${number ? `number ${number}` : ''}`}
      />
    </div>
  );
};

export default CrosswordCell;
