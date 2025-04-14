import React, { useState, useEffect, useCallback } from 'react';
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
import { PlusCircle, ShieldAlert } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

  const fetchThreads = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center">
            Closed Forum <ShieldAlert className="ml-2 h-6 w-6 text-destructive" />
          </h1>
          <p className="text-muted-foreground">Confidential discussions for administrators only.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <PlusCircle className="mr-2 h-4 w-4" /> Create New Admin Thread
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Start a New Admin Discussion</DialogTitle>
              <DialogDescription>
                Create a new thread in the Closed Forum (Admin Only).
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter admin topic title..." {...field} />
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
                          className="resize-y min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter className="pt-4">
                  <DialogClose asChild>
                    <Button type="button" variant="outline" disabled={isSubmitting}>
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? <Spinner size="sm" className="mr-2" /> : null}
                    Create Admin Thread
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-4 min-h-[300px]">
        {isLoading ? (
          <div className="flex justify-center items-center h-full"><Spinner size="lg" /></div>
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
          <ThreadList threads={threads} forumType="closed" />
        ) : (
           <div className="flex justify-center items-center h-full">
             <Card className="w-full max-w-md text-center p-6">
                <CardHeader>
                   <CardTitle className="text-lg font-semibold">No Threads Yet</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                   <p className="text-muted-foreground">No confidential discussions have been started.</p>
                   <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger asChild>
                         <Button size="sm" variant="secondary">
                            <PlusCircle className="mr-2 h-4 w-4" /> Create Admin Thread
                         </Button>
                      </DialogTrigger>
                   </Dialog>
                </CardContent>
             </Card>
           </div>
        )}
      </div>
    </PageWrapper>
  );
};

export default ClosedForumPage;
