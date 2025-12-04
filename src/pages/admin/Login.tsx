// pages/admin/Login.tsx — Admin Login Page with Supabase Auth
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Eye, EyeOff, Sparkles, Mail, Lock } from 'lucide-react';
import { useAuth } from '../../src/auth/useAuth';
import { toast } from 'sonner@2.0.3';

export function AdminLogin() {
  const navigate = useNavigate();
  const { user, isAdmin, isLoading, signIn, profileError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (!isLoading && user && isAdmin) {
      navigate('/admin/dashboard');
    }
  }, [user, isAdmin, isLoading, navigate]);

  // Show profile error if exists
  useEffect(() => {
    if (profileError) {
      toast.error(profileError);
    }
  }, [profileError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please enter your email and password');
      return;
    }

    setIsSubmitting(true);

    try {
      await signIn(email, password);
      toast.success('Access granted! Welcome back.');
      navigate('/admin/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      
      // User-friendly error messages
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.message?.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password. Please check your credentials.';
      } else if (error.message?.includes('Admin role required')) {
        errorMessage = 'Access denied: You do not have admin permissions.';
      } else if (error.message?.includes('Email not confirmed')) {
        errorMessage = 'Please verify your email address first.';
      } else if (error.message?.includes('No profile found')) {
        errorMessage = 'No profile found. Please contact administrator to set up your account.';
      } else if (error.message?.includes('Failed to fetch user profile')) {
        errorMessage = 'Error fetching profile. Please contact administrator.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="admin-login-loading">
        <div className="admin-login-spinner" />
        <p className="admin-login-loading-text">Loading...</p>
      </div>
    );
  }

  return (
    <div className="admin-login-container">
      {/* Background Elements */}
      <div className="admin-login-bg-gradient" />
      <div className="admin-login-watermark">Dream Avenue</div>

      <div className="admin-login-grid">
        {/* Visual Section (Left) */}
        <div className="admin-login-visual">
          <div className="admin-login-visual-content">
            {/* Logo */}
            <div className="admin-login-logo">
              <div className="admin-login-logo-icon">
                <Sparkles size={48} />
              </div>
              <h2 className="admin-login-logo-text">Dream Avenue</h2>
            </div>

            {/* Welcome Text */}
            <div className="admin-login-welcome">
              <h1 className="admin-login-welcome-title">
                Welcome to Dream Avenue
              </h1>
              <p className="admin-login-welcome-subtitle">
                Admin Control Panel
              </p>
              <p className="admin-login-welcome-description">
                Manage your convention center with elegance and efficiency
              </p>
            </div>

            {/* Decorative Elements */}
            <div className="admin-login-visual-decoration">
              <div className="admin-login-visual-circle admin-login-visual-circle-1" />
              <div className="admin-login-visual-circle admin-login-visual-circle-2" />
              <div className="admin-login-visual-circle admin-login-visual-circle-3" />
            </div>
          </div>
        </div>

        {/* Form Section (Right) */}
        <div className="admin-login-form-section">
          <div className="admin-login-card">
            {/* Card Header */}
            <div className="admin-login-card-header">
              <h2 className="admin-login-card-title">Admin Login</h2>
              <p className="admin-login-card-subtitle">
                Sign in with your admin account credentials
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="admin-login-form">
              {/* Email Field */}
              <div className="admin-login-field">
                <label htmlFor="email" className="admin-login-label">
                  Email Address
                </label>
                <div className="admin-login-input-wrapper">
                  <Mail size={20} className="admin-login-input-icon" />
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="admin@dreamavenue.com"
                    className="admin-login-input"
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="admin-login-field">
                <label htmlFor="password" className="admin-login-label">
                  Password
                </label>
                <div className="admin-login-input-wrapper">
                  <Lock size={20} className="admin-login-input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter your password"
                    className="admin-login-input admin-login-input-password"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="admin-login-password-toggle"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`admin-login-button ${isSubmitting ? 'admin-login-button-loading' : ''}`}
              >
                <LogIn size={20} />
                <span>{isSubmitting ? 'Signing in...' : 'Sign In'}</span>
              </button>

              {/* Info */}
              <div style={{ 
                marginTop: '1rem', 
                padding: '0.75rem', 
                background: '#F0FDF4', 
                border: '1px solid #86EFAC',
                borderRadius: '8px',
                fontSize: '0.875rem',
                color: '#166534'
              }}>
                <strong>🔒 Secure Login:</strong> Only admin accounts with verified credentials can access the dashboard.
              </div>
            </form>

            {/* Card Footer */}
            <div className="admin-login-card-footer">
              <p className="admin-login-footer-text">
                © Dream Avenue Convention Center · 2025
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}