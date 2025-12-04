import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, UtensilsCrossed, Palette, FileText, HelpCircle } from 'lucide-react';

const faqs = [
  {
    icon: UtensilsCrossed,
    question: 'Do you provide catering services?',
    answer: 'We do not provide catering services directly. However, you are welcome to hire external catering parties of your choice. Our venue includes a fully equipped pantry area to support your catering team.',
  },
  {
    icon: Palette,
    question: 'Can I customize the decor?',
    answer: "We don't offer decor customization services in-house, but external decorators are more than welcome to transform our space according to your vision. Our team will coordinate with your decorator to ensure smooth setup.",
  },
  {
    icon: FileText,
    question: 'What are your booking policies?',
    answer: 'Please note: No drinks (including water) or alcohol are allowed inside the hall. Smoking is permitted only in designated outdoor areas. Complete payment is required one day before the event, unless alternative settlement arrangements have been discussed and agreed upon with our team.',
  },
  {
    icon: HelpCircle,
    question: 'What is included in each package?',
    answer: 'Each package includes different amenities ranging from air-conditioning, seating arrangements, sound systems, stage setup, and parking. Our team will provide detailed information about what\'s included in your selected package when you inquire.',
  },
  {
    icon: HelpCircle,
    question: 'How do I confirm my booking?',
    answer: 'After submitting your booking request via WhatsApp, our team will contact you to confirm availability, discuss final details, and arrange payment. We recommend booking at least 2-4 weeks in advance for popular dates.',
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="section" style={{ background: 'var(--bg-cream)' }}>
      <div className="container">
        {/* Section Header */}
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="section-badge">FAQ</div>
          <h2 className="section-title">Frequently Asked Questions</h2>
          <p className="section-description">
            Everything you need to know about our venue and services
          </p>
        </motion.div>

        {/* FAQ List */}
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {faqs.map((faq, index) => {
            const IconComponent = faq.icon;
            const isOpen = openIndex === index;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                style={{
                  marginBottom: 'var(--space-4)',
                }}
              >
                <div
                  style={{
                    background: 'var(--white)',
                    borderRadius: 'var(--radius-xl)',
                    boxShadow: isOpen ? 'var(--shadow-lg)' : 'var(--shadow-md)',
                    border: `2px solid ${isOpen ? 'var(--lime-primary)' : 'transparent'}`,
                    transition: 'all 0.3s ease',
                  }}
                >
                  {/* Question */}
                  <button
                    onClick={() => toggleFAQ(index)}
                    style={{
                      width: '100%',
                      padding: 'var(--space-6)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-4)',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    {/* Icon */}
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: isOpen 
                          ? 'linear-gradient(135deg, var(--lime-primary), var(--lime-secondary))' 
                          : 'rgba(182, 245, 0, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <IconComponent 
                        size={20} 
                        style={{ 
                          color: isOpen ? 'var(--dark-text)' : 'var(--lime-primary)',
                        }} 
                      />
                    </div>

                    {/* Question Text */}
                    <div style={{ flex: 1 }}>
                      <h4 style={{ 
                        margin: 0, 
                        color: 'var(--dark-text)',
                        fontSize: '1.125rem',
                      }}>
                        {faq.question}
                      </h4>
                    </div>

                    {/* Chevron */}
                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      style={{
                        flexShrink: 0,
                        color: isOpen ? 'var(--lime-primary)' : 'var(--gray-400)',
                      }}
                    >
                      <ChevronDown size={24} />
                    </motion.div>
                  </button>

                  {/* Answer */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        style={{
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            padding: '0 var(--space-6) var(--space-6) var(--space-6)',
                            paddingLeft: 'calc(var(--space-6) + 40px + var(--space-4))',
                          }}
                        >
                          <p style={{ 
                            margin: 0, 
                            color: 'var(--gray-700)',
                            lineHeight: 1.7,
                            fontSize: '0.9375rem',
                          }}>
                            {faq.answer}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
