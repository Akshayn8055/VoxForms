import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ScrollToTop from './components/ScrollToTop';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Features from './pages/Features';
import Industries from './pages/Industries';
import Security from './pages/Security';
import Pricing from './pages/Pricing';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Templates from './pages/Templates';
import Status from './pages/Status';
import HelpCenter from './pages/HelpCenter';
import Documentation from './pages/Documentation';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Public Route Component (redirects to dashboard if already logged in)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <div className="min-h-screen bg-white">
          <Routes>
            {/* Auth pages without header/footer - redirect to dashboard if logged in */}
            <Route path="/login" element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } />
            <Route path="/signup" element={
              <PublicRoute>
                <Signup />
              </PublicRoute>
            } />
            <Route path="/forgot-password" element={
              <PublicRoute>
                <ForgotPassword />
              </PublicRoute>
            } />
            <Route path="/reset-password" element={
              <PublicRoute>
                <ResetPassword />
              </PublicRoute>
            } />
            
            {/* Protected routes - require authentication */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/templates" element={
              <ProtectedRoute>
                <Templates />
              </ProtectedRoute>
            } />
            
            {/* Main website pages with header/footer */}
            <Route path="/" element={
              <>
                <Header />
                <main>
                  <Home />
                </main>
                <Footer />
              </>
            } />
            <Route path="/features" element={
              <>
                <Header />
                <main>
                  <Features />
                </main>
                <Footer />
              </>
            } />
            <Route path="/industries" element={
              <>
                <Header />
                <main>
                  <Industries />
                </main>
                <Footer />
              </>
            } />
            <Route path="/security" element={
              <>
                <Header />
                <main>
                  <Security />
                </main>
                <Footer />
              </>
            } />
            <Route path="/pricing" element={
              <>
                <Header />
                <main>
                  <Pricing />
                </main>
                <Footer />
              </>
            } />
            <Route path="/about" element={
              <>
                <Header />
                <main>
                  <About />
                </main>
                <Footer />
              </>
            } />
            <Route path="/contact" element={
              <>
                <Header />
                <main>
                  <Contact />
                </main>
                <Footer />
              </>
            } />
            <Route path="/status" element={
              <>
                <Header />
                <main>
                  <Status />
                </main>
                <Footer />
              </>
            } />
            <Route path="/help-center" element={
              <>
                <Header />
                <main>
                  <HelpCenter />
                </main>
                <Footer />
              </>
            } />
            <Route path="/documentation" element={
              <>
                <Header />
                <main>
                  <Documentation />
                </main>
                <Footer />
              </>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;