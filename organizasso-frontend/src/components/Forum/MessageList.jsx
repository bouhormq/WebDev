import React from 'react';
import MessageItem from './MessageItem';
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const MessageList = ({ messages, currentUserId, onDeleteRequest }) => {

  // --- Inline Styles ---
  const emptyCardStyle = { textAlign: 'center', paddingTop: '3rem', paddingBottom: '3rem' }; // text-center py-12
  const emptyPStyle = { color: 'var(--muted-foreground)' }; // text-muted-foreground
  const contentStyle = { padding: 0 }; // p-0
  // --- End Inline Styles ---

  if (!messages || messages.length === 0) {
    return (
      <Card style={emptyCardStyle}>
        <CardContent>
          <p style={emptyPStyle}>No messages in this thread yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent style={contentStyle}>
        <div>
          {messages.map((message, index) => (
            <React.Fragment key={message._id}>
              <MessageItem
                message={message}
                isOwnMessage={message.authorId === currentUserId}
                onDelete={message.authorId === currentUserId ? () => onDeleteRequest(message._id) : null}
              />
              {index < messages.length - 1 && <Separator />}
            </React.Fragment>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MessageList;
