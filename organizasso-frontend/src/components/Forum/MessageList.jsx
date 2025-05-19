import React from 'react';
import MessageItem from './MessageItem';
import { Separator } from "@/components/ui/separator";
import ReplyForm from './ReplyForm';
import { postReply } from '../../services/forumService';

const MessageList = ({ messages, threadId, onReplySubmitted, currentUserId, onDeleteRequest, nestingLevel = 0 }) => {
  const noMessagesStyle = { color: 'var(--muted-foreground)', padding: '1rem 0' };

  const handleDirectReply = async (content) => {
    if (!threadId || !content.trim()) return;
    try {
      await postReply(threadId, content);
      if (onReplySubmitted) {
        await onReplySubmitted();
      }
    } catch (err) {
      // Optionally show a toast or error message
      console.error('Failed to post reply:', err);
    }
  };

  if (!messages || messages.length === 0) {
    return (
      <div>
        <p style={noMessagesStyle}>No replies yet. Be the first to respond!</p>
        {threadId && <ReplyForm threadId={threadId} onReplySubmit={handleDirectReply} nestingLevel={nestingLevel} />}
      </div>
    );
  }

  return (
        <div>
          {messages.map((message, index) => (
            <React.Fragment key={message._id}>
              <MessageItem
                message={message}
                isOwnMessage={message.authorId === currentUserId}
                onDelete={message.authorId === currentUserId ? () => onDeleteRequest(message._id) : null}
            nestingLevel={nestingLevel}
              />
          {index < messages.length - 1 && <Separator style={{ margin: '0.5rem 0'}} />}
            </React.Fragment>
          ))}
      {threadId && <ReplyForm threadId={threadId} onReplySubmit={handleDirectReply} nestingLevel={nestingLevel} />}
        </div>
  );
};

export default MessageList;
