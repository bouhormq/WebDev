import React, { createContext, useState, useEffect, useCallback } from 'react';
import * as authService from '../services/authService'; // Import the service
import apiClient from '../services/apiClient'; // Import apiClient for setting auth header

export const AuthContext = createContext();

// Helper to set Authorization header
const setAuthToken = token => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token')); // Load token initially
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Still loading until initial check done

  // Load user data based on token
  const loadUser = useCallback(async () => {
    const storedToken = localStorage.getItem('token');
    if (storedToken && storedToken !== 'undefined') { // Check for invalid token string
        setAuthToken(storedToken);
        setToken(storedToken);
        try {
            // Call backend /api/auth/me to verify token and get fresh user data
            const user = await authService.getMe(); 
            
            if (user) {
                 setCurrentUser(user);
                 setIsAdmin(user.isAdmin || false);
                 setIsLoggedIn(true);
            } else {
                 // Should not happen if API returns user or error
                 throw new Error("Failed to get user data from token.");
            }

        } catch (error) {
            // Handle errors (e.g., 401 Unauthorized if token invalid/expired)
            console.error("Error loading user via getMe:", error?.response?.status, error?.response?.data?.message || error.message);
            // Clear invalid token and state
            localStorage.removeItem('token');
            // localStorage.removeItem('user'); // No longer storing user in localStorage
            setAuthToken(null);
            setToken(null);
            setCurrentUser(null);
            setIsAdmin(false);
            setIsLoggedIn(false);
        }
    } else {
        // No valid token found
        setIsLoggedIn(false);
    }
    setIsLoading(false);
  }, []);

  // Load user on initial mount
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // Login function
  const login = async (username, password) => {
    try {
      const { token: receivedToken, user } = await authService.login(username, password);
      localStorage.setItem('token', receivedToken);
      // localStorage.removeItem('user'); // No longer need to store user here
      setAuthToken(receivedToken);
      setToken(receivedToken);
      setCurrentUser(user); // Set user data received from login
      setIsAdmin(user.isAdmin || false);
      setIsLoggedIn(true);
      return user;
    } catch (error) {
      logout(); 
      throw error;
    }
  };

  // Register function (remains same)
  const register = async (username, email, password) => {
     // ... (existing register code using authService.register) ...
     try {
      const response = await authService.register(username, email, password);
      return response;
    } catch (error) {
       console.error("AuthContext register failed:", error);
       throw error;
    }
  };

  // Logout function (remove user from localStorage and call backend)
  const logout = async () => { // Make the function async
    console.log('Logging out - clearing state and token, and calling backend.');
    try {
      await authService.logout(); // Call the backend logout service
    } catch (error) {
      // Log error from authService.logout if it re-throws,
      // but proceed with client-side cleanup regardless.
      console.error("Error during backend logout, proceeding with client-side cleanup:", error);
    }
    
    // Client-side cleanup
    localStorage.removeItem('token');
    setAuthToken(null); // Clears the Authorization header in apiClient
    setToken(null);
    setCurrentUser(null);
    setIsAdmin(false);
    setIsLoggedIn(false);
  };

  const value = {
    token,
    currentUser,
    setCurrentUser, // Add setCurrentUser here
    isAdmin,
    isLoggedIn,
    isLoading, 
    login,
    logout,
    register,
  };

  return (
    <AuthContext.Provider value={value}>
      {children} {/* Render children immediately, isLoading handles display in AppRoutes */}
    </AuthContext.Provider>
  );
};
