import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import RegisterForm from '../components/Auth/RegisterForm';
import useAuth from '../hooks/useAuth';
import { toast } from "sonner";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle } from 'lucide-react';

const RegisterPage = () => {
  const { register } = useAuth();
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    document.title = 'Register | Organizasso';
  }, []);

  const handleRegister = async (credentials) => {
    setError(null);
    setSuccessMessage('');
    setIsLoading(true);
    try {
      const result = await register(credentials.username, credentials.email, credentials.password);
      const message = result.message || "Registration request sent successfully.";
      console.log("Registration submitted:", message);
      setSuccessMessage(message);
      toast.success(message);
      // Don't redirect automatically, user needs approval
      // navigate('/login'); 
    } catch (err) {
      const errorMessage = err.message || "Registration failed. Please try again.";
      console.error("Registration failed:", errorMessage);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Inline Styles ---
  const pageStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    // bg-gradient lost
    backgroundColor: 'var(--background)', // Fallback bg
    padding: '1rem', // p-4
  };
  const cardStyle = {
      width: '100%',
      maxWidth: '24rem', // max-w-sm
      // shadow-lg is handled by Card component
  };
  const headerStyle = { textAlign: 'center' };
  const titleStyle = { fontSize: '1.5rem', fontWeight: 'bold' }; // text-2xl font-bold
  const successAlertStyle = { marginBottom: '1rem' }; // mb-4
  const successIconStyle = { height: '1.25rem', width: '1.25rem' }; // h-5 w-5
  const successLinkStyle = { fontWeight: 500, color: 'var(--primary)' }; // font-medium text-primary (hover:underline lost)
  const footerStyle = { display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '0.875rem' }; // flex flex-col items-center text-sm
  const footerPStyle = { color: 'var(--muted-foreground)' }; // text-muted-foreground
  const footerLinkStyle = { fontWeight: 500, color: 'var(--primary)' }; // font-medium text-primary (hover:underline lost)
  // --- End Inline Styles ---

  return (
    <div style={pageStyle}>
      <Card style={cardStyle}>
         <CardHeader style={headerStyle}>
           <CardTitle style={titleStyle}>Register</CardTitle>
           <CardDescription>Create your Organiz'asso account</CardDescription>
         </CardHeader>
         <CardContent>
            {successMessage ? (
                <Alert variant="success" style={successAlertStyle}>
                  <CheckCircle style={successIconStyle} />
                  <AlertTitle>Registration Submitted!</AlertTitle>
                  <AlertDescription>
                     {successMessage} You can now <Link to="/login" style={successLinkStyle}>login</Link> once an administrator approves your account.
                  </AlertDescription>
                </Alert>
            ) : (
                <RegisterForm onSubmit={handleRegister} error={error} isLoading={isLoading} />
            )}
         </CardContent>
         {!successMessage && (
            <CardFooter style={footerStyle}>
               <p style={footerPStyle}>
                  Already have an account?{" "}
                  <Link to="/login" style={footerLinkStyle}>
                    Login here
                  </Link>
                </p>
            </CardFooter>
         )}
       </Card>
    </div>
  );
};

export default RegisterPage;
