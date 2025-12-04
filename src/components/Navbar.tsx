import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import logoImage from 'figma:asset/b9e63ce206aa68d0d57227942230badde2fa6a6b.png';

export function Navbar() {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '#home', label: 'Home' },
    { href: '#facilities', label: 'Facilities' },
    { href: '#packages', label: 'Packages' },
    { href: '#events', label: 'Events' },
    { href: '#gallery', label: 'Gallery' },
    { href: '#location', label: 'Location' },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    
    // Small delay to ensure mobile menu closes before scrolling
    setTimeout(() => {
      const element = document.querySelector(href);
      if (element) {
        const offset = 80;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }, 100);
  };

  return (
    <>
      <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
        <div className="container ">
          <div className="navbar-container mx-[5px] my-[0px] px-[30px] py-[0px]">
            {/* Logo */}
            <a 
              href="#home" 
              className="navbar-logo text-[32px]" 
              onClick={(e) => handleNavClick(e, '#home')}
            >
              <img 
                src={logoImage} 
                alt="Dream Avenue Logo" 
              />
              <div className="navbar-logo-text">
                <div className="navbar-logo-title text-[30px]">Dream Avenue</div>
                <div className="navbar-logo-subtitle text-[8px] text-left">CONVENTION CENTER</div>
              </div>
            </a>

            {/* Desktop Navigation */}
            <div className="navbar-menu">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className="navbar-link"
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* Desktop CTA Button */}
            <button
              onClick={() => navigate('/booking')}
              className="navbar-cta text-[14px] text-center"
            >
              <Sparkles size={15} />
              <span className="text-[14px] text-center font-[Inter] font-normal">Book now</span>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="navbar-mobile-toggle"
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="navbar-mobile-menu"
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', overflowY: 'auto' }}>
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.href)}
                    className="navbar-mobile-link"
                  >
                    {link.label}
                  </a>
                ))}
                
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    navigate('/booking');
                  }}
                  className="btn btn-primary"
                  style={{ marginTop: 'var(--space-4)' }}
                >
                  <Sparkles size={18} />
                  <span>Book Now</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}