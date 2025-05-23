import React from 'react';
import ProfileMessageList from './ProfileMessageList';
import styles from './styles/UserMessages.module.css'; // Import CSS module

const UserMessages = ({ messages, currentUserId, onDeleteRequest }) => { 

  return (
    <div className={styles.container}>
      <div className={styles.title}>Messages Posted ({messages?.length || 0})</div>
      {(!messages || messages.length === 0) ? (
        <div className={styles.emptyStateDiv}>
          <p className={styles.emptyStateP}>This user hasn't posted any messages yet.</p>
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
