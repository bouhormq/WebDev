import React, { useState, useEffect } from 'react';
import PageWrapper from '../components/Layout/PageWrapper';
import ThreadList from '../components/Forum/ThreadList'; 
import { Button } from "@/components/ui/button";
// Import Dialog components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose // Import DialogClose for manual closing
} from "@/components/ui/dialog";
// Import Form components (assuming you have form setup)
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; // Import Textarea
import { createThread } from '../services/forumService'; // Use the service for CREATE
import { getOpenForumThreads } from '../services/forumService'; // Use the service for READ
import { toast } from "sonner";
import Spinner from '../components/Common/Spinner'; 
import { useNavigate } from 'react-router-dom'; // Import useNavigate

// Zod schema for validation
const formSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters." }).max(150, { message: "Title cannot exceed 150 characters." }),
  content: z.string().min(10, { message: "Message content must be at least 10 characters." }).max(5000, { message: "Message content cannot exceed 5000 characters." }),
});

const OpenForumPage = () => {
  const [threads, setThreads] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Start loading true
  const [error, setError] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false); // State to control Dialog
  const navigate = useNavigate(); // Hook for navigation

  // --- Form Setup ---
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
    },
  });
  const { isSubmitting } = form.formState; // Get submitting state

  // --- Fetch Threads ---
  const fetchThreads = async () => {
      setIsLoading(true);
      setError(null);
      try {
        console.log('OpenForumPage: Fetching threads from API...');
        const fetchedThreads = await getOpenForumThreads();
        // Convert date strings from backend to Date objects if necessary
        const formattedThreads = fetchedThreads.map(thread => ({
            ...thread,
            createdAt: thread.createdAt ? new Date(thread.createdAt) : null,
            // Use lastReplyAt from backend if available, otherwise createdAt
            lastPostTime: thread.lastReplyAt ? new Date(thread.lastReplyAt) : (thread.createdAt ? new Date(thread.createdAt) : null)
        }));
        setThreads(formattedThreads);
      } catch (err) {
        const message = err.message || "Failed to fetch open forum threads.";
        console.error(message, err);
        setError(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    };

  useEffect(() => {
    fetchThreads();
  }, []);

  // --- Submit Handler ---
  const onSubmit = async (values) => {
    try {
      console.log("Submitting new thread:", values);
      const newThread = await createThread('open', values.title, values.content);
      toast.success(`Thread "${newThread.title}" created successfully!`);
      form.reset(); // Reset form fields
      setIsDialogOpen(false); // Close dialog
      // Navigate to the newly created thread page
      navigate(`/forum/thread/${newThread._id}`); 
    } catch (err) {
      const message = err.message || "Failed to create thread.";
      console.error("Thread creation failed:", err);
      toast.error(message);
      // Optionally set a form-specific error: form.setError("root", { message });
    } // finally is handled by formState.isSubmitting
  };


  return (
    <PageWrapper>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold tracking-tight">Open Forum</h2>
        {/* Dialog Trigger Button */}
         <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
           <DialogTrigger asChild>
             <Button>Create New Thread</Button>
           </DialogTrigger>
           <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Start a New Discussion</DialogTitle>
              <DialogDescription>
                Create a new thread in the Open Forum. Enter a title and your initial message below.
              </DialogDescription>
            </DialogHeader>
            
             {/* New Thread Form */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Thread Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter a descriptive title..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Initial Message</FormLabel>
                      <FormControl>
                         <Textarea
                          placeholder="Start the discussion here..."
                          className="resize-none" // Optional: prevent manual resizing
                          rows={5} // Optional: suggest initial size
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <DialogFooter>
                   <DialogClose asChild>
                      <Button type="button" variant="outline" disabled={isSubmitting}>
                          Cancel
                      </Button>
                   </DialogClose>
                   <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? <Spinner size="sm" className="mr-2"/> : null}
                      Create Thread
                    </Button>
                </DialogFooter>
              </form>
            </Form>

          </DialogContent>
        </Dialog>
      </div>

      {isLoading && <div className="flex justify-center pt-8"><Spinner /></div>}
      {error && <p className="text-destructive text-center pt-8">Error: {error}</p>}
      {!isLoading && !error && (
         threads.length > 0 ? (
           <ThreadList threads={threads} forumType="open" />
        ) : (
          <p className="text-center text-muted-foreground pt-8">No threads found in the open forum yet. Be the first to create one!</p>
        )
      )}
    </PageWrapper>
  );
};

export default OpenForumPage;
