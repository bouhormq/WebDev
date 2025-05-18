import React, { useState, useEffect, useCallback } from 'react';
import { getThreadMessages } from '../../services/forumService'; // Removed getThreadDetails
import MessageList from './MessageList';
import Spinner from '../Common/Spinner';
import { Alert, AlertDescription } from "@/components/ui/alert"; // For errors

const ThreadDetailView = ({ threadId, originalThreadContent }) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRepliesData = useCallback(async () => {
    if (!threadId) return;
    setIsLoading(true);
    setError(null);
    try {
      // Only fetch replies (messages)
      const fetchedMessages = await getThreadMessages(threadId);
      let processedMessages = fetchedMessages;

      // If originalThreadContent is a non-empty string, 
      // filter out messages from the fetched list that have identical content.
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

  const handleReplySubmitted = async () => {
    // Re-fetch messages to include the new reply
    // forumService.postReply should handle the actual submission
    // This is called by ReplyForm (via MessageList)
    try {
      const updatedMessages = await getThreadMessages(threadId);
      setMessages(updatedMessages.map(msg => ({
        ...msg,
        createdAt: msg.createdAt ? new Date(msg.createdAt) : new Date()
      })));
    } catch (err) {
      console.error("Failed to refresh replies after submission", err);
      // Optionally show a toast or error message
    }
  };

  // --- Inline Styles ---
  const detailViewContainerStyle = { marginTop: '0.5rem', marginBottom: '1rem', padding: '0 0.5rem' }; // Adjusted margin
  const centeredFlexStyle = { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100px' };
  const repliesHeaderStyle = { fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }; // Adjusted margins
  // --- End Inline Styles ---

  if (!threadId) return null;

  if (error) {
    return (
      <Alert variant="destructive" style={{margin: '1rem'}}>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div style={detailViewContainerStyle}>
      {/* Original Post Content - REMOVED */}
      
      {/* Replies Section */}
      {isLoading ? (
        <div style={centeredFlexStyle}><Spinner /></div>
      ) : messages.length > 0 ? (
        <>
          <h3 style={repliesHeaderStyle}>Replies</h3>
          <MessageList 
            messages={messages} 
            threadId={threadId} 
            onReplySubmitted={handleReplySubmitted} 
          />
        </>
      ) : (
        !error && <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)', textAlign: 'center', padding: '1rem' }}>No replies yet.</p>
      )}
      {/* We don't show a specific error for replies not loading here, the main error handles it */}
    </div>
  );
};

export default ThreadDetailView; 