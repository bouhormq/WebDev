import React, { useState, useEffect, useCallback } from 'react';
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
import { createThread, getOpenForumThreads } from '../services/forumService'; // Use the service for CREATE and READ
import { toast } from "sonner";
import Spinner from '../components/Common/Spinner'; 
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { PlusCircle } from 'lucide-react'; // Icon for button
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
  const fetchThreads = useCallback(async () => { // Wrap in useCallback
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
    }, []); // Empty dependency array

  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]); // Depend on fetchThreads

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        {/* Page Title */}
        <div>
           <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Open Forum</h1>
           <p className="text-muted-foreground">Discuss topics relevant to all members.</p>
        </div>
        {/* New Thread Button & Dialog */}
         <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
           <DialogTrigger asChild>
             <Button size="sm">
                <PlusCircle className="mr-2 h-4 w-4" /> Create New Thread
             </Button>
           </DialogTrigger>
           <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Start a New Discussion</DialogTitle>
              <DialogDescription>
                Create a new thread in the Open Forum.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
                {/* Title Field */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter thread title..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 {/* Content Field */}
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Initial Message</FormLabel>
                      <FormControl>
                         <Textarea
                          placeholder="Start the discussion..."
                          className="resize-y min-h-[100px]" // Allow vertical resize
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <DialogFooter className="pt-4"> {/* Add padding top */}
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

      {/* Display Area: Loading, Error, Empty, List */}
      <div className="mt-4 min-h-[300px]"> {/* Add min-height */}
        {isLoading ? (
           <div className="flex justify-center items-center h-full"><Spinner size="lg"/></div>
        ) : error ? (
           <div className="flex justify-center items-center h-full">
             <Card className="w-full max-w-md text-center p-6">
               <CardHeader>
                  <CardTitle className="text-xl font-semibold text-destructive">Error Loading Forum</CardTitle>
               </CardHeader>
               <CardContent>
                  <p className="text-muted-foreground">{error}</p>
               </CardContent>
             </Card>
           </div>
        ) : threads.length > 0 ? (
           <ThreadList threads={threads} forumType="open" />
        ) : (
           <div className="flex justify-center items-center h-full">
             <Card className="w-full max-w-md text-center p-6">
                <CardHeader>
                   <CardTitle className="text-lg font-semibold">No Threads Yet</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                   <p className="text-muted-foreground">Be the first to start a discussion in the open forum.</p>
                   {/* Optionally repeat the button inside the card */}
                   <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger asChild>
                         <Button size="sm" variant="secondary">
                            <PlusCircle className="mr-2 h-4 w-4" /> Create Thread
                         </Button>
                      </DialogTrigger>
                      {/* DialogContent defined above */}
                   </Dialog>
                </CardContent>
             </Card>
           </div>
        )}
      </div>
    </PageWrapper>
  );
};

export default OpenForumPage;
