import { MapPin, Phone, Mail, Facebook, Instagram, Twitter, Linkedin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logoImage from 'figma:asset/b9e63ce206aa68d0d57227942230badde2fa6a6b.png';
import { CONTACT_INFO } from '../src/constants/contact';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const navigate = useNavigate();

  // Secret admin access: Triple-click on copyright text
  const handleSecretAccess = (e: React.MouseEvent) => {
    if (e.detail === 3) { // Triple-click detection
      navigate('/admin/dashboard');
    }
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
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
  };

  return (
    <footer className="site-footer">
      <div className="container">
        {/* Footer Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
          gap: 'clamp(2rem, 4vw, 3.5rem)',
          alignItems: 'start',
        }}>
          {/* Brand Section */}
          <div style={{ minWidth: 0 }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 'clamp(0.75rem, 2vw, 1rem)',
              marginBottom: 'clamp(1rem, 2.5vw, 1.5rem)',
            }}>
              <img 
                src={logoImage} 
                alt="Dream Avenue Logo" 
                style={{ 
                  width: 'clamp(40px, 10vw, 48px)', 
                  height: 'clamp(40px, 10vw, 48px)', 
                  objectFit: 'contain',
                  flexShrink: 0
                }}
              />
              <div style={{ minWidth: 0 }}>
                <div style={{ 
                  fontFamily: 'var(--font-heading)',
                  fontSize: 'clamp(1.125rem, 2.5vw, 1.25rem)',
                  color: 'var(--white)',
                  lineHeight: 1.2,
                }}>
                  Dream Avenue
                </div>
                <div style={{ 
                  fontSize: 'clamp(0.6875rem, 1.5vw, 0.75rem)',
                  color: 'var(--gray-300)',
                  letterSpacing: '0.5px',
                  marginTop: '2px',
                }}>
                  CONVENTION CENTER
                </div>
              </div>
            </div>
            <p style={{ 
              color: 'var(--gray-300)', 
              fontSize: 'clamp(0.875rem, 1.75vw, 0.9375rem)',
              lineHeight: 1.65,
              marginBottom: 'clamp(1.25rem, 3vw, 1.75rem)',
              margin: 0,
            }}>
              Creating unforgettable moments for weddings, corporate events, and grand celebrations.
            </p>

            {/* Social Links */}
            <div style={{ 
              display: 'flex', 
              gap: 'clamp(0.625rem, 1.5vw, 0.75rem)', 
              marginTop: 'clamp(1.25rem, 3vw, 1.75rem)',
              flexWrap: 'wrap',
            }}>
              {[
                { icon: Facebook, url: 'https://facebook.com' },
                { icon: Instagram, url: 'https://instagram.com' },
                { icon: Twitter, url: 'https://twitter.com' },
                { icon: Linkedin, url: 'https://linkedin.com' }
              ].map(({ icon: Icon, url }, index) => (
                <a
                  key={index}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    width: 'clamp(36px, 8vw, 40px)',
                    height: 'clamp(36px, 8vw, 40px)',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--white)',
                    transition: 'all 0.3s ease',
                    flexShrink: 0,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--lime-primary)';
                    e.currentTarget.style.color = 'var(--dark-text)';
                    e.currentTarget.style.transform = 'translateY(-3px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.color = 'var(--white)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div style={{ minWidth: 0 }}>
            <h4 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(1rem, 2.25vw, 1.125rem)',
              color: 'var(--white)',
              marginBottom: 'clamp(1rem, 2.5vw, 1.5rem)',
              fontWeight: 600,
              margin: 0,
              marginBottom: 'clamp(1rem, 2.5vw, 1.5rem)',
            }}>
              Quick Links
            </h4>
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 'clamp(0.625rem, 1.5vw, 0.875rem)' 
            }}>
              {[
                { label: 'Home', href: '#home' },
                { label: 'Facilities', href: '#facilities' },
                { label: 'Packages', href: '#packages' },
                { label: 'Events', href: '#events' },
                { label: 'Gallery', href: '#gallery' }
              ].map(({ label, href }) => (
                <a 
                  key={href}
                  href={href} 
                  onClick={(e) => handleNavClick(e, href)} 
                  style={{
                    color: 'var(--gray-300)',
                    fontSize: 'clamp(0.875rem, 1.75vw, 0.9375rem)',
                    textDecoration: 'none',
                    transition: 'all 0.3s ease',
                    display: 'inline-block',
                    width: 'fit-content',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--lime-primary)';
                    e.currentTarget.style.paddingLeft = '8px';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--gray-300)';
                    e.currentTarget.style.paddingLeft = '0';
                  }}
                >
                  {label}
                </a>
              ))}
            </div>
          </div>

          {/* Services */}
          <div style={{ minWidth: 0 }}>
            <h4 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(1rem, 2.25vw, 1.125rem)',
              color: 'var(--white)',
              marginBottom: 'clamp(1rem, 2.5vw, 1.5rem)',
              fontWeight: 600,
              margin: 0,
              marginBottom: 'clamp(1rem, 2.5vw, 1.5rem)',
            }}>
              Services
            </h4>
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 'clamp(0.625rem, 1.5vw, 0.875rem)' 
            }}>
              {[
                { label: 'Wedding Packages', href: '#packages' },
                { label: 'Corporate Events', href: '#packages' },
                { label: 'Birthday Parties', href: '#packages' },
                { label: 'Social Gatherings', href: '#packages' },
                { label: 'Catering Services', href: '#facilities' },
                { label: 'Event Planning', href: '#facilities' }
              ].map(({ label, href }) => (
                <a 
                  key={label}
                  href={href} 
                  onClick={(e) => handleNavClick(e, href)} 
                  style={{
                    color: 'var(--gray-300)',
                    fontSize: 'clamp(0.875rem, 1.75vw, 0.9375rem)',
                    textDecoration: 'none',
                    transition: 'all 0.3s ease',
                    display: 'inline-block',
                    width: 'fit-content',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--lime-primary)';
                    e.currentTarget.style.paddingLeft = '8px';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--gray-300)';
                    e.currentTarget.style.paddingLeft = '0';
                  }}
                >
                  {label}
                </a>
              ))}
            </div>
          </div>

          {/* Contact Info */}
          <div style={{ minWidth: 0 }}>
            <h4 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(1rem, 2.25vw, 1.125rem)',
              color: 'var(--white)',
              marginBottom: 'clamp(1rem, 2.5vw, 1.5rem)',
              fontWeight: 600,
              margin: 0,
              marginBottom: 'clamp(1rem, 2.5vw, 1.5rem)',
            }}>
              Contact Us
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(0.875rem, 2vw, 1.25rem)' }}>
              {/* Address */}
              <div style={{ display: 'flex', gap: 'clamp(0.625rem, 1.5vw, 0.75rem)', alignItems: 'flex-start' }}>
                <MapPin size={18} style={{ color: 'var(--lime-primary)', flexShrink: 0, marginTop: '3px' }} />
                <span style={{ 
                  color: 'var(--gray-300)', 
                  fontSize: 'clamp(0.8125rem, 1.5vw, 0.875rem)',
                  lineHeight: 1.6,
                }}>
                  Feroke Road, Karuvanthiruthy<br />
                  Kozhikode, Kerala 673631<br />
                  <span style={{ fontSize: 'clamp(0.75rem, 1.25vw, 0.8125rem)', color: 'var(--gray-400)' }}>
                    (Ground Floor Office)
                  </span>
                </span>
              </div>
              
              {/* Phone */}
              <div style={{ display: 'flex', gap: 'clamp(0.625rem, 1.5vw, 0.75rem)', alignItems: 'flex-start' }}>
                <Phone size={18} style={{ color: 'var(--lime-primary)', flexShrink: 0, marginTop: '3px' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: 0 }}>
                  <a 
                    href={`tel:${CONTACT_INFO.phones.main}`}
                    style={{ 
                      color: 'var(--gray-300)', 
                      fontSize: 'clamp(0.8125rem, 1.5vw, 0.875rem)', 
                      textDecoration: 'none',
                      transition: 'color 0.3s ease',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--lime-primary)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--gray-300)'}
                  >
                    {CONTACT_INFO.phones.main}
                  </a>
                  <a 
                    href={`tel:${CONTACT_INFO.phones.booking}`}
                    style={{ 
                      color: 'var(--gray-300)', 
                      fontSize: 'clamp(0.75rem, 1.25vw, 0.8125rem)', 
                      textDecoration: 'none',
                      transition: 'color 0.3s ease',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--lime-primary)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--gray-300)'}
                  >
                    {CONTACT_INFO.phones.bookingFormatted} (Booking)
                  </a>
                </div>
              </div>
              
              {/* Email */}
              <div style={{ display: 'flex', gap: 'clamp(0.625rem, 1.5vw, 0.75rem)', alignItems: 'flex-start' }}>
                <Mail size={18} style={{ color: 'var(--lime-primary)', flexShrink: 0, marginTop: '3px' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: 0, overflow: 'hidden' }}>
                  <a 
                    href={`mailto:${CONTACT_INFO.emails.primary}`}
                    style={{ 
                      color: 'var(--gray-300)', 
                      fontSize: 'clamp(0.8125rem, 1.5vw, 0.875rem)', 
                      textDecoration: 'none',
                      transition: 'color 0.3s ease',
                      wordBreak: 'break-word',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--lime-primary)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--gray-300)'}
                  >
                    {CONTACT_INFO.emails.primary}
                  </a>
                  <a 
                    href={`mailto:${CONTACT_INFO.emails.secondary}`}
                    style={{ 
                      color: 'var(--gray-300)', 
                      fontSize: 'clamp(0.75rem, 1.25vw, 0.8125rem)', 
                      textDecoration: 'none',
                      transition: 'color 0.3s ease',
                      wordBreak: 'break-word',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--lime-primary)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--gray-300)'}
                  >
                    {CONTACT_INFO.emails.secondary}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <p onClick={handleSecretAccess}>© {currentYear} Dream Avenue Convention Center. All rights reserved.</p>
          <p style={{ marginTop: 'var(--space-2)' }}>
            Made with <span style={{ color: 'var(--lime-primary)' }}>♥</span> for creating beautiful moments
          </p>
        </div>
      </div>
    </footer>
  );
}