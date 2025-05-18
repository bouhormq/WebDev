import React from 'react';
import MessageItem from './MessageItem';
import { Separator } from "@/components/ui/separator";
import ReplyForm from './ReplyForm';

const MessageList = ({ messages, threadId, onReplySubmitted, currentUserId, onDeleteRequest, nestingLevel = 0 }) => {
  const noMessagesStyle = { color: 'var(--muted-foreground)', padding: '1rem 0' };

  const handleDirectReply = async (/* values were unused */) => {
    // This assumes postReply is available via a service or context and handles the API call.
    // Then calls onReplySubmitted to refresh the list.
    if (onReplySubmitted) {
      await onReplySubmitted(); 
    }
  };

  if (!messages || messages.length === 0) {
    return (
      <div>
        <p style={noMessagesStyle}>No replies yet. Be the first to respond!</p>
        {threadId && <ReplyForm threadId={threadId} onSubmit={handleDirectReply} nestingLevel={nestingLevel} />}
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
      {threadId && <ReplyForm threadId={threadId} onSubmit={handleDirectReply} nestingLevel={nestingLevel} />}
    </div>
  );
};

export default MessageList;
