// organizasso-frontend/src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LoginForm from '../components/Auth/LoginForm';
import useAuth from '../hooks/useAuth';
// No need to import Header/Footer if page is simple or uses a different layout
// import Header from '../components/Layout/Header'; 
// import Footer from '../components/Layout/Footer'; 
import { toast } from "sonner";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (credentials) => {
    setError(null); // Clear previous errors
    setIsLoading(true);
    try {
      // Use the login function from AuthContext, which now uses the simulated service
      const userData = await login(credentials.username, credentials.password);
      toast.success(`Welcome back, ${userData.username}!`);
      navigate('/dashboard'); // Redirect on successful login
    } catch (err) {
      const errorMessage = err.message || "Login failed. Please check your credentials.";
      console.error("Login failed:", errorMessage);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40">
      {/* Wrap LoginForm and link in a div if needed for layout, or Card handles it */}
      <div className="w-full max-w-sm p-4">
        <LoginForm onSubmit={handleLogin} error={error} isLoading={isLoading} />
        <div className="mt-4 text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

