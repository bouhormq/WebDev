import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import RegisterForm from '../components/Auth/RegisterForm';
import useAuth from '../hooks/useAuth';
import { toast } from "sonner";

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
    <div className="flex items-center justify-center min-h-screen bg-muted/40">
      <div className="w-full max-w-sm p-4">
         {/* Display success message if registration was submitted */}
         {successMessage ? (
            <div className="p-4 mb-4 text-sm text-green-800 rounded-lg bg-green-50 dark:bg-gray-800 dark:text-green-400" role="alert">
              <span className="font-medium">Success!</span> {successMessage}
              <p className="mt-2">You can now <Link to="/login" className="underline">login</Link> once an administrator approves your account.</p>
            </div>
          ) : (
             <RegisterForm onSubmit={handleRegister} error={error} isLoading={isLoading} />
          )}
        <div className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <Link to="/login" className="underline">
            Login here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
