import React, { useState, useEffect, useCallback } from 'react';
import PageWrapper from '../components/Layout/PageWrapper';
import NewThreadForm from '../components/Forum/NewThreadForm';
import ThreadList from '../components/Forum/ThreadList';
import { getClosedForumThreads, createThread } from '../services/forumService'; // Updated import
import useAuth from '../hooks/useAuth';
import { toast } from "sonner";
import Spinner from '../components/Common/Spinner';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import styles from './ClosedForumPage.module.css'; // Updated CSS import
import { Send, ShieldAlert } from 'lucide-react';

const ClosedForumPage = () => { // Renamed component
  const { currentUser, isAdmin } = useAuth(); // Use isAdmin directly from AuthContext
  console.log('ClosedForumPage - currentUser from useAuth:', currentUser);
  console.log('ClosedForumPage - isAdmin from useAuth:', isAdmin);
  const [threads, setThreads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openThreadIds, setOpenThreadIds] = useState(new Set()); // For toggling replies

  useEffect(() => {
    document.title = 'Closed Forum 🛡️ | Organizasso'; // Updated document title
  }, []);

  const fetchThreads = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedThreads = await getClosedForumThreads(); // Updated service call
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
    if (!isAdmin) { // Admin check using isAdmin from AuthContext
      toast.error("Only administrators can create threads in the closed forum.");
      return;
    }
    setIsSubmitting(true);
    try {
      await createThread('closed', title, content, imageFile); // Updated forumType to 'closed'
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
    // Update the specific thread in the local state
    setThreads(prevThreads => 
      prevThreads.map(t => {
        if (t._id === threadId) {
          // Increment messageCount and update lastPostTime
          // If newMessage has a createdAt, use that, otherwise use current time
          const newLastPostTime = newMessage?.createdAt ? new Date(newMessage.createdAt) : new Date();
          return {
            ...t,
            messageCount: (t.messageCount || 0) + 1,
            lastPostTime: newLastPostTime,
            // Potentially update other fields if your newMessage object contains them
            // e.g., lastReplier: newMessage.author.displayName,
          };
        }
        return t;
      })
    );
    // No need to call fetchThreads() if we update locally, unless ThreadDetailView needs it.
    // The key change in ThreadItem should refresh ThreadDetailView for that specific item.
    // toast.info(\"Refreshing threads after new reply...\");
    // fetchThreads();
  }, []);

  // Placeholder for future implementation
  const handleDeleteThread = async (threadId) => {
    // Logic to delete a thread (e.g., call a service, update state)
    // For now, it can be a placeholder or log a message
    console.log(`Attempting to delete thread: ${threadId}`);
    toast.info(`Delete functionality for thread ${threadId} is not yet implemented.`);
    // Example:
    // try {
    //   await deleteThreadService(threadId, 'closed');
    //   toast.success("Thread deleted successfully.");
    //   fetchThreads(); // Refresh threads list
    // } catch (err) {
    //   toast.error(err.message || "Failed to delete thread.");
    // }
  };

  // Placeholder for future implementation
  const handleDeleteMessage = async (messageId, threadId) => {
    // Logic to delete a message (e.g., call a service, update state)
    // For now, it can be a placeholder or log a message
    console.log(`Attempting to delete message: ${messageId} from thread: ${threadId}`);
    toast.info(`Delete functionality for message ${messageId} is not yet implemented.`);
    // Example:
    // try {
    //   await deleteMessageService(messageId, threadId, 'closed');
    //   toast.success("Message deleted successfully.");
    //   // Optionally, refresh the specific thread's messages or the entire thread list
    //   // This might involve a more granular update than fetchThreads()
    //   // For simplicity, you might refetch the thread details or all threads
    //   fetchThreads(); 
    // } catch (err) {
    //   toast.error(err.message || "Failed to delete message.");
    // }
  };

  return (
    <PageWrapper className={styles.pageContainer}>
      <div className={styles.contentWrapper}>
        <div className={styles.headerDiv}>
          <h1 className={styles.h1Style}>
            <span role="img" aria-label="forum">📢</span> Closed Forum <ShieldAlert className={styles.shieldIcon} />
          </h1>
          <p className={styles.pMuted}>Administrator-only discussions, internal announcements, and board topics.</p> {/* Updated descriptive text */}
        </div>

        {isAdmin && ( /* Conditionally render NewThreadForm for admins using isAdmin from AuthContext */
          <NewThreadForm 
            onSubmit={handleCreateThread} 
            isLoading={isSubmitting} 
            forumType="closed" /* Pass forumType prop */
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
            forumType="closed" // Pass forumType prop
            currentUserId={currentUser?._id} // Pass currentUserId
            onDeleteThread={handleDeleteThread} // Pass onDeleteThread
            onDeleteMessage={handleDeleteMessage} // Pass onDeleteMessage
          />
        )}
      </div>
    </PageWrapper>
  );
};

export default ClosedForumPage; // Updated export
