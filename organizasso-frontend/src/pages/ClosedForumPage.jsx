import React, { useState, useEffect } from 'react';
import PageWrapper from '../components/Layout/PageWrapper';
import ThreadList from '../components/Forum/ThreadList';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
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
import { Textarea } from "@/components/ui/textarea";
import { createThread, getClosedForumThreads } from '../services/forumService';
import { toast } from "sonner";
import Spinner from '../components/Common/Spinner';
import { useNavigate } from 'react-router-dom';

const formSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters." }).max(150, { message: "Title cannot exceed 150 characters." }),
  content: z.string().min(10, { message: "Message content must be at least 10 characters." }).max(5000, { message: "Message content cannot exceed 5000 characters." }),
});

const ClosedForumPage = () => {
  const [threads, setThreads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const navigate = useNavigate();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
    },
  });
  const { isSubmitting } = form.formState;

  const fetchThreads = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('ClosedForumPage: Fetching threads from API...');
      const fetchedThreads = await getClosedForumThreads();
      const formattedThreads = fetchedThreads.map(thread => ({
          ...thread,
          createdAt: thread.createdAt ? new Date(thread.createdAt) : null,
          lastPostTime: thread.lastReplyAt ? new Date(thread.lastReplyAt) : (thread.createdAt ? new Date(thread.createdAt) : null)
      }));
      setThreads(formattedThreads);
    } catch (err) {
      const message = err.message || "Failed to fetch closed forum threads.";
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

  const onSubmit = async (values) => {
    try {
      console.log("Submitting new closed thread:", values);
      const newThread = await createThread('closed', values.title, values.content);
      toast.success(`Admin thread "${newThread.title}" created successfully!`);
      form.reset();
      setIsDialogOpen(false);
      navigate(`/forum/thread/${newThread._id}`);
    } catch (err) {
      const message = err.message || "Failed to create closed thread.";
      console.error("Closed thread creation failed:", err);
      toast.error(message);
    }
  };

  return (
    <PageWrapper>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold tracking-tight">Closed Forum <span className="text-destructive">(Admin Only)</span></h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Create New Admin Thread</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Start a New Admin Discussion</DialogTitle>
              <DialogDescription>
                 Create a new thread in the Closed Forum (Admin Only).
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Thread Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter an admin topic title..." {...field} />
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
                          placeholder="Start the admin discussion here..."
                          className="resize-none"
                          rows={5}
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
                      Create Admin Thread
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
          <ThreadList threads={threads} forumType="closed" />
        ) : (
           <p className="text-center text-muted-foreground pt-8">No threads found in the closed forum yet.</p>
        )
      )}
    </PageWrapper>
  );
};

export default ClosedForumPage;
