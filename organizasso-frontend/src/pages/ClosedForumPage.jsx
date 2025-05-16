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
  DialogClose,
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
        lastPostTime: thread.lastReplyAt ? new Date(thread.lastReplyAt) : (thread.createdAt ? new Date(thread.createdAt) : null),
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

  // --- Inline Styles ---
  const headerDivStyle = { display: 'flex', flexDirection: 'column', marginBottom: '1.5rem', gap: '1rem' }; // flex flex-col mb-6 gap-4 (responsive lost)
  const h1Style = { fontSize: '1.875rem', fontWeight: 'bold', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center' }; // text-3xl font-bold tracking-tight flex items-center (sm size lost)
  const shieldIconStyle = { marginLeft: '0.5rem', height: '1.5rem', width: '1.5rem', color: 'var(--destructive)' }; // ml-2 h-6 w-6 text-destructive
  const pMutedStyle = { color: 'var(--muted-foreground)' };
  const plusIconStyle = { marginRight: '0.5rem', height: '1rem', width: '1rem' }; // mr-2 h-4 w-4
  const dialogContentStyle = { maxWidth: '28rem' }; // sm:max-w-md
  const dialogFormStyle = { paddingTop: '0.5rem', paddingBottom: '0.5rem' }; // py-2 (space-y lost)
  const dialogTextareaStyle = { resize: 'vertical', minHeight: '100px' }; // resize-y min-h-[100px]
  const dialogFooterStyle = { paddingTop: '1rem' }; // pt-4
  const spinnerStyle = { marginRight: '0.5rem' }; // mr-2
  const listContainerStyle = { marginTop: '1rem', minHeight: '300px' }; // mt-4 min-h-[300px]
  const centeredFlexStyle = { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' };
  const feedbackCardStyle = { width: '100%', maxWidth: '32rem', textAlign: 'center', padding: '1.5rem' }; // w-full max-w-md text-center p-6
  const errorTitleStyle = { fontSize: '1.25rem', fontWeight: 600, color: 'var(--destructive)' }; // text-xl font-semibold text-destructive
  const emptyTitleStyle = { fontSize: '1.125rem', fontWeight: 600 }; // text-lg font-semibold
  const emptyContentStyle = {}; // space-y-4 lost, would need margin on children
  // --- End Inline Styles ---

  return (
    <PageWrapper>
      <div style={headerDivStyle}>
        <div>
          <h1 style={h1Style}>
            Closed Forum <ShieldAlert style={shieldIconStyle} />
          </h1>
          <p style={pMutedStyle}>Confidential discussions for administrators only.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <PlusCircle style={plusIconStyle} /> Create New Admin Thread
            </Button>
          </DialogTrigger>
          <DialogContent style={dialogContentStyle}>
            <DialogHeader>
              <DialogTitle>Start a New Admin Discussion</DialogTitle>
              <DialogDescription>
                Create a new thread in the Closed Forum (Admin Only).
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} style={dialogFormStyle}>
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem style={{ marginBottom: '1rem' }}>
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
                    <FormItem style={{ marginBottom: '1rem' }}>
                      <FormLabel>Initial Message</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Start the admin discussion here..."
                          style={dialogTextareaStyle}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter style={dialogFooterStyle}>
                  <DialogClose asChild>
                    <Button type="button" variant="outline" disabled={isSubmitting}>
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? <Spinner size="sm" style={spinnerStyle} /> : null}
                    Create Admin Thread
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div style={listContainerStyle}>
        {isLoading ? (
          <div style={centeredFlexStyle}><Spinner size="lg" /></div>
        ) : error ? (
          <div style={centeredFlexStyle}>
            <Card style={feedbackCardStyle}>
              <CardHeader>
                <CardTitle style={errorTitleStyle}>Error Loading Forum</CardTitle>
              </CardHeader>
              <CardContent>
                <p style={pMutedStyle}>{error}</p>
              </CardContent>
            </Card>
          </div>
        ) : threads.length > 0 ? (
          <ThreadList threads={threads} forumType="closed" />
        ) : (
          <div style={centeredFlexStyle}>
            <Card style={feedbackCardStyle}>
              <CardHeader>
                <CardTitle style={emptyTitleStyle}>No Threads Yet</CardTitle>
              </CardHeader>
              <CardContent style={emptyContentStyle}>
                <p style={{ ...pMutedStyle, marginBottom: '1rem' }}>No confidential discussions have been started.</p>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="secondary">
                      <PlusCircle style={plusIconStyle} /> Create Admin Thread
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
