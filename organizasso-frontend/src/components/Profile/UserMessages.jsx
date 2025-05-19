import React from 'react';
import MessageItem from '../Forum/MessageItem'; // Reuse MessageItem
import { Link } from 'react-router-dom'; // To link messages to their threads
import { Separator } from "@/components/ui/separator"; // Import Separator

const UserMessages = ({ messages, isOwnProfile, onDelete }) => { // eslint-disable-line no-unused-vars

  // --- Inline Styles ---
  const containerStyle = { width: '100%', background: '#fff', borderRadius: 'var(--radius)', padding: '1.5rem', marginTop: 0 };
  const titleStyle = { fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' };
  const emptyStateDivStyle = { padding: '1.5rem', textAlign: 'center' };
  const emptyStatePStyle = { color: 'var(--muted-foreground)', fontStyle: 'italic' };
  const metadataDivStyle = { padding: '1rem 1.5rem 0.5rem', margin: 0 };
  const metadataPStyle = { fontSize: '0.75rem', color: 'var(--muted-foreground)', marginBottom: '0.25rem' };
  const linkStyle = { color: 'var(--primary)' };
  const messageItemDivStyle = { padding: '0 1.5rem 1rem', margin: 0 };
  // --- End Inline Styles ---

  return (
    <div style={containerStyle}>
      <div style={titleStyle}>Messages Posted ({messages?.length || 0})</div>
      {(!messages || messages.length === 0) ? (
        <div style={emptyStateDivStyle}>
          <p style={emptyStatePStyle}>This user hasn't posted any messages yet.</p>
        </div>
      ) : (
        <>
          {messages.map((message, index) => (
            <React.Fragment key={message._id}>
              <div style={metadataDivStyle}>
                <p style={metadataPStyle}>
                  Posted in thread: <Link to={`/forum/thread/${message.threadId}`} style={linkStyle}>View Thread</Link>
                </p>
              </div>
              <div style={messageItemDivStyle}>
                <MessageItem 
                  message={message} 
                  isOwnMessage={isOwnProfile}
                  onDelete={isOwnProfile ? () => onDelete(message._id) : undefined}
                />
              </div>
              {index < messages.length - 1 && <Separator />}
            </React.Fragment>
          ))}
        </>
      )}
    </div>
  );
};

export default UserMessages;
