import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import FarmerDashboard from './pages/FarmerDashboard';
import Marketplace from './pages/Marketplace';
import Orders from './pages/Orders';

// Inner component that uses auth context
const AppContent = () => {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('marketplace');

  // Set default page based on user role (for now, all users see same pages)
  useEffect(() => {
    if (user) {
      setCurrentPage('marketplace');
    }
  }, [user]);

  if (loading) {
    return (
      <div style={styles.loading}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <Layout currentPage={currentPage} setCurrentPage={setCurrentPage}>
      {currentPage === 'login' && <Login />}
      {currentPage === 'dashboard' && <FarmerDashboard />}
      {currentPage === 'marketplace' && <Marketplace />}
      {currentPage === 'orders' && <Orders />}
    </Layout>
  );
};

// Main App component with AuthProvider
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

const styles = {
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    fontSize: '18px',
    color: '#6b7280',
  },
};

export default App;
