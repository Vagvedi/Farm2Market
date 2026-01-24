import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('buyer');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signUp, signIn } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        if (!fullName.trim()) {
          setError('Full name is required');
          setLoading(false);
          return;
        }
        await signUp({ email, password, full_name: fullName.trim(), role });
        alert('✅ Sign up successful! Redirecting...');
        setIsSignUp(false);
        setFullName('');
        setRole('buyer');
        setEmail('');
        setPassword('');
        // Auto login after signup
        await signIn(email, password);
        window.location.reload();
      } else {
        await signIn(email, password);
        window.location.reload();
      }
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="login-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
        </div>
        <div className="login-pattern"></div>
      </div>
      
      <div className="login-card animate-fadeIn">
        <div className="login-header">
          <div className="login-logo">
            <div className="logo-circle">
              <span className="logo-icon">🌾</span>
            </div>
            <h1 className="login-title">Farm2Market</h1>
          </div>
          <p className="login-subtitle">
            {isSignUp ? (
              <>
                <span className="subtitle-highlight">Join</span> our agricultural marketplace
                <br />
                <span className="subtitle-small">Connect farmers and buyers seamlessly</span>
              </>
            ) : (
              <>
                Welcome back to your <span className="subtitle-highlight">farm</span>!
                <br />
                <span className="subtitle-small">Sign in to continue your journey</span>
              </>
            )}
          </p>
        </div>

        {error && (
          <div className="login-error animate-slideIn">
            <div className="error-content">
              <span className="error-icon">⚠️</span>
              <span className="error-text">{error}</span>
            </div>
            <button 
              type="button"
              onClick={() => setError('')}
              className="error-close"
            >
              ✕
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          {isSignUp && (
            <>
              <div className="input-group">
                <label htmlFor="fullName">
                  <span className="label-icon">👤</span>
                  Full Name
                </label>
                <div className="input-wrapper">
                  <input
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="login-input"
                    autoComplete="name"
                  />
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="role">
                  <span className="label-icon">🎭</span>
                  I want to
                </label>
                <div className="input-wrapper role-selector">
                  <div className="role-options">
                    <button
                      type="button"
                      onClick={() => setRole('buyer')}
                      className={`role-option ${role === 'buyer' ? 'active' : ''}`}
                    >
                      <span className="role-icon">🛒</span>
                      <div className="role-info">
                        <div className="role-title">Buy Products</div>
                        <div className="role-desc">Browse and purchase crops</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('farmer')}
                      className={`role-option ${role === 'farmer' ? 'active' : ''}`}
                    >
                      <span className="role-icon">🌾</span>
                      <div className="role-info">
                        <div className="role-title">Sell Products</div>
                        <div className="role-desc">List and manage your crops</div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="input-group">
            <label htmlFor="email">
              <span className="label-icon">📧</span>
              Email Address
            </label>
            <div className="input-wrapper">
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="login-input"
                autoComplete="email"
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="password">
              <span className="label-icon">🔒</span>
              Password
            </label>
            <div className="input-wrapper">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder={isSignUp ? 'Create a strong password' : 'Enter your password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="login-input"
                minLength={6}
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle"
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {isSignUp && (
              <div className="password-strength">
                <div className={`strength-bar ${password.length >= 6 ? 'strong' : password.length >= 3 ? 'medium' : 'weak'}`}></div>
                <p className="input-hint">
                  {password.length === 0 && 'Minimum 6 characters'}
                  {password.length > 0 && password.length < 6 && `${6 - password.length} more characters needed`}
                  {password.length >= 6 && '✓ Strong password'}
                </p>
              </div>
            )}
          </div>

          <button 
            type="submit" 
            disabled={loading || (isSignUp && (!fullName.trim() || password.length < 6))} 
            className="login-button"
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span className="button-icon">{isSignUp ? '✨' : '🚀'}</span>
                <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
              </>
            )}
          </button>
        </form>

        <div className="login-divider">
          <span className="divider-line"></span>
          <span className="divider-text">or</span>
          <span className="divider-line"></span>
        </div>

        <div className="login-switch">
          <p className="switch-text">
            {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
                setFullName('');
                setRole('buyer');
              }}
              className="switch-button"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>

        {isSignUp && (
          <div className="login-features">
            <div className="feature-item">
              <span className="feature-icon">🔐</span>
              <span>Secure authentication</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🌾</span>
              <span>Direct farmer connection</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">💼</span>
              <span>Easy crop management</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
