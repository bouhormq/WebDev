import React from 'react';
import MessageItem from './MessageItem';
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const MessageList = ({ messages, currentUserId, onDeleteRequest }) => {

  if (!messages || messages.length === 0) {
    return (
       <Card className="text-center py-12">
         <CardContent>
           <p className="text-muted-foreground">No messages in this thread yet.</p>
         </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
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
