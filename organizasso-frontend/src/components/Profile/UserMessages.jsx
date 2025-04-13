import React from 'react';
import MessageItem from '../Forum/MessageItem'; // Reuse MessageItem
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from 'react-router-dom'; // To link messages to their threads

const UserMessages = ({ messages, isOwnProfile, onDelete }) => { // eslint-disable-line no-unused-vars
  return (
    <Card>
       <CardHeader>
         <CardTitle>Messages Posted</CardTitle>
       </CardHeader>
       <CardContent>
          {(!messages || messages.length === 0) ? (
            <p className="text-muted-foreground italic text-center">This user hasn't posted any messages yet.</p>
          ) : (
            <div className="space-y-4"> {/* Use space-y for spacing between message items */}
              {messages.map((message) => (
                <div key={message.id}>
                  {/* Optional: Link to the thread */}
                   <p className="text-xs text-muted-foreground mb-1">
                      In thread: <Link to={`/forum/thread/${message.threadId}`} className="hover:underline text-primary">View Thread</Link>
                   </p>
                  <MessageItem 
                    message={message} 
                    isOwnMessage={isOwnProfile}
                    onDelete={() => onDelete(message.id)} 
                  />
                  {/* Add separator if needed, or rely on space-y */} 
                  {/* {index < messages.length - 1 && <Separator className="my-4" />} */} 
                </div>
              ))}
            </div>
          )}
       </CardContent>
    </Card>
  );
};

export default UserMessages;
