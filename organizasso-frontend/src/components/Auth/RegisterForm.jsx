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

// Zod schema for registration validation
const registerSchema = z.object({
  username: z.string()
    .min(3, { message: "Username must be at least 3 characters." })
    .max(30, { message: "Username cannot exceed 30 characters." })
    .regex(/^[a-zA-Z0-9_]+$/, { message: "Username can only contain letters, numbers, and underscores." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"], // Attach error to confirmPassword field
});

const RegisterForm = ({ onSubmit, error, isLoading }) => {
  const form = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  // Use form's handleSubmit
  const handleFormSubmit = form.handleSubmit(onSubmit);

  // Inline styles
  const alertStyle = { marginBottom: '1rem' }; // mb-4
  const alertIconStyle = { height: '1rem', width: '1rem' }; // h-4 w-4
  const formItemStyle = { marginBottom: '1rem' }; // approximation for space-y-4
  const submitButtonStyle = { width: '100%' }; // w-full
  const spinnerStyle = { marginRight: '0.5rem' }; // mr-2

  return (
    <Form {...form}>
      {/* Removed space-y-4 from form, using margin on items */}
      <form onSubmit={handleFormSubmit}>
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
                <Input placeholder="Choose a username" {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem style={formItemStyle}>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="your@email.com" {...field} disabled={isLoading} />
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
              <FormControl>
                <Input type="password" placeholder="Choose a password (min 6 chars)" {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem style={formItemStyle}>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Retype your password" {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" style={submitButtonStyle} disabled={isLoading}>
          {isLoading && <Spinner size="sm" style={spinnerStyle}/>}
          Create Account
        </Button>
      </form>
    </Form>
  );
};

export default RegisterForm;
