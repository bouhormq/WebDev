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
import { Send, Paperclip } from 'lucide-react';
import styles from './styles/NewThreadForm.module.css';

// Zod schema
const formSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters." }).max(150, { message: "Title cannot exceed 150 characters." }),
  content: z.string().min(10, { message: "Message content must be at least 10 characters." }).max(5000, { message: "Message content cannot exceed 5000 characters." }),
  imageFile: z.instanceof(File).optional(),
});

const NewThreadForm = ({ onSubmit, isLoading }) => {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
      imageFile: undefined,
    },
  });

  const [fileName, setFileName] = React.useState('');

  const handleFormSubmit = async (values) => {
    await onSubmit(values.title, values.content, values.imageFile);
    form.reset();
    setFileName('');
  };
  
  return (
    <div className={styles.formContainer}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className={styles.form}>
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className={styles.formItemFullWidth}>
                <FormLabel className="sr-only">Title</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Thread Title (optional, but recommended)" 
                    {...field} 
                    className={`${styles.inputBase} ${styles.titleInput}`} 
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
              <FormItem className={styles.formItemFullWidth}>
                <FormLabel className="sr-only">Content</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="What do you want to discuss?"
                    className={`${styles.inputBase} ${styles.contentTextarea}`}
                    {...field}
                    rows={4}
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
                <FormLabel htmlFor="thread-image-upload" className={styles.fileInputLabel}>
                  <Paperclip className={styles.paperclipIcon} />
                  Attach Image (Optional)
                  {fileName && <span className={styles.fileName}>{fileName}</span>}
                </FormLabel>
                <FormControl>
                  <Input
                    id="thread-image-upload"
                    type="file"
                    accept="image/*"
                    className={styles.fileInput}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        onChange(file);
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
          <div className={styles.buttonContainer}>
              <Button
                type="submit" 
                disabled={isLoading} 
                size="sm" 
                className={styles.submitButton}
              >
                  {isLoading ? (
                    <Spinner size="sm" className={styles.spinner} />
                  ) : (
                    <Send className={styles.icon} />
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