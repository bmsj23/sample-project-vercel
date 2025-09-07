import React, { useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { AuthContext } from './contexts';

export default function AuthProvider({ children }) {
  // use localStorage to persist user session
  const [user, setUser] = useLocalStorage('studyspot_user', null);
  const [isLoading, setIsLoading] = useState(false);

  // predefined mock credentials
  const VALID_CREDENTIALS = {
    username: 'user',
    password: '123'
  };

  const login = async (username, password) => {
    setIsLoading(true);
    
    // dimulate api call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      // validate credentials
      if (username === VALID_CREDENTIALS.username && password === VALID_CREDENTIALS.password) {
        const userData = {
          id: 1,
          username: username,
          loginTime: new Date().toISOString()
        };
        
        setUser(userData);
        setIsLoading(false);
        return true;
      } else {
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      return false;
    }
  };

  /**
   * logout function (clear user session)
   */
  const logout = () => {
    setUser(null);
  };

  const isAuthenticated = () => {
    return user !== null;
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
