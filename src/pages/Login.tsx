import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Mic, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Shield, 
  CheckCircle, 
  AlertCircle,
  ArrowRight,
  Chrome,
  Loader2,
  Info
} from 'lucide-react';
import { signInWithEmail, signInWithOAuth } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading: authLoading } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      console.log('User already logged in, redirecting to dashboard');
      navigate('/dashboard');
    }
  }, [user, authLoading, navigate]);

  // Handle OAuth callback messages
  useEffect(() => {
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    
    if (error) {
      console.error('OAuth error from URL params:', error, errorDescription);
      setError(errorDescription || 'Authentication failed');
    }
  }, [searchParams]);

  const getErrorMessage = (error: any) => {
    const message = error?.message || '';
    
    if (message.includes('Invalid login credentials')) {
      return {
        title: 'Login Failed',
        message: 'The email or password you entered is incorrect.',
        suggestion: 'Please check your credentials and try again. If you don\'t have an account yet, you can sign up below.'
      };
    }
    
    if (message.includes('Email not confirmed')) {
      return {
        title: 'Email Not Verified',
        message: 'Please check your email and click the verification link before signing in.',
        suggestion: 'Check your inbox (and spam folder) for a verification email from VoiceForm Pro.'
      };
    }
    
    if (message.includes('Too many requests')) {
      return {
        title: 'Too Many Attempts',
        message: 'Too many login attempts. Please wait a few minutes before trying again.',
        suggestion: 'For security reasons, please wait before attempting to log in again.'
      };
    }
    
    return {
      title: 'Authentication Error',
      message: message || 'An unexpected error occurred during login.',
      suggestion: 'Please try again or contact support if the problem persists.'
    };
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      console.log('Attempting email login for:', email);
      const { data, error } = await signInWithEmail(email, password);
      
      if (error) {
        console.error('Email login error:', error);
        const errorInfo = getErrorMessage(error);
        setError(JSON.stringify(errorInfo));
      } else {
        console.log('Email login successful:', data);
        setSuccess('Login successful! Redirecting...');
        // The AuthContext will handle the redirect automatically
      }
    } catch (err) {
      console.error('Email login exception:', err);
      setError(JSON.stringify({
        title: 'Connection Error',
        message: 'Unable to connect to the authentication service.',
        suggestion: 'Please check your internet connection and try again.'
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'microsoft') => {
    setOauthLoading(provider);
    setError(null);

    try {
      console.log(`Attempting ${provider} OAuth login...`);
      console.log('Current URL:', window.location.origin);
      console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
      
      const { data, error } = await signInWithOAuth(provider);
      
      if (error) {
        console.error(`${provider} OAuth error:`, error);
        setError(JSON.stringify({
          title: 'OAuth Configuration Error',
          message: `${provider} authentication is not properly configured.`,
          suggestion: 'Please contact support or try signing in with email instead.'
        }));
        setOauthLoading(null);
      } else {
        console.log(`${provider} OAuth initiated successfully`);
        // Success will be handled by the auth state change or redirect
      }
    } catch (err) {
      console.error(`${provider} OAuth exception:`, err);
      setError(JSON.stringify({
        title: 'OAuth Error',
        message: `${provider} authentication failed.`,
        suggestion: 'Please try again or use email login instead.'
      }));
      setOauthLoading(null);
    }
  };

  // Show loading spinner while checking auth state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  const renderError = () => {
    if (!error) return null;
    
    try {
      const errorInfo = JSON.parse(error);
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="text-red-800 text-sm font-medium">{errorInfo.title}</h4>
              <p className="text-red-700 text-sm mt-1">{errorInfo.message}</p>
              {errorInfo.suggestion && (
                <p className="text-red-600 text-xs mt-2">{errorInfo.suggestion}</p>
              )}
            </div>
          </div>
        </div>
      );
    } catch {
      // Fallback for non-JSON error messages
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
          <AlertCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5" />
          <div>
            <span className="text-red-800 text-sm font-medium">Authentication Error</span>
            <p className="text-red-700 text-sm mt-1">{error}</p>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="flex items-center justify-center space-x-3 mb-8 group">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
              <Mic className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">VoiceForm Pro</span>
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Welcome Back
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Sign in to access your voice-powered forms and continue transforming your workflow.
          </p>
        </div>

        {/* Info Notice for New Users */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <Info className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="text-blue-800 text-sm font-medium">New to VoiceForm Pro?</h4>
              <p className="text-blue-700 text-sm mt-1">
                You'll need to create an account first before you can sign in.
              </p>
              <Link 
                to="/signup" 
                className="inline-flex items-center text-blue-600 hover:text-blue-500 text-sm font-medium mt-2 transition-colors"
              >
                Create your account <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
        </div>

        {/* Error/Success Messages */}
        {renderError()}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
            <span className="text-green-800 text-sm">{success}</span>
          </div>
        )}

        {/* OAuth Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => handleOAuthLogin('google')}
            disabled={!!oauthLoading || loading}
            className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {oauthLoading === 'google' ? (
              <Loader2 className="w-5 h-5 animate-spin mr-3" />
            ) : (
              <Chrome className="w-5 h-5 mr-3" />
            )}
            <span className="font-medium">Continue with Google</span>
          </button>

          <button
            onClick={() => handleOAuthLogin('microsoft')}
            disabled={!!oauthLoading || loading}
            className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {oauthLoading === 'microsoft' ? (
              <Loader2 className="w-5 h-5 animate-spin mr-3" />
            ) : (
              <div className="w-5 h-5 mr-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-sm flex items-center justify-center">
                <span className="text-white text-xs font-bold">M</span>
              </div>
            )}
            <span className="font-medium">Continue with Microsoft</span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 text-gray-500">
              Or continue with email
            </span>
          </div>
        </div>

        {/* Email Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <form onSubmit={handleEmailLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 transition-all"
                  placeholder="Enter your work email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 transition-all"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Keep me signed in
                </label>
              </div>

              <div className="text-sm">
                <Link to="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                  Forgot password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !!oauthLoading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : (
                <ArrowRight className="w-5 h-5 mr-2" />
              )}
              {loading ? 'Signing in...' : 'Sign in to your workspace'}
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center">
              <Shield className="w-5 h-5 text-green-600 mr-2" />
              <p className="text-sm text-green-800">
                Your login is secured with enterprise-grade encryption and blockchain verification.
              </p>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              New to VoiceForm Pro?{' '}
              <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                Create your account
              </Link>
            </p>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-6 text-xs text-gray-500">
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
              HIPAA Compliant
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
              SOC 2 Certified
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
              Blockchain Verified
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;