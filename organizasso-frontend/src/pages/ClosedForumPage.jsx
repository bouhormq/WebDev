import React, { useState, useEffect, useCallback } from 'react';
import PageWrapper from '../components/Layout/PageWrapper';
import ThreadList from '../components/Forum/ThreadList';
import { Button } from "@/components/ui/button";
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
import { Send, ShieldAlert } from 'lucide-react';

const formSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters." }).max(150, { message: "Title cannot exceed 150 characters." }),
  content: z.string().min(10, { message: "Message content must be at least 10 characters." }).max(5000, { message: "Message content cannot exceed 5000 characters." }),
});

const ClosedForumPage = () => {
  const [threads, setThreads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openThreadIds, setOpenThreadIds] = useState(new Set());

  useEffect(() => {
    document.title = 'Closed Forum | Organizasso';
  }, []);

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
      await fetchThreads();
    } catch (err) {
      const message = err.message || "Failed to create closed thread.";
      console.error("Closed thread creation failed:", err);
      toast.error(message);
    }
  };

  const handleInlineThreadView = (threadId) => {
    setOpenThreadIds(prevOpenThreadIds => {
      const newOpenThreadIds = new Set(prevOpenThreadIds);
      if (newOpenThreadIds.has(threadId)) {
        newOpenThreadIds.delete(threadId);
      } else {
        newOpenThreadIds.add(threadId);
      }
      return newOpenThreadIds;
    });
  };

  // --- Inline Styles ---
  const h1Style = { fontSize: '1.875rem', fontWeight: 'bold', letterSpacing: '-0.02em' };
  const pMutedStyle = { color: 'var(--muted-foreground)' };
  const listContainerStyle = { marginTop: '1rem', minHeight: '300px' };
  const centeredFlexStyle = { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' };
  // --- End Inline Styles ---

  return (
    <PageWrapper>
      <div style={{
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '1.5rem',
        position: 'relative',
        zIndex: 0
      }}>
        <div>
          <h1 style={h1Style}>
            Closed Forum <ShieldAlert style={{ marginLeft: '0.5rem', height: '1.5rem', width: '1.5rem', color: 'var(--destructive)' }} />
          </h1>
          <p style={pMutedStyle}>Confidential discussions for administrators only.</p>
        </div>
      </div>

      <div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontWeight: 500, marginBottom: '0.5rem' }}>Title</div>
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Admin topic title (optional, but recommended)" {...field} style={{ width: '100%' }} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontWeight: 500, marginBottom: '0.5rem' }}>Content</div>
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="Start the admin discussion here..."
                        style={{ width: '100%', minHeight: '100px', resize: 'vertical' }}
                        {...field}
                        rows={4}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button type="submit" disabled={isSubmitting} size="sm" style={{ 
                backgroundColor: '#000000', 
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 'var(--radius)'
              }}>
                {isSubmitting ? <Spinner size="sm" style={{ marginRight: '0.5rem' }} /> : <Send style={{ marginRight: '0.5rem', height: '1rem', width: '1rem' }} />}
                Post Thread
              </Button>
            </div>
          </form>
        </Form>
      </div>

      <hr 
        style={{
          width: 'calc(100% + 2rem)', 
          marginLeft: '-1rem',      
          marginRight: '-1rem',     
          marginTop: '2rem',
          marginBottom: '2rem',
          borderColor: 'var(--border)',
          borderWidth: '0 0 0.5px 0', 
          borderStyle: 'solid'
        }}
      />

      <div style={listContainerStyle}>
        {isLoading ? (
          <div style={centeredFlexStyle}><Spinner size="lg" /></div>
        ) : error ? (
          <div style={centeredFlexStyle}>
            <div style={{ width: '100%', maxWidth: '32rem', textAlign: 'center', padding: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--destructive)', marginBottom: '0.5rem' }}>Error Loading Forum</h2>
              <p style={pMutedStyle}>{error}</p>
            </div>
          </div>
        ) : threads.length > 0 ? (
          <ThreadList 
            threads={threads} 
            forumType="closed" 
            onThreadClick={handleInlineThreadView}
            openThreadIds={openThreadIds}
          />
        ) : (
          <div style={centeredFlexStyle}>
            <div style={{ width: '100%', maxWidth: '32rem', textAlign: 'center', padding: '1.5rem' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>No Threads Yet</h2>
              <p style={{ ...pMutedStyle, marginBottom: '1rem' }}>No confidential discussions have been started.</p>
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

export default ClosedForumPage;
