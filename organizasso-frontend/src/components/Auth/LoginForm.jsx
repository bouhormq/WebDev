import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Spinner from '../Common/Spinner';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import styles from './styles/LoginForm.module.css';

// Zod schema for login validation
const loginSchema = z.object({
  username: z.string().min(1, { message: "Username is required." }),
  password: z.string().min(1, { message: "Password is required." }),
});

const LoginForm = ({ onSubmit, error, isLoading }) => {
  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  // Use form's handleSubmit which validates before calling our onSubmit
  const handleFormSubmit = form.handleSubmit(onSubmit);

  return (
    <Form {...form}>
      <form onSubmit={handleFormSubmit} className={styles.loginFormContainer}>
        {error && (
          <Alert variant="destructive" className={styles.alert}>
            <AlertCircle className={styles.alertIcon} />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem className={styles.formItem}>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="Enter your username" {...field} disabled={isLoading} className={styles.inputField} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem className={styles.formItem}>
              <FormLabel>Password</FormLabel>
              {/* TODO: Add forgot password link maybe? */}
              <FormControl>
                <Input type="password" placeholder="Enter your password" {...field} disabled={isLoading} className={styles.inputField} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className={styles.submitButton} disabled={isLoading}>
          {isLoading && <Spinner size="sm" className={styles.spinner}/>}
          Login
        </Button>
      </form>
    </Form>
  );
};

export default LoginForm;
