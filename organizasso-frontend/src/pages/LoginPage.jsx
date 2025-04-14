// organizasso-frontend/src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// Import from correct Auth directory
import LoginForm from '../components/Auth/LoginForm'; 
import useAuth from '../hooks/useAuth';
// No need to import Header/Footer if page is simple or uses a different layout
// import Header from '../components/Layout/Header'; 
// import Footer from '../components/Layout/Footer'; 
import { toast } from "sonner";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

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
    // Centered layout
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-muted/30 p-4">
      {/* Use Card for structure and styling */}
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Login</CardTitle>
          <CardDescription>Welcome back to Organiz'asso</CardDescription>
        </CardHeader>
        <CardContent>
           <LoginForm onSubmit={handleLogin} error={error} isLoading={isLoading} />
        </CardContent>
        <CardFooter className="flex flex-col items-center text-sm">
           <p className="text-muted-foreground">
             Don&apos;t have an account?{" "}
             <Link to="/register" className="font-medium text-primary hover:underline">
               Register here
             </Link>
           </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginPage;

