import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LoginForm from '../components/Auth/LoginForm'; 
import useAuth from '../hooks/useAuth';
import { toast } from "sonner";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import styles from './styles/LoginPage.module.css';

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

  return (
    <div className={styles.pageStyle}>
      <Card className={styles.cardStyle}>
        <CardHeader className={styles.headerStyle}>
          <CardTitle className={styles.titleStyle}>Login</CardTitle>
          <CardDescription>Welcome back to Organizasso</CardDescription>
        </CardHeader>
        <CardContent>
           <LoginForm onSubmit={handleLogin} error={error} isLoading={isLoading} />
        </CardContent>
        <CardFooter className={styles.footerStyle}>
           <p className={styles.footerPStyle}>
             Don&apos;t have an account?{" "}
             <Link to="/register" className={styles.footerLinkStyle}>
               Register here
             </Link>
           </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginPage;

