import React from 'react';
import MessageItem from './MessageItem';
import { Separator } from "@/components/ui/separator";
import ReplyForm from './ReplyForm';
import styles from './styles/MessageList.module.css';

const MessageList = ({ 
  messages, 
  threadId, 
  onDirectReplySubmit, 
  currentUserId, 
  onDeleteRequest, 
  nestingLevel = 0, 
  replyFormIsLoading 
}) => {
  const isUserLoggedIn = !!currentUserId;

  const currentLevelMessages = messages || [];

  if (!currentLevelMessages || currentLevelMessages.length === 0) {
    if (nestingLevel === 0) {
      return (
        <div>
          <p className={styles.noMessages}>No messages yet. Be the first to post!</p>
          {threadId && onDirectReplySubmit && (
            <div className={styles.topLevelReplyFormContainer}>
              <ReplyForm 
                threadId={threadId} 
                parentId={null} 
                onReplySubmit={onDirectReplySubmit} 
                isLoading={replyFormIsLoading}
              />
            </div>
          )}
        </div>
      );
    }
    return null;
  }

  const indentSize = 20; // Used for dynamic separator margin

  return (
    <div className={styles.messageListContainer}>
      {currentLevelMessages.map((message, index) => (
        <React.Fragment key={message._id}>
          <MessageItem
            message={message}
            isOwnMessage={message.authorId === currentUserId}
            onDelete={message.authorId === currentUserId ? () => onDeleteRequest(message._id) : null}
            onReply={onDirectReplySubmit} 
            nestingLevel={nestingLevel}
            replyFormIsLoading={replyFormIsLoading}
            isUserLoggedIn={isUserLoggedIn}
            currentUserId={currentUserId}
          />
          
          {message.replies && message.replies.length > 0 && (
            <div> 
              <MessageList
                messages={message.replies} 
                threadId={threadId}
                onDirectReplySubmit={onDirectReplySubmit} 
                currentUserId={currentUserId}
                onDeleteRequest={onDeleteRequest}
                nestingLevel={nestingLevel + 1} 
                replyFormIsLoading={replyFormIsLoading}
              />
            </div>
          )}
          {/* Dynamic margin for separator remains inline as it depends on nestingLevel */}
          {index < currentLevelMessages.length - 1 && 
            <Separator style={{ margin: `1rem 0 1rem ${10 + nestingLevel * indentSize}px` }} />
          }
        </React.Fragment>
      ))}
    </div>
  );
};

export default MessageList;
