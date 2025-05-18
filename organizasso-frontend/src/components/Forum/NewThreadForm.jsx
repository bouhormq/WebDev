import React from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Textarea } from "@/components/ui/textarea";
import Spinner from '../Common/Spinner';
import { Send } from 'lucide-react';

// Zod schema (can be shared or redefined here if preferred)
const formSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters." }).max(150, { message: "Title cannot exceed 150 characters." }),
  content: z.string().min(10, { message: "Message content must be at least 10 characters." }).max(5000, { message: "Message content cannot exceed 5000 characters." }),
});

const NewThreadForm = ({ onSubmit, isLoading }) => {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
    },
  });

  const handleFormSubmit = async (values) => {
    await onSubmit(values);
    form.reset();
  };
  
  // --- Inline Styles (Updated) ---
  const formContainerStyle = {
    padding: '1rem',
    marginBottom: '1.5rem',
    backgroundColor: 'var(--card)', // This will be the background for the form area
  };
  const formStyle = { display: 'flex', flexDirection: 'column', gap: '1rem' };
  const inputBaseStyle = { // New base style for inputs
    width: '100%', 
    // If var(--card) is visually distinct and desired as input background, change to 'transparent'
    // and ensure var(--card) gives enough contrast for placeholder text.
    fontSize: '1rem', // Uniform font size for placeholder and input text
    padding: '0.75rem 1rem', // Consistent padding
    border: '1px solid var(--border)', // Standard border for inputs
    borderRadius: 'var(--radius)', // Standard radius
    boxSizing: 'border-box', // Add box-sizing
  };
  const titleInputStyle = { 
    ...inputBaseStyle 
  };
  const contentTextareaStyle = { 
    ...inputBaseStyle,
    resize: 'vertical', 
    minHeight: '100px',
  };
  const buttonContainerStyle = { 
    width: '100%', // Make button container same width as input fields
    display: 'flex', 
    justifyContent: 'flex-end', 
    paddingTop: '0.5rem' 
  };
  const iconStyle = { height: '1rem', width: '1rem', marginRight: '0.5rem' };
  const submitButtonStyle = { // Style for the submit button
    backgroundColor: '#000000', // Explicitly black
    color: '#FFFFFF', // Explicitly white text
    border: 'none', // Remove any default border
    borderRadius: 'var(--radius)', // Use theme radius for rounded corners (e.g., 6px or 0.375rem)
    // padding: '0.5rem 1rem', // Default padding is usually fine with size="sm"
  };
  // --- End Inline Styles ---

  return (
    <div style={formContainerStyle}> {/* Outer container with border and padding */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} style={formStyle}>
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem style={{ width: '100%' }}>
                <FormLabel className="sr-only">Title</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Thread Title (optional, but recommended)" 
                    {...field} 
                    style={titleInputStyle} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem style={{ width: '100%' }}>
                <FormLabel className="sr-only">Content</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="What do you want to discuss?"
                    style={contentTextareaStyle}
                    {...field}
                    rows={4} // Suggest initial rows
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div style={buttonContainerStyle}>
              <Button 
                type="submit" 
                disabled={isLoading} 
                size="sm" 
                style={submitButtonStyle} // Apply explicit button styles
              >
                  {isLoading ? (
                    <Spinner size="sm" style={{ marginRight: '0.5rem' }} />
                  ) : (
                    <Send style={iconStyle} />
                  )}
                  Post Thread
              </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default NewThreadForm; 