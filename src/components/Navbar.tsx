import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Heart, Map, Sparkles, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when location changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <motion.nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/90 backdrop-blur-md shadow-md' 
          : 'bg-transparent'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2 transition-transform hover:scale-105">
          <motion.div
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          >
            <Heart className="text-primary" size={28} fill="var(--color-primary)" strokeWidth={1.5} />
          </motion.div>
          <span className="font-bold text-xl tracking-tight text-gradient">Couple Quest</span>
        </Link>
        
        {/* Mobile menu button */}
        <motion.button 
          className="md:hidden text-gray-800 focus:outline-none" 
          onClick={toggleMobileMenu}
          whileTap={{ scale: 0.9 }}
        >
          <AnimatePresence mode="wait">
            {mobileMenuOpen ? (
              <motion.div
                key="close"
                initial={{ opacity: 0, rotate: -90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 90 }}
                transition={{ duration: 0.2 }}
              >
                <X size={24} />
              </motion.div>
            ) : (
              <motion.div
                key="menu"
                initial={{ opacity: 0, rotate: 90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: -90 }}
                transition={{ duration: 0.2 }}
              >
                <Menu size={24} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Desktop navigation */}
        <div className="hidden md:flex space-x-4">
          <NavLink to="/create" active={location.pathname === '/create'}>
            <Sparkles className="mr-1.5" size={16} />
            Create Puzzle
          </NavLink>
          
          <NavLink to="/solve" active={location.pathname === '/solve'}>
            <Map className="mr-1.5" size={16} />
            Solve Puzzle
          </NavLink>
        </div>
      </div>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            className="md:hidden bg-white/95 backdrop-blur-md shadow-md"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="container mx-auto px-4 py-4 flex flex-col space-y-3">
              <NavLink to="/create" active={location.pathname === '/create'} mobile>
                <Sparkles className="mr-1.5" size={16} />
                Create Puzzle
              </NavLink>
              
              <NavLink to="/solve" active={location.pathname === '/solve'} mobile>
                <Map className="mr-1.5" size={16} />
                Solve Puzzle
              </NavLink>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

// NavLink component for consistent styling
const NavLink = ({ to, active, children, mobile = false }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Link 
        to={to} 
        className={`px-3 py-${mobile ? '3' : '2'} rounded-lg text-sm transition-all duration-200 flex items-center ${
          active
            ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-sm' 
            : 'hover:bg-primary/10 text-gray-800'
        }`}
      >
        {children}
      </Link>
    </motion.div>
  );
};

export default Navbar;
