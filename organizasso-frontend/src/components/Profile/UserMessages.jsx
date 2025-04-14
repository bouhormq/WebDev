import React from 'react';
import MessageItem from '../Forum/MessageItem'; // Reuse MessageItem
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from 'react-router-dom'; // To link messages to their threads
import { Separator } from "@/components/ui/separator"; // Import Separator

const UserMessages = ({ messages, isOwnProfile, onDelete }) => { // eslint-disable-line no-unused-vars
  return (
    <Card>
       <CardHeader>
         <CardTitle>Messages Posted ({messages?.length || 0})</CardTitle>
       </CardHeader>
       <CardContent className="p-0"> {/* Remove padding for edge-to-edge MessageItem */}
          {(!messages || messages.length === 0) ? (
             <div className="p-6 text-center"> {/* Add padding back for empty state */}
               <p className="text-muted-foreground italic">This user hasn't posted any messages yet.</p>
             </div>
          ) : (
             <div className="space-y-0"> {/* Remove space-y, handled by Separator */}
              {messages.map((message, index) => (
                <React.Fragment key={message._id}> {/* Use _id and React.Fragment */}
                  <div className="px-6 pt-4 pb-2"> {/* Add padding around metadata */}
                    <p className="text-xs text-muted-foreground mb-1">
                       Posted in thread: <Link to={`/forum/thread/${message.threadId}`} className="hover:underline text-primary">View Thread</Link>
                    </p>
                  </div>
                  <div className="px-6 pb-4"> {/* Add padding for MessageItem content */}
                    <MessageItem 
                       message={message} 
                       isOwnMessage={isOwnProfile}
                       onDelete={isOwnProfile ? () => onDelete(message._id) : undefined} // Pass onDelete only if isOwnProfile
                    />
                  </div>
                  {index < messages.length - 1 && <Separator />} {/* Add Separator between items */}
                </React.Fragment>
              ))}
            </div>
          )}
       </CardContent>
    </Card>
  );
};

export default UserMessages;
