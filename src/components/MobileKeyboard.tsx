import React from 'react';
import { motion } from 'framer-motion';
import { X, ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Delete } from 'lucide-react';

interface MobileKeyboardProps {
  onKeyPress: (key: string) => void;
  onClose: () => void;
  onArrowPress: (direction: 'up' | 'down' | 'left' | 'right') => void;
  onDelete: () => void;
}

const MobileKeyboard: React.FC<MobileKeyboardProps> = ({ 
  onKeyPress, 
  onClose,
  onArrowPress,
  onDelete
}) => {
  const keys = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
  ];

  return (
    <motion.div 
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2 z-50"
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
    >
      <div className="flex justify-between items-center mb-2">
        <div className="text-sm font-medium text-gray-500">Mobile Keyboard</div>
        <button 
          onClick={onClose}
          className="p-1 rounded-full hover:bg-gray-100"
        >
          <X size={18} />
        </button>
      </div>
      
      <div className="flex justify-center mb-2 space-x-2">
        <button 
          onClick={() => onArrowPress('left')}
          className="p-2 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          <ArrowLeft size={20} />
        </button>
        <button 
          onClick={() => onArrowPress('up')}
          className="p-2 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          <ArrowUp size={20} />
        </button>
        <button 
          onClick={() => onArrowPress('down')}
          className="p-2 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          <ArrowDown size={20} />
        </button>
        <button 
          onClick={() => onArrowPress('right')}
          className="p-2 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          <ArrowRight size={20} />
        </button>
        <button 
          onClick={onDelete}
          className="p-2 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          <Delete size={20} />
        </button>
      </div>
      
      <div className="flex flex-col items-center">
        {keys.map((row, rowIndex) => (
          <div key={rowIndex} className="flex mb-1 justify-center">
            {row.map((key) => (
              <motion.button
                key={key}
                className="w-8 h-10 mx-0.5 bg-gray-50 rounded-md text-base font-medium"
                whileTap={{ scale: 0.95, backgroundColor: 'rgba(255, 107, 107, 0.2)' }}
                onClick={() => onKeyPress(key)}
              >
                {key}
              </motion.button>
            ))}
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default MobileKeyboard; 