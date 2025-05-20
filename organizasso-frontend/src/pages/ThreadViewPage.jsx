import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import PageWrapper from '../components/Layout/PageWrapper';
import MessageList from '../components/Forum/MessageList';
import ReplyForm from '../components/Forum/ReplyForm';
import useAuth from '../hooks/useAuth';
import { getThreadMessages, postReply } from '../services/forumService';
import { deleteUserMessage } from '../services/userService';
import { toast } from "sonner";
import Spinner from '../components/Common/Spinner';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react'; // Import ArrowLeft
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ThreadViewPage = () => {
  const { threadId } = useParams();
  const { currentUser } = useAuth();
  const [threadTitle, setThreadTitle] = useState('Thread Details');
  const [messages, setMessages] = useState([]); // This will store the hierarchical messages
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPostingReply, setIsPostingReply] = useState(false); // Renamed for clarity

  const fetchThreadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log(`ThreadViewPage (${threadId}): Fetching messages from API...`);
      // Fetched messages are now expected to be hierarchical
      const fetchedMessages = await getThreadMessages(threadId);
      
      // The backend now structures messages, so less client-side formatting is needed here.
      // We still might want to process dates or ensure certain fields.
      const processMessages = (msgs) => {
        return msgs.map(msg => ({
          ...msg,
          createdAt: msg.createdAt ? new Date(msg.createdAt) : null,
          // Recursively process replies
          replies: msg.replies ? processMessages(msg.replies) : [] 
        }));
      };

      const hierarchicalMessages = processMessages(fetchedMessages);
      setMessages(hierarchicalMessages);

      // Determine thread title - assuming the first message is the original post
      // or that thread metadata (like title) might come with the messages payload or a separate call.
      // For now, if there are messages, we try to get title from the first one (original post).
      // If the backend provides thread metadata separately or as part of the main response, adjust this.
      if (hierarchicalMessages.length > 0 && hierarchicalMessages[0].threadTitle) {
        setThreadTitle(hierarchicalMessages[0].threadTitle);
      } else if (hierarchicalMessages.length > 0) {
        // Fallback if threadTitle is not directly on messages, but we have them.
        // This might need adjustment based on actual data structure for thread title.
        setThreadTitle(`Discussion in Thread ID: ${threadId}`); 
      } else {
        // If no messages, it could be an empty thread. A separate fetch for thread metadata (e.g., title)
        // would be ideal here. For now, using a placeholder.
        // TODO: Fetch thread title separately if messages are empty.
        setThreadTitle('Thread Details'); 
      }

    } catch (err) {
      const message = err.message || "Failed to fetch thread details.";
      console.error(message, err);
      setError(message);
      toast.error(message);
      setThreadTitle("Error Loading Thread");
    } finally {
      setIsLoading(false);
    }
  }, [threadId]);

  useEffect(() => {
    fetchThreadData();
  }, [fetchThreadData]);

  const handleReplySubmit = async (replyContent, parentId, imageFile) => {
    setIsPostingReply(true);
    try {
      console.log(`ThreadViewPage (${threadId}): Posting reply via API. ParentID: ${parentId}, Image: ${imageFile ? imageFile.name : 'none'}`);
      // The result of postReply isn't directly used here anymore, as we re-fetch.
      await postReply(threadId, replyContent, parentId, imageFile);
      
      // After a successful post, re-fetch all messages to get the updated hierarchy
      // This is simpler than trying to manually insert the new reply into the correct place in the local state tree.
      await fetchThreadData(); 
      toast.success("Reply posted successfully!");
      return true; 
    } catch (err) {
      const message = err.message || "Failed to post reply.";
      console.error(message, err);
      toast.error(message);
      return false;
    } finally {
      setIsPostingReply(false);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm("Are you sure you want to delete this message?")) {
      return;
    }
    toast.info("Deleting message...");
    try {
      console.log(`ThreadViewPage (${threadId}): Deleting message ${messageId} via API...`);
      await deleteUserMessage(messageId);
      // Re-fetch messages to reflect the deletion and any structural changes
      await fetchThreadData(); 
      toast.success("Message deleted successfully!");
    } catch (err) {
      const message = err.message || "Failed to delete message.";
      console.error(message, err);
      toast.error(message);
      // No need to revert local state if re-fetching
    }
  };

  const backLink = '/forum/open';

  // --- Inline Styles (keep as is or refactor to CSS modules/Tailwind) ---
  const backButtonDivStyle = { marginBottom: '1rem' };
  const backLinkStyle = { display: 'inline-flex', alignItems: 'center' };
  const backIconStyle = { marginRight: '0.5rem', height: '1rem', width: '1rem' };
  const centeredFlexMinHeightStyle = { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' };
  const errorCardStyle = { width: '100%', maxWidth: '32rem', textAlign: 'center', padding: '1.5rem' };
  const errorTitleStyle = { fontSize: '1.25rem', fontWeight: 600, color: 'var(--destructive)' };
  const errorPStyle = { color: 'var(--muted-foreground)' };
  const errorButtonStyle = { marginTop: '1rem' };
  const h1Style = { fontSize: '1.875rem', fontWeight: 'bold', letterSpacing: '-0.02em', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1.5rem' };
  // --- End Inline Styles ---

  return (
    <PageWrapper>
      <div style={backButtonDivStyle}>
        <Button variant="outline" size="sm" asChild>
          <Link to={backLink} style={backLinkStyle}>
            <ArrowLeft style={backIconStyle} /> Back to Open Forum
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div style={centeredFlexMinHeightStyle}><Spinner size="lg"/></div>
      ) : error ? (
        <div style={centeredFlexMinHeightStyle}>
          <Card style={errorCardStyle}>
            <CardHeader>
              <CardTitle style={errorTitleStyle}>Error Loading Thread</CardTitle>
            </CardHeader>
            <CardContent>
              <p style={errorPStyle}>{error}</p>
              <Button variant="outline" size="sm" asChild style={errorButtonStyle}>
                <Link to="/forum/open">Go to Open Forum</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div>
          <h1 style={h1Style}>{threadTitle}</h1>
          {/* MessageList now receives the potentially hierarchical messages array */}
          {console.log(`ThreadViewPage: currentUser before rendering MessageList:`, currentUser)}
          <MessageList
            messages={messages} // Pass the full, potentially hierarchical, list of messages
            threadId={threadId}
            onDirectReplySubmit={handleReplySubmit} // This will be used by ReplyForms within MessageList
            currentUserId={currentUser?._id}
            onDeleteRequest={handleDeleteMessage}
            replyFormIsLoading={isPostingReply} // Pass the loading state for reply forms
            // nestingLevel is managed internally by MessageList starting from 0
          />
        </div>
      )}
    </PageWrapper>
  );
};

export default ThreadViewPage;
