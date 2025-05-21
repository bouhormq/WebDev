import React from 'react';
import ProfileMessageList from './ProfileMessageList'; // Changed import

// Added currentUserId prop for ProfileMessageList
// Renamed onDelete to onDeleteRequest to match prop expected by ProfileMessageList
const UserMessages = ({ messages, currentUserId, onDeleteRequest }) => { 

  // --- Inline Styles ---
  const containerStyle = { background: '#fff', borderRadius: 'var(--radius)', padding: '1.5rem', marginTop: 0 };
  const titleStyle = { fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' };
  const emptyStateDivStyle = { padding: '1.5rem', textAlign: 'center' };
  const emptyStatePStyle = { color: 'var(--muted-foreground)', fontStyle: 'italic' };
  // Removed unused style variables: metadataDivStyle, firstMessageMetadataStyle, metadataPStyle, linkStyle
  // --- End Inline Styles ---

  return (
    <div style={containerStyle}>
      <div style={titleStyle}>Messages Posted ({messages?.length || 0})</div>
      {(!messages || messages.length === 0) ? (
        <div style={emptyStateDivStyle}>
          <p style={emptyStatePStyle}>This user hasn't posted any messages yet.</p>
        </div>
      ) : (
        <ProfileMessageList 
            messages={messages} 
            currentUserId={currentUserId} 
            onDeleteRequest={onDeleteRequest} 
        />
      )}
    </div>
  );
};

export default UserMessages;
