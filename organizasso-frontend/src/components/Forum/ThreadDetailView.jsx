import React, { useState, useEffect, useCallback } from 'react';
import { getThreadMessages } from '../../services/forumService';
import MessageList from './MessageList';
import Spinner from '../Common/Spinner';
import { Alert, AlertDescription } from "@/components/ui/alert"; // For errors

const ThreadDetailView = ({ threadId, originalThreadContent, onPostReply, isPostingReply, currentUserId, onDeleteMessage }) => { // Added currentUserId and onDeleteMessage
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

  // --- Inline Styles ---
  const detailViewContainerStyle = { marginTop: '0.5rem', marginBottom: '1rem', padding: '0 0.5rem' };
  const centeredFlexStyle = { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100px' };
  const repliesHeaderStyle = { fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' };
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
      {/* Replies Section */}
      {isLoading ? (
        <div style={centeredFlexStyle}><Spinner /></div>
      ) : messages.length > 0 ? (
        <>
          <h3 style={repliesHeaderStyle}>Replies</h3>
          <MessageList 
            messages={messages} 
            threadId={threadId} 
            onDirectReplySubmit={onPostReply} // Pass onPostReply as onDirectReplySubmit
            replyFormIsLoading={isPostingReply} // Pass isPostingReply as replyFormIsLoading
            currentUserId={currentUserId} // Pass currentUserId down
            onDeleteRequest={onDeleteMessage} // Pass onDeleteMessage as onDeleteRequest to MessageList
          />
        </>
      ) : (
        !error && <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)', textAlign: 'center', padding: '1rem' }}>No replies yet.</p>
      )}
    </div>
  );
};

export default ThreadDetailView;