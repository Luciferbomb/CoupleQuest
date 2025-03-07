
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
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

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-beige-50/95 backdrop-blur-md shadow-elevation-low' 
        : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2 transition-transform hover:scale-105">
          <span className="font-bold text-xl tracking-tight text-beige-800">Couple Quest</span>
        </Link>
        
        <div className="space-x-1 sm:space-x-4">
          <Link 
            to="/create" 
            className={`px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
              location.pathname === '/create'
                ? 'bg-beige-500 text-white' 
                : 'hover:bg-beige-100 text-beige-800'
            }`}
          >
            Create Puzzle
          </Link>
          
          <Link 
            to="/solve" 
            className={`px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
              location.pathname === '/solve'
                ? 'bg-beige-500 text-white' 
                : 'hover:bg-beige-100 text-beige-800'
            }`}
          >
            Solve Puzzle
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
