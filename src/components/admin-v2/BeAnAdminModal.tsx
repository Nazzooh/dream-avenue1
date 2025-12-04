// components/admin-v2/BeAnAdminModal.tsx — Modal for requesting admin access
import React, { useState } from 'react';
import { X, UserPlus } from 'lucide-react';
import { useCreateAdminRequest } from '../../src/hooks/useAdminRequests';
import { CreateAdminRequest } from '../../src/schemas/adminRequests';

interface BeAnAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BeAnAdminModal({ isOpen, onClose }: BeAnAdminModalProps) {
  const createRequest = useCreateAdminRequest();
  const [formData, setFormData] = useState<CreateAdminRequest>({
    full_name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Basic validation
    const newErrors: Record<string, string> = {};
    if (!formData.full_name || formData.full_name.length < 2) {
      newErrors.full_name = 'Name must be at least 2 characters';
    }
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    if (formData.phone && formData.phone.length < 10) {
      newErrors.phone = 'Phone number must be at least 10 digits';
    }
    if (!formData.message || formData.message.length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await createRequest.mutateAsync(formData);
      // Reset form and close modal
      setFormData({
        full_name: '',
        email: '',
        phone: '',
        message: '',
      });
      onClose();
    } catch (error) {
      console.error('Failed to submit admin request:', error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div 
          className="bg-white rounded-3xl shadow-2xl w-full max-w-lg pointer-events-auto overflow-hidden"
          style={{
            maxHeight: '90vh',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div 
            className="p-6 border-b flex items-center justify-between"
            style={{ 
              background: 'linear-gradient(135deg, #A8DADC 0%, #457B9D 100%)',
              borderColor: 'rgba(0, 0, 0, 0.05)',
            }}
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <UserPlus size={24} style={{ color: '#FFFFFF' }} />
              </div>
              <div>
                <h2 
                  style={{
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '1.5rem',
                    fontWeight: '600',
                    color: '#FFFFFF',
                    margin: 0,
                  }}
                >
                  Request Admin Access
                </h2>
                <p style={{ fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.9)', margin: 0 }}>
                  Fill in your details to request access
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
              style={{ 
                color: '#FFFFFF',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 160px)' }}>
            <div className="space-y-5">
              {/* Full Name */}
              <div>
                <label 
                  htmlFor="full_name"
                  style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.5rem',
                  }}
                >
                  Full Name *
                </label>
                <input
                  type="text"
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 rounded-xl border transition-all outline-none"
                  style={{
                    borderColor: errors.full_name ? '#EF4444' : '#E5E7EB',
                    backgroundColor: '#F9FAFB',
                    color: '#1F2937',
                  }}
                  onFocus={(e) => {
                    if (!errors.full_name) {
                      e.currentTarget.style.borderColor = '#A8DADC';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(168, 218, 220, 0.1)';
                    }
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = errors.full_name ? '#EF4444' : '#E5E7EB';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
                {errors.full_name && (
                  <p style={{ fontSize: '0.75rem', color: '#EF4444', marginTop: '0.25rem' }}>
                    {errors.full_name}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label 
                  htmlFor="email"
                  style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.5rem',
                  }}
                >
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="your.email@example.com"
                  className="w-full px-4 py-3 rounded-xl border transition-all outline-none"
                  style={{
                    borderColor: errors.email ? '#EF4444' : '#E5E7EB',
                    backgroundColor: '#F9FAFB',
                    color: '#1F2937',
                  }}
                  onFocus={(e) => {
                    if (!errors.email) {
                      e.currentTarget.style.borderColor = '#A8DADC';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(168, 218, 220, 0.1)';
                    }
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = errors.email ? '#EF4444' : '#E5E7EB';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
                {errors.email && (
                  <p style={{ fontSize: '0.75rem', color: '#EF4444', marginTop: '0.25rem' }}>
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label 
                  htmlFor="phone"
                  style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.5rem',
                  }}
                >
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 1234567890"
                  className="w-full px-4 py-3 rounded-xl border transition-all outline-none"
                  style={{
                    borderColor: errors.phone ? '#EF4444' : '#E5E7EB',
                    backgroundColor: '#F9FAFB',
                    color: '#1F2937',
                  }}
                  onFocus={(e) => {
                    if (!errors.phone) {
                      e.currentTarget.style.borderColor = '#A8DADC';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(168, 218, 220, 0.1)';
                    }
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = errors.phone ? '#EF4444' : '#E5E7EB';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
                {errors.phone && (
                  <p style={{ fontSize: '0.75rem', color: '#EF4444', marginTop: '0.25rem' }}>
                    {errors.phone}
                  </p>
                )}
              </div>

              {/* Message */}
              <div>
                <label 
                  htmlFor="message"
                  style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.5rem',
                  }}
                >
                  Why do you want admin access? *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={4}
                  placeholder="Tell us why you need admin access..."
                  className="w-full px-4 py-3 rounded-xl border transition-all outline-none resize-none"
                  style={{
                    borderColor: errors.message ? '#EF4444' : '#E5E7EB',
                    backgroundColor: '#F9FAFB',
                    color: '#1F2937',
                  }}
                  onFocus={(e) => {
                    if (!errors.message) {
                      e.currentTarget.style.borderColor = '#A8DADC';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(168, 218, 220, 0.1)';
                    }
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = errors.message ? '#EF4444' : '#E5E7EB';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
                {errors.message && (
                  <p style={{ fontSize: '0.75rem', color: '#EF4444', marginTop: '0.25rem' }}>
                    {errors.message}
                  </p>
                )}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex gap-3 mt-6 pt-6 border-t" style={{ borderColor: '#E5E7EB' }}>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 rounded-xl transition-all"
                style={{
                  backgroundColor: '#F3F4F6',
                  color: '#4B5563',
                  fontWeight: '500',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#E5E7EB';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#F3F4F6';
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createRequest.isPending}
                className="flex-1 px-6 py-3 rounded-xl transition-all"
                style={{
                  background: 'linear-gradient(135deg, #A8DADC 0%, #457B9D 100%)',
                  color: '#FFFFFF',
                  fontWeight: '600',
                  opacity: createRequest.isPending ? 0.6 : 1,
                  cursor: createRequest.isPending ? 'not-allowed' : 'pointer',
                }}
                onMouseEnter={(e) => {
                  if (!createRequest.isPending) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(168, 218, 220, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {createRequest.isPending ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
