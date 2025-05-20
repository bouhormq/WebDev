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
import { Send, Paperclip } from 'lucide-react'; // Added Paperclip

// Zod schema (can be shared or redefined here if preferred)
const formSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters." }).max(150, { message: "Title cannot exceed 150 characters." }),
  content: z.string().min(10, { message: "Message content must be at least 10 characters." }).max(5000, { message: "Message content cannot exceed 5000 characters." }),
  imageFile: z.instanceof(File).optional(), // Added for image upload
});

const NewThreadForm = ({ onSubmit, isLoading }) => {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
      imageFile: undefined, // Initialize imageFile
    },
  });

  const [fileName, setFileName] = React.useState('');

  const handleFormSubmit = async (values) => {
    // onSubmit expects (title, content, imageFile)
    // The imageFile is already in values.imageFile due to the form field
    await onSubmit(values.title, values.content, values.imageFile);
    form.reset();
    setFileName(''); // Reset file name display
  };
  
  // --- Inline Styles (Updated) ---
  const formContainerStyle = {
    padding: '1rem',
    marginBottom: '1.5rem',
    // backgroundColor: 'var(--card)', // Removing this as the card itself has the pastel brown
  };
  const formStyle = { display: 'flex', flexDirection: 'column', gap: '1rem' };
  const inputBaseStyle = { 
    width: '100%', 
    fontSize: '1rem', 
    padding: '0.75rem 1rem', 
    borderRadius: 'var(--radius)', 
    boxSizing: 'border-box',
    backgroundColor: '#FDFBF9', // New background color
    border: '1px solid #D3C1B1', // New border color
    color: '#333', // Ensuring text color is readable
    // Placeholder color is typically handled by the ::placeholder pseudo-element
    // but direct JS style for placeholder isn't possible. We'll rely on default or CSS if available.
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
  const fileInputLabelStyle = {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    color: '#555', // Darker grey for better visibility
    padding: '0.5rem 0',
    fontSize: '0.9rem',
  };

  const fileInputStyle = {
    display: 'none', // Hide the actual input
  };

  const fileNameStyle = {
    marginLeft: '0.5rem',
    fontStyle: 'italic',
    color: '#333',
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
                    onFocus={(e) => {
                      e.target.style.borderColor = '#00796B';
                      e.target.style.boxShadow = '0 0 0 1px #00796B';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#D3C1B1';
                      e.target.style.boxShadow = 'none';
                    }}
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
                    onFocus={(e) => {
                      e.target.style.borderColor = '#00796B';
                      e.target.style.boxShadow = '0 0 0 1px #00796B';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#D3C1B1';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="imageFile"
            render={({ field: { onChange, onBlur, name, ref } }) => (
              <FormItem>
                <FormLabel htmlFor="thread-image-upload" style={fileInputLabelStyle}>
                  <Paperclip style={{ ...iconStyle, marginRight: '0.25rem' }} />
                  Attach Image (Optional)
                  {fileName && <span style={fileNameStyle}>{fileName}</span>}
                </FormLabel>
                <FormControl>
                  <Input
                    id="thread-image-upload"
                    type="file"
                    accept="image/*"
                    style={fileInputStyle}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        onChange(file); // Update react-hook-form state
                        setFileName(file.name);
                      } else {
                        onChange(undefined);
                        setFileName('');
                      }
                    }}
                    onBlur={onBlur}
                    name={name}
                    ref={ref}
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