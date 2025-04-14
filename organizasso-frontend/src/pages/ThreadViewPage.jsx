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

  return (
    <PageWrapper>
      <div className="mb-4">
        <Button variant="outline" size="sm" asChild>
            <Link to={backLink} className="inline-flex items-center">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Open Forum
            </Link>
        </Button>
      </div>

      {isLoading ? (
         <div className="flex justify-center items-center min-h-[400px]"><Spinner size="lg"/></div>
      ) : error ? (
         <div className="flex justify-center items-center min-h-[400px]">
           <Card className="w-full max-w-md text-center p-6">
             <CardHeader>
                <CardTitle className="text-xl font-semibold text-destructive">Error Loading Thread</CardTitle>
             </CardHeader>
             <CardContent>
                <p className="text-muted-foreground">{error}</p>
                 <Button variant="outline" size="sm" asChild className="mt-4">
                    <Link to="/forum/open">Go to Open Forum</Link>
                 </Button>
             </CardContent>
           </Card>
         </div>
      ) : (
        <div className="space-y-6">
           <h1 className="text-2xl sm:text-3xl font-bold tracking-tight border-b pb-4">{threadTitle}</h1>
           
           <MessageList 
              messages={messages} 
              currentUserId={currentUser?._id}
              onDeleteRequest={handleDeleteMessage} 
           />
           
           <Card className="mt-8">
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
