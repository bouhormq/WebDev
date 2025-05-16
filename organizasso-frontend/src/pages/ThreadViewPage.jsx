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
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ThreadViewPage = () => {
  const { threadId } = useParams();
  const { currentUser } = useAuth();
  const [threadTitle, setThreadTitle] = useState(`Thread Details`);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isReplying, setIsReplying] = useState(false);

  const fetchThreadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log(`ThreadViewPage (${threadId}): Fetching messages from API...`);
      const fetchedMessages = await getThreadMessages(threadId);
      const formattedMessages = fetchedMessages.map(msg => ({
        ...msg,
        _id: msg._id,
        createdAt: msg.createdAt ? new Date(msg.createdAt) : null,
        authorName: msg.authorName || 'Unknown',
      }));
      setMessages(formattedMessages);
      if (formattedMessages.length > 0) {
        setThreadTitle(formattedMessages[0].threadTitle || `Discussion (${formattedMessages.length} messages)`);
      } else {
        setThreadTitle('Empty Thread');
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

  const handleReplySubmit = async (replyContent) => {
    setIsReplying(true);
    try {
      console.log(`ThreadViewPage (${threadId}): Posting reply via API...`);
      const newReply = await postReply(threadId, replyContent);
      const formattedReply = {
        ...newReply,
        _id: newReply._id,
        createdAt: newReply.createdAt ? new Date(newReply.createdAt) : null,
        authorName: newReply.authorName || currentUser?.username || 'You',
        threadId: threadId,
        threadTitle: threadTitle,
      };
      setMessages(prevMessages => [...prevMessages, formattedReply]);
      toast.success("Reply posted successfully!");
      return true;
    } catch (err) {
      const message = err.message || "Failed to post reply.";
      console.error(message, err);
      toast.error(message);
      return false;
    } finally {
      setIsReplying(false);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm("Are you sure you want to delete this message?")) {
      return;
    }

    const originalMessages = messages;
    setMessages(prev => prev.filter(msg => msg._id !== messageId));
    toast.info("Deleting message...");

    try {
      console.log(`ThreadViewPage (${threadId}): Deleting message ${messageId} via API...`);
      await deleteUserMessage(messageId);
      toast.success("Message deleted successfully!");
    } catch (err) {
      const message = err.message || "Failed to delete message.";
      console.error(message, err);
      toast.error(message);
      setMessages(originalMessages);
    }
  };

  const backLink = '/forum/open';

  // --- Inline Styles ---
  const backButtonDivStyle = { marginBottom: '1rem' }; // mb-4
  const backLinkStyle = { display: 'inline-flex', alignItems: 'center' }; // inline-flex items-center
  const backIconStyle = { marginRight: '0.5rem', height: '1rem', width: '1rem' }; // mr-2 h-4 w-4
  const centeredFlexMinHeightStyle = { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' };
  const errorCardStyle = { width: '100%', maxWidth: '32rem', textAlign: 'center', padding: '1.5rem' }; // w-full max-w-md text-center p-6
  const errorTitleStyle = { fontSize: '1.25rem', fontWeight: 600, color: 'var(--destructive)' }; // text-xl font-semibold text-destructive
  const errorPStyle = { color: 'var(--muted-foreground)' }; // text-muted-foreground
  const errorButtonStyle = { marginTop: '1rem' }; // mt-4
  // space-y-6 lost
  const h1Style = { fontSize: '1.875rem', fontWeight: 'bold', letterSpacing: '-0.02em', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1.5rem' }; // text-3xl font-bold tracking-tight border-b pb-4 (added margin for space-y)
  const replyCardStyle = { marginTop: '2rem' }; // mt-8 (adjusted for space-y)
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
        // space-y-6 lost, approximated with margins
        <div>
          <h1 style={h1Style}>{threadTitle}</h1>

          {/* Added margin bottom to simulate space-y-6 */}
          <div style={{ marginBottom: '1.5rem' }}>
            <MessageList
              messages={messages}
              currentUserId={currentUser?._id}
              onDeleteRequest={handleDeleteMessage}
            />
          </div>

          <Card style={replyCardStyle}>
            <ReplyForm
              threadId={threadId}
              onReplySubmit={handleReplySubmit}
              isLoading={isReplying}
            />
          </Card>
        </div>
      )}
    </PageWrapper>
  );
};

export default ThreadViewPage;
