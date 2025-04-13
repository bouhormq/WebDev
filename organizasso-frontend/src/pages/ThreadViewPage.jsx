import React, { useState, useEffect } from 'react';
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

const ThreadViewPage = () => {
  const { threadId } = useParams();
  const { currentUser } = useAuth();
  const threadTitle = `Thread ${threadId}`;
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isReplying, setIsReplying] = useState(false);

  useEffect(() => {
    const fetchThreadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        console.log(`ThreadViewPage (${threadId}): Fetching messages from API...`);
        const fetchedMessages = await getThreadMessages(threadId);
        const formattedMessages = fetchedMessages.map(msg => ({
            ...msg,
            createdAt: msg.createdAt ? new Date(msg.createdAt) : null,
            timestamp: msg.createdAt ? new Date(msg.createdAt) : null
        }));
        setMessages(formattedMessages);
      } catch (err) {
        const message = err.message || "Failed to fetch thread details.";
        console.error(message, err);
        setError(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchThreadData();
  }, [threadId]);

  const handleReplySubmit = async (replyContent) => {
    setIsReplying(true);
    try {
      console.log(`ThreadViewPage (${threadId}): Posting reply via API...`);
      const newReply = await postReply(threadId, replyContent);
      const formattedReply = {
         ...newReply,
         createdAt: newReply.createdAt ? new Date(newReply.createdAt) : null,
         timestamp: newReply.createdAt ? new Date(newReply.createdAt) : null
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

  return (
    <PageWrapper>
      <div className="mb-4">
        <Button variant="outline" size="sm" asChild>
            <Link to={backLink}>
                &larr; Back to Forum
            </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center pt-8"><Spinner /></div>
      ) : error ? (
        <p className="text-destructive text-center pt-8">Error: {error}</p>
      ) : (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold tracking-tight border-b pb-2">{threadTitle}</h2>
          
          <MessageList 
            messages={messages} 
            currentUserId={currentUser?._id}
            onDeleteRequest={handleDeleteMessage} 
          />
          
          <ReplyForm 
            threadId={threadId} 
            onReplySubmit={handleReplySubmit} 
            isLoading={isReplying}
          />
        </div>
      )}
    </PageWrapper>
  );
};

export default ThreadViewPage;
