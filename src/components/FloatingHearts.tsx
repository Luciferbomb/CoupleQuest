import { motion } from 'framer-motion';

interface FloatingHeartsProps {
  count?: number;
}

const FloatingHearts: React.FC<FloatingHeartsProps> = ({ count = 15 }) => {
  return (
    <div className="floating-hearts">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div 
          key={i}
          className="floating-heart"
          initial={{ y: '100vh', opacity: 0, scale: 0.5, rotate: 0 }}
          animate={{ 
            y: '-100px', 
            opacity: [0, 0.2, 0.1, 0], 
            scale: 1.5, 
            rotate: 360 
          }}
          transition={{ 
            duration: 15 + Math.random() * 15,
            delay: Math.random() * 5,
            repeat: Infinity,
            repeatType: 'loop'
          }}
          style={{
            left: `${Math.random() * 100}%`,
            width: `${10 + Math.random() * 15}px`,
            height: `${10 + Math.random() * 15}px`,
          }}
        />
      ))}
    </div>
  );
};

export default FloatingHearts; 