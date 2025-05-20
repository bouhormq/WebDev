import React from 'react';
import MessageItem from './MessageItem';
import { Separator } from "@/components/ui/separator";
import ReplyForm from './ReplyForm'; // Keep for top-level thread reply for now

const MessageList = ({ 
  messages, 
  threadId, 
  onDirectReplySubmit, 
  currentUserId, 
  onDeleteRequest, 
  nestingLevel = 0, 
  replyFormIsLoading 
}) => {
  const noMessagesStyle = { color: 'var(--muted-foreground)', padding: '1rem 0' };

  const isUserLoggedIn = !!currentUserId;
  console.log(`MessageList (Level ${nestingLevel}): currentUserId: ${currentUserId}, isUserLoggedIn: ${isUserLoggedIn}`); // Added for debugging

  // The backend now sends a tree, so `messages` prop will be the root messages or replies for a given parent.
  const currentLevelMessages = messages || [];

  if (!currentLevelMessages || currentLevelMessages.length === 0) {
    if (nestingLevel === 0) { // Only show "No messages yet" and main reply form at the top level
      return (
        <div>
          <p style={noMessagesStyle}>No messages yet. Be the first to post!</p>
          {/* Top-level reply form for the thread itself */}
          {threadId && onDirectReplySubmit && (
            <div style={{ marginTop: '1rem'}}>
              <ReplyForm 
                threadId={threadId} 
                parentId={null} // Explicitly null for a new top-level reply to the thread
                onReplySubmit={onDirectReplySubmit} // Use the passed in handler
                isLoading={replyFormIsLoading}
                // No onCancel needed here as it's always visible or tied to parent state
              />
            </div>
          )}
        </div>
      );
    }
    return null; // Don't render anything if a nested branch has no replies
  }

  return (
    <div>
      {currentLevelMessages.map((message, index) => (
        <React.Fragment key={message._id}>
          <MessageItem
            message={message}
            isOwnMessage={message.authorId === currentUserId}
            onDelete={message.authorId === currentUserId ? () => onDeleteRequest(message._id) : null}
            onReply={onDirectReplySubmit} 
            nestingLevel={nestingLevel}
            replyFormIsLoading={replyFormIsLoading}
            isUserLoggedIn={isUserLoggedIn} // Pass isUserLoggedIn prop
            currentUserId={currentUserId} // Pass currentUserId prop
          />
          
          {/* Render children (replies) recursively */}
          {message.replies && message.replies.length > 0 && (
            <div style={{ 
              // Indentation is now handled by MessageItem's paddingLeft based on its own nestingLevel
            }}>
              <MessageList // Recursive call for replies
                messages={message.replies} 
                threadId={threadId}
                onDirectReplySubmit={onDirectReplySubmit} 
                currentUserId={currentUserId} // currentUserId is passed for recursive calls too
                onDeleteRequest={onDeleteRequest}
                nestingLevel={nestingLevel + 1} 
                replyFormIsLoading={replyFormIsLoading}
                // isUserLoggedIn will be determined within the nested MessageList based on currentUserId
              />
            </div>
          )}
          {index < currentLevelMessages.length - 1 && <Separator style={{ margin: `1rem 0 1rem ${10 + nestingLevel * 20}px` }} />}
        </React.Fragment>
      ))}
    </div>
  );
};

export default MessageList;
