// organizasso-frontend/src/pages/LoginPage.jsx
import React, { useEffect } from 'react';
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
  const { login, error, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Login | Organizasso';
  }, []);

  const handleLogin = async (credentials) => {
    try {
      const userData = await login(credentials.username, credentials.password);
      toast.success(`Welcome back, ${userData.username}!`);
      navigate('/forum/open');
    } catch (err) {
      const errorMessage = err.message || "Login failed. Please check your credentials.";
      console.error("Login failed:", errorMessage);
      if (!error) {
      toast.error(errorMessage);
      }
    }
  };

  // --- Inline Styles ---
  const pageStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    // bg-gradient lost
    backgroundColor: 'var(--background)', // Fallback background
    padding: '1rem', // p-4
  };
  const cardStyle = {
      width: '100%',
      maxWidth: '24rem', // max-w-sm
      // shadow-lg is handled by the Card component itself now
  };
  const headerStyle = { textAlign: 'center' };
  const titleStyle = { fontSize: '1.5rem', fontWeight: 'bold' }; // text-2xl font-bold
  const footerStyle = { display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '0.875rem' }; // flex flex-col items-center text-sm
  const footerPStyle = { color: 'var(--muted-foreground)' }; // text-muted-foreground
  const footerLinkStyle = { fontWeight: 500, color: 'var(--primary)' }; // font-medium text-primary (hover lost)
  // --- End Inline Styles ---

  return (
    <div style={pageStyle}>
      <Card style={cardStyle}>
        <CardHeader style={headerStyle}>
          <CardTitle style={titleStyle}>Login</CardTitle>
          <CardDescription>Welcome back to Organizasso</CardDescription>
        </CardHeader>
        <CardContent>
           <LoginForm onSubmit={handleLogin} error={error} isLoading={isLoading} />
        </CardContent>
        <CardFooter style={footerStyle}>
           <p style={footerPStyle}>
             Don&apos;t have an account?{" "}
             <Link to="/register" style={footerLinkStyle}>
               Register here
             </Link>
           </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginPage;

