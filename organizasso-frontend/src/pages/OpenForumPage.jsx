import { useState, useEffect, useCallback } from 'react';
import PageWrapper from '../components/Layout/PageWrapper';
import NewThreadForm from '../components/Forum/NewThreadForm';
import ThreadList from '../components/Forum/ThreadList';
import { getOpenForumThreads, createThread } from '../services/forumService';
import useAuth from '../hooks/useAuth';
import { toast } from "sonner";
import Spinner from '../components/Common/Spinner';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import styles from './styles/OpenForumPage.module.css';

const OpenForumPage = () => {
  const { currentUser } = useAuth();
  const [threads, setThreads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openThreadIds, setOpenThreadIds] = useState(new Set()); // For toggling replies

  useEffect(() => {
    document.title = 'Open Forum 💬 | Organizasso';
  }, []);

  const fetchThreads = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedThreads = await getOpenForumThreads();
      setThreads(fetchedThreads.map(t => ({...t, lastPostTime: new Date(t.lastPostTime)})));
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

  // Corrected to accept title, content, imageFile as separate arguments
  const handleCreateThread = async (title, content, imageFile) => { 
    if (!currentUser) {
      toast.error("You must be logged in to create a thread.");
      return;
    }
    setIsSubmitting(true);
    try {
      await createThread('open', title, content, imageFile);
      toast.success("Thread created successfully! ✨");
      fetchThreads(); 
    } catch (err) {
      toast.error(err.message || "Failed to create thread.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleThreadClick = (threadId) => {
    setOpenThreadIds(prevIds => {
      const newIds = new Set(prevIds);
      if (newIds.has(threadId)) {
        newIds.delete(threadId);
      } else {
        newIds.add(threadId);
      }
      return newIds;
    });
  };

  const ensureThreadOpen = (threadId) => {
    setOpenThreadIds(prevIds => {
      if (prevIds.has(threadId)) {
        return prevIds; // Already open, no change needed to the set
      }
      const newIds = new Set(prevIds);
      newIds.add(threadId);
      return newIds;
    });
  };

  const handleReplyPosted = useCallback((threadId, newMessage) => {
    setThreads(prevThreads => 
      prevThreads.map(t => {
        if (t._id === threadId) {
          const newLastPostTime = newMessage?.createdAt ? new Date(newMessage.createdAt) : new Date();
          return {
            ...t,
            messageCount: (t.messageCount || 0) + 1,
            lastPostTime: newLastPostTime,
          };
        }
        return t;
      })
    );
  }, []);

  return (
    <PageWrapper className={styles.pageContainer}>
      <div className={styles.contentWrapper}>
        <div className={styles.headerDiv}>
          <h1 className={styles.h1Style}>
            <span role="img" aria-label="forum">📢</span> Open Forum 
          </h1>
          <p className={styles.pMuted}>Discuss topics relevant to all members. Share your thoughts and ideas!</p>
        </div>

        <NewThreadForm onSubmit={handleCreateThread} isLoading={isSubmitting} />
        
        <Separator className={styles.separator} />

        {isLoading && (
          <div className={styles.spinnerContainer}>
            <Spinner size="xl" />
          </div>
        )}
        {error && (
          <Alert className={styles.errorAlert}>
            <AlertDescription className={styles.errorAlertDesc}>{error}</AlertDescription>
          </Alert>
        )}
        {!isLoading && !error && (
          <ThreadList 
            threads={threads} 
            onThreadClick={handleThreadClick} 
            openThreadIds={openThreadIds}
            onReplyPosted={handleReplyPosted} // Pass the new handler here
            ensureThreadOpen={ensureThreadOpen} // Pass down the new function
          />
        )}
      </div>
    </PageWrapper>
  );
};

export default OpenForumPage;
