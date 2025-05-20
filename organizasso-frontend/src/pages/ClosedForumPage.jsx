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
import styles from './ClosedForumPage.module.css';

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

  return (
    <PageWrapper className={styles.pageContainer}>
      <div className={styles.contentWrapper}>
        <div className={styles.headerDiv}>
          <h1 className={styles.h1Style}>
            <span role="img" aria-label="forum">📢</span> Closed Forum <ShieldAlert className={styles.shieldIcon} />
          </h1>
          <p className={styles.pMuted}>Confidential discussions for administrators only.</p>
        </div>

        <div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className={styles.formInputDiv}>
                <div className={styles.formLabel}>Title</div>
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder="Admin topic title (optional, but recommended)" {...field} className={`${styles.inputField} ${styles.formInputBackground}`} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className={styles.formInputDiv}>
                <div className={styles.formLabel}>Content</div>
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="Start the admin discussion here..."
                          className={`${styles.textareaField} ${styles.formInputBackground}`}
                          {...field}
                          rows={4}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className={styles.submitButtonContainer}>
                <Button type="submit" disabled={isSubmitting} size="sm" className={styles.submitButton}>
                  {isSubmitting ? <Spinner size="sm" className={styles.submitButtonSpinner} /> : <Send className={styles.submitButtonIcon} />}
                  Post Thread
                </Button>
              </div>
            </form>
          </Form>
        </div>

        <hr className={styles.separator} />

        <div className={styles.listContainer}>
          {isLoading ? (
            <div className={styles.spinnerContainer}><Spinner size="lg" /></div>
          ) : error ? (
            <div className={styles.centeredFlex}>
              <div className={`${styles.errorAlert} ${styles.errorContainer}`}>
                <h2 className={styles.errorTitle}>Error Loading Forum</h2>
                <p className={styles.errorAlertDesc}>{error}</p>
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
            <div className={styles.centeredFlex}>
              <div className={styles.noThreadsContainer}>
                <h2 className={styles.noThreadsTitle}>No Threads Yet</h2>
                <p className={`${styles.pMuted} ${styles.noThreadsParagraph}`}>No confidential discussions have been started.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
};

export default ClosedForumPage;
