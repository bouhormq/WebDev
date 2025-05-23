import React, { useState, useEffect, useCallback } from 'react';
import PageWrapper from '../components/Layout/PageWrapper';
import NewThreadForm from '../components/Forum/NewThreadForm';
import ThreadList from '../components/Forum/ThreadList';
import { getClosedForumThreads, createThread } from '../services/forumService';
import useAuth from '../hooks/useAuth';
import { toast } from "sonner";
import Spinner from '../components/Common/Spinner';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import styles from './styles/ClosedForumPage.module.css';
import { ShieldAlert } from 'lucide-react';

const ClosedForumPage = () => {
  const { currentUser, isAdmin } = useAuth();
  console.log('ClosedForumPage - currentUser from useAuth:', currentUser);
  console.log('ClosedForumPage - isAdmin from useAuth:', isAdmin);
  const [threads, setThreads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openThreadIds, setOpenThreadIds] = useState(new Set());

  useEffect(() => {
    document.title = 'Closed Forum 🛡️ | Organizasso';
  }, []);

  const fetchThreads = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedThreads = await getClosedForumThreads();
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

  const handleCreateThread = async (title, content, imageFile) => {
    if (!currentUser) {
      toast.error("You must be logged in to create a thread.");
      return;
    }
    if (!isAdmin) {
      toast.error("Only administrators can create threads in the closed forum.");
      return;
    }
    setIsSubmitting(true);
    try {
      await createThread('closed', title, content, imageFile);
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
        return prevIds;
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

  const handleDeleteThread = async (threadId) => {
    // This function is called by ThreadItem, which already handles the actual deletion and confirmation.
    // This parent handler just needs to refresh the list.
    console.log(`Thread deletion process completed for thread: ${threadId}, refreshing list.`);
    fetchThreads(); 
  };

  const handleDeleteMessage = async (messageId, threadId) => {
    console.log(`Attempting to delete message: ${messageId} from thread: ${threadId}`);
    toast.info(`Delete functionality for message ${messageId} is not yet implemented.`);
  };

  return (
    <PageWrapper className={styles.pageContainer}>
      <div className={styles.contentWrapper}>
        <div className={styles.headerDiv}>
          <h1 className={styles.h1Style}>
            <span role="img" aria-label="forum">📢</span> Closed Forum <ShieldAlert className={styles.shieldIcon} />
          </h1>
          <p className={styles.pMuted}>Administrator-only discussions, internal announcements, and board topics.</p>
        </div>

        {isAdmin && (
          <NewThreadForm 
            onSubmit={handleCreateThread} 
            isLoading={isSubmitting} 
            forumType="closed"
          />
        )}
        
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
            onReplyPosted={handleReplyPosted} 
            ensureThreadOpen={ensureThreadOpen} 
            forumType="closed"
            currentUserId={currentUser?._id}
            onDeleteThread={handleDeleteThread}
            onDeleteMessage={handleDeleteMessage}
          />
        )}
      </div>
    </PageWrapper>
  );
};

export default ClosedForumPage;
