import React from 'react';
import ProfileMessageItem from './ProfileMessageItem'; // Changed import
import { Separator } from "@/components/ui/separator";
// ReplyForm import removed

const ProfileMessageList = ({ 
  messages, 
  currentUserId, 
  onDeleteRequest 
  // Removed threadId, onDirectReplySubmit, nestingLevel, replyFormIsLoading
}) => {
  const noMessagesStyle = { color: 'var(--muted-foreground)', padding: '1rem 0' };

  // isUserLoggedIn can be inferred from currentUserId if needed by ProfileMessageItem, but interactions are reduced.
  // console.log(`ProfileMessageList: currentUserId: ${currentUserId}`);

  const currentLevelMessages = messages || [];

  if (!currentLevelMessages || currentLevelMessages.length === 0) {
    // No reply form at any level for profile view
    return (
      <div>
        <p style={noMessagesStyle}>No messages to display.</p> 
      </div>
    );
  }

  return (
    <div>
      {currentLevelMessages.map((message, index) => (
        <React.Fragment key={message._id}>
          <ProfileMessageItem
            message={message}
            isOwnMessage={message.authorId === currentUserId}
            // Pass onDelete directly if ProfileMessageItem expects it, or adapt as needed.
            // The original MessageItem took an onDelete that was pre-configured if it was an own message.
            // Here, we pass onDeleteRequest and let ProfileMessageItem call it with message._id if needed.
            onDelete={message.authorId === currentUserId ? () => onDeleteRequest(message._id) : null}
            currentUserId={currentUserId} // Pass currentUserId for potential display logic inside ProfileMessageItem
            // Removed onReply, nestingLevel, replyFormIsLoading, isUserLoggedIn (as ProfileMessageItem won't use it for interaction)
          />
          
          {/* Recursive rendering of MessageList for replies is removed. Messages are displayed flat. */}
          
          {/* Separator logic might need adjustment if there's no nesting/indentation */}
          {index < currentLevelMessages.length - 1 && <Separator style={{ margin: `1rem 0 1rem 10px` }} />}
        </React.Fragment>
      ))}
    </div>
  );
};

export default ProfileMessageList;
