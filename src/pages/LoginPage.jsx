import React, { useState } from 'react';
import { Navigate, useNavigate, Link, useLocation } from 'react-router-dom';
import { Loader } from 'lucide-react';
import { useAuth } from '../hooks/useContexts';

function LoginPage() {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, isLoading } = useAuth();

  // if already authenticated, redirect user to the originating location (if provided)
  if (isAuthenticated()) {
    const from = location.state && location.state.from ? location.state.from : null;
    if (from && from.pathname) {
      return <Navigate to={from.pathname + (from.search || '')} replace />;
    }
    return <Navigate to="/" replace />;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    // clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const success = await login(credentials.username, credentials.password);

      if (success) {
        // If we were redirected here, send the user back to the originating location
        const from = location.state && location.state.from ? location.state.from : null;
        if (from && from.pathname) {
          navigate(from.pathname + (from.search || ''), { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      } else {
        setError('Invalid username or password. Try: user / 123');
      }
    } catch {
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="text-center">
            <Link to="/" className="text-3xl font-bold text-blue-600 hover:text-blue-700">
              StudySpot PH
            </Link>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Login to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Access your bookings and discover amazing study spaces
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Username"
                value={credentials.username}
                onChange={handleInputChange}
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={credentials.password}
                onChange={handleInputChange}
                disabled={isLoading} />
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed transition duration-200 hover:cursor-pointer">
              {isLoading ? (
                <>
                  <Loader className="animate-spin mr-3 h-5 w-5" />
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </button>
          </div>

          <div className="text-center">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-700 font-medium mb-2">Demo Credentials:</p>
              <p className="text-sm text-blue-600">Username: <code className="bg-white px-2 py-1 rounded">user</code></p>
              <p className="text-sm text-blue-600">Password: <code className="bg-white px-2 py-1 rounded">123</code></p>
            </div>
          </div>
        </form>

        <div className="text-center">
          <Link
            to="/"
            className="text-blue-600 hover:text-blue-500 text-sm font-medium">
            ← Back to Browse Spaces
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
