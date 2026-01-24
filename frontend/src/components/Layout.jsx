import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Layout.css';

const Layout = ({ children, currentPage, setCurrentPage }) => {
  const { user, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
      setCurrentPage('login');
    } catch (err) {
      alert('Logout failed: ' + err.message);
    }
  };

  const navItems = [
    { id: 'marketplace', label: 'Marketplace', icon: '🛒' },
    { id: 'dashboard', label: 'My Crops', icon: '🌾' },
    { id: 'orders', label: 'My Orders', icon: '📦' },
  ];

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-brand">
            <span className="brand-icon">🌾</span>
            <h2 className="brand-text">Farm2Market</h2>
          </div>

          {/* Desktop Navigation */}
          <div className="navbar-nav-desktop">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentPage(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`nav-button ${currentPage === item.id ? 'active' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </button>
            ))}
          </div>

          {/* User Section */}
          <div className="navbar-user">
            <div className="user-info">
              <span className="user-avatar">👤</span>
              <span className="user-email">{user?.email?.split('@')[0]}</span>
            </div>
            <button onClick={handleLogout} className="logout-button">
              <span>🚪</span>
              <span className="logout-text">Logout</span>
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span className={mobileMenuOpen ? 'hamburger open' : 'hamburger'}>
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>
        </div>

        {/* Mobile Navigation */}
        <div className={`navbar-nav-mobile ${mobileMenuOpen ? 'open' : ''}`}>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setCurrentPage(item.id);
                setMobileMenuOpen(false);
              }}
              className={`nav-button-mobile ${currentPage === item.id ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
          <button onClick={handleLogout} className="logout-button-mobile">
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </nav>

      <main className="main-content">{children}</main>
    </div>
  );
};

export default Layout;
