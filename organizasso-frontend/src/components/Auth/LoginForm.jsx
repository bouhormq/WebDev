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

  const formStyle = { padding: '1.5rem' }; // p-6
  const alertStyle = { marginBottom: '1rem' }; // mb-4
  const alertIconStyle = { height: '1rem', width: '1rem' }; // h-4 w-4
  const formItemStyle = { marginBottom: '1.5rem' }; // mb-6
  // Input pt-1 removed - spacing may be off
  const submitButtonStyle = { width: '100%', marginTop: '0.75rem' }; // Reduced from 1.5rem (mt-6 to mt-3)
  const spinnerStyle = { marginRight: '0.5rem' }; // mr-2
  const inputStyle = { width: '100%' }; // Added width: 100%

  return (
    <Form {...form}>
      <form onSubmit={handleFormSubmit} style={formStyle}>
        {error && (
          <Alert variant="destructive" style={alertStyle}>
            <AlertCircle style={alertIconStyle} />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem style={formItemStyle}>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="Enter your username" {...field} disabled={isLoading} style={inputStyle} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem style={formItemStyle}>
              <FormLabel>Password</FormLabel>
              {/* TODO: Add forgot password link maybe? */}
              <FormControl>
                <Input type="password" placeholder="Enter your password" {...field} disabled={isLoading} style={inputStyle} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" style={submitButtonStyle} disabled={isLoading}>
          {isLoading && <Spinner size="sm" style={spinnerStyle}/>}
          Login
        </Button>
      </form>
    </Form>
  );
};

export default LoginForm;
