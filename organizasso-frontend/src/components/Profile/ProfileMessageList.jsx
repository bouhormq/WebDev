import React from 'react';
import ProfileMessageItem from './ProfileMessageItem';
import { Separator } from "@/components/ui/separator";
import styles from './styles/ProfileMessageList.module.css'; // Import CSS module

const ProfileMessageList = ({ 
  messages, 
  currentUserId, 
  onDeleteRequest 
}) => {
  const currentLevelMessages = messages || [];

  if (!currentLevelMessages || currentLevelMessages.length === 0) {
    return (
      <div className={styles.messageListContainer}> {/* Added class for container styling */}
        <p className={styles.noMessages}>No messages to display.</p> 
      </div>
    );
  }

  return (
    <div className={styles.messageListContainer}> {/* Added class for container styling */}
      {currentLevelMessages.map((message, index) => (
        <React.Fragment key={message._id}>
          <ProfileMessageItem
            message={message}
            isOwnMessage={message.authorId === currentUserId}
            onDelete={message.authorId === currentUserId ? () => onDeleteRequest(message._id) : null}
            currentUserId={currentUserId}
          />
          {index < currentLevelMessages.length - 1 && <Separator className={styles.separator} />}
        </React.Fragment>
      ))}
    </div>
  );
};

export default ProfileMessageList;
