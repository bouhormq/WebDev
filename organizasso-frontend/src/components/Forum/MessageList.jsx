import React from 'react';
import MessageItem from './MessageItem';

const MessageList = ({ messages, currentUserId, onDeleteRequest }) => {

  if (!messages || messages.length === 0) {
    return <p className="text-muted-foreground italic text-center my-4">No messages in this thread yet.</p>;
  }

  return (
    <div className="space-y-6">
      {messages.map((message) => (
        <MessageItem 
          key={message.id} 
          message={message} 
          isOwnMessage={message.authorId === currentUserId}
          onDelete={() => onDeleteRequest(message.id)} 
        />
      ))}
    </div>
  );
};

export default MessageList;
