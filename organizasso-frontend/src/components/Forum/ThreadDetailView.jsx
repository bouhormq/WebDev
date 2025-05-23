import React, { useState, useEffect, useCallback } from 'react';
import { getThreadMessages } from '../../services/forumService';
import MessageList from './MessageList';
import Spinner from '../Common/Spinner';
import { Alert, AlertDescription } from "@/components/ui/alert"; // For errors
import styles from './styles/ThreadDetailView.module.css'; // Import CSS module

const ThreadDetailView = ({ threadId, originalThreadContent, onPostReply, isPostingReply, currentUserId, onDeleteMessage }) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRepliesData = useCallback(async () => {
    if (!threadId) return;
    setIsLoading(true);
    setError(null);
    try {
      const fetchedMessages = await getThreadMessages(threadId);
      let processedMessages = fetchedMessages;

      if (originalThreadContent && typeof originalThreadContent === 'string' && originalThreadContent.trim() !== '') {
        processedMessages = fetchedMessages.filter(msg => msg.content !== originalThreadContent);
      }
      
      setMessages(processedMessages.map(msg => ({
        ...msg,
        createdAt: msg.createdAt ? new Date(msg.createdAt) : new Date()
      })));
    } catch (err) {
      const errorMessage = err.message || 'Failed to load thread details.';
      console.error(errorMessage, err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [threadId, originalThreadContent]);

  useEffect(() => {
    fetchRepliesData();
  }, [fetchRepliesData]);

  if (!threadId) return null;

  if (error) {
    return (
      <Alert variant="destructive" className={styles.errorAlertStyle}>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={styles.detailViewContainerStyle}>
      {/* Replies Section */}
      {isLoading ? (
        <div className={styles.centeredFlexStyle}><Spinner /></div>
      ) : messages.length > 0 ? (
        <>
          <h3 className={styles.repliesHeaderStyle}>Replies</h3>
          <MessageList 
            messages={messages} 
            threadId={threadId} 
            onDirectReplySubmit={onPostReply} 
            replyFormIsLoading={isPostingReply} 
            currentUserId={currentUserId} 
            onDeleteRequest={onDeleteMessage} 
          />
        </>
      ) : (
        !error && <p className={styles.noRepliesTextStyle}>No replies yet.</p>
      )}
    </div>
  );
};

export default ThreadDetailView;