import React, { useState } from 'react';
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

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-muted/30 p-4">
      <Card className="w-full max-w-sm shadow-lg">
         <CardHeader className="text-center">
           <CardTitle className="text-2xl font-bold">Register</CardTitle>
           <CardDescription>Create your Organiz'asso account</CardDescription>
         </CardHeader>
         <CardContent>
            {successMessage ? (
                <Alert variant="success" className="mb-4">
                  <CheckCircle className="h-5 w-5" />
                  <AlertTitle>Registration Submitted!</AlertTitle>
                  <AlertDescription>
                     {successMessage} You can now <Link to="/login" className="font-medium text-primary hover:underline">login</Link> once an administrator approves your account.
                  </AlertDescription>
                </Alert>
            ) : (
                <RegisterForm onSubmit={handleRegister} error={error} isLoading={isLoading} />
            )}
         </CardContent>
         {!successMessage && (
            <CardFooter className="flex flex-col items-center text-sm">
               <p className="text-muted-foreground">
                  Already have an account?{" "}
                  <Link to="/login" className="font-medium text-primary hover:underline">
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
