import React from 'react';
import MessageItem from '../Forum/MessageItem'; // Reuse MessageItem
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from 'react-router-dom'; // To link messages to their threads
import { Separator } from "@/components/ui/separator"; // Import Separator

const UserMessages = ({ messages, isOwnProfile, onDelete }) => { // eslint-disable-line no-unused-vars

  // --- Inline Styles ---
  const contentStyle = { padding: 0 }; // p-0
  const emptyStateDivStyle = { padding: '1.5rem', textAlign: 'center' }; // p-6 text-center
  const emptyStatePStyle = { color: 'var(--muted-foreground)', fontStyle: 'italic' }; // text-muted-foreground italic
  const metadataDivStyle = { padding: '1rem 1.5rem 0.5rem' }; // px-6 pt-4 pb-2
  const metadataPStyle = { fontSize: '0.75rem', color: 'var(--muted-foreground)', marginBottom: '0.25rem' }; // text-xs text-muted-foreground mb-1
  const linkStyle = { color: 'var(--primary)' }; // text-primary (hover:underline lost)
  const messageItemDivStyle = { padding: '0 1.5rem 1rem' }; // px-6 pb-4
  // --- End Inline Styles ---

  return (
    <Card>
       <CardHeader>
         <CardTitle>Messages Posted ({messages?.length || 0})</CardTitle>
       </CardHeader>
       <CardContent style={contentStyle}> {/* Remove padding for edge-to-edge MessageItem */}
          {(!messages || messages.length === 0) ? (
             <div style={emptyStateDivStyle}> {/* Add padding back for empty state */}
               <p style={emptyStatePStyle}>This user hasn't posted any messages yet.</p>
             </div>
          ) : (
             <>
              {messages.map((message, index) => (
                <React.Fragment key={message._id}> {/* Use _id and React.Fragment */}
                  <div style={metadataDivStyle}> {/* Add padding around metadata */}
                    <p style={metadataPStyle}>
                       Posted in thread: <Link to={`/forum/thread/${message.threadId}`} style={linkStyle}>View Thread</Link>
                    </p>
                  </div>
                  <div style={messageItemDivStyle}> {/* Add padding for MessageItem content */}
                    <MessageItem 
                       message={message} 
                       isOwnMessage={isOwnProfile}
                       onDelete={isOwnProfile ? () => onDelete(message._id) : undefined} // Pass onDelete only if isOwnProfile
                    />
                  </div>
                  {index < messages.length - 1 && <Separator />} {/* Add Separator between items */}
                </React.Fragment>
              ))}
            </>
          )}
       </CardContent>
    </Card>
  );
};

export default UserMessages;
