import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import RegisterForm from '../components/Auth/RegisterForm';
import useAuth from '../hooks/useAuth';
import { toast } from "sonner";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle } from 'lucide-react';
import styles from './styles/RegisterPage.module.css'; // Import CSS module

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
    <div className={styles.pageStyle}>
      <Card className={styles.cardStyle}>
         <CardHeader className={styles.headerStyle}>
           <CardTitle className={styles.titleStyle}>Register</CardTitle>
           <CardDescription>Create your Organiz\\'asso account</CardDescription>
         </CardHeader>
         <CardContent>
            {successMessage ? (
                <Alert variant="success" className={styles.successAlertStyle}>
                  <CheckCircle className={styles.successIconStyle} />
                  <AlertTitle>Registration Submitted!</AlertTitle>
                  <AlertDescription>
                     {successMessage} You can now <Link to="/login" className={styles.successLinkStyle}>login</Link> once an administrator approves your account.
                  </AlertDescription>
                </Alert>
            ) : (
                <RegisterForm onSubmit={handleRegister} error={error} isLoading={isLoading} />
            )}
         </CardContent>
         {!successMessage && (
            <CardFooter className={styles.footerStyle}>
               <p className={styles.footerPStyle}>
                  Already have an account?{" "}
                  <Link to="/login" className={styles.footerLinkStyle}>
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
