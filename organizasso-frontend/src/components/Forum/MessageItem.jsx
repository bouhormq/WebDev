import React, { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Trash2, ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { likeDislikeMessage } from '../../services/forumService'; 
import ReplyForm from './ReplyForm';
import { toast } from "sonner";
import styles from './styles/MessageItem.module.css';

// Helper function to render content
const renderContent = (content) => {
  if (Array.isArray(content)) {
    // If content is an array (e.g., from highlighting),
    // React can render an array of strings and valid React elements directly.
    // The highlightKeywords function should already be providing keys for <mark> elements.
    return content; // Directly return the array of mixed strings and React elements
  }

  // Fallback for content that is not an array (e.g., plain string from non-search contexts)
  // or if backend sends a different structure for non-highlighted content.
  if (typeof content === 'object' && content !== null) {
    // Example: if backend sometimes sends { snippet: "..." } for non-highlighted search results
    if (Object.prototype.hasOwnProperty.call(content, 'snippet') && typeof content.snippet === 'string') {
      return content.snippet;
    }
    // Fallback for other unexpected object structures
    console.warn("MessageItem renderContent received an unexpected object:", content);
    return '[Unsupported content object]'; 
  }
  
  // Default: treat as a string
  return String(content);
};

const MessageItem = ({ 
  message: initialMessage, 
  isOwnMessage, 
  onDelete, 
  onReply, 
  nestingLevel = 0, 
  replyFormIsLoading: parentReplyFormIsLoading,
  isUserLoggedIn,
  currentUserId
}) => {
  const [message, setMessage] = useState(initialMessage);

  const currentUser = useMemo(() => {
    return currentUserId ? { _id: currentUserId } : null;
  }, [currentUserId]);

  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [localLikeCount, setLocalLikeCount] = useState(initialMessage?.likeCount || 0);
  const [localDislikeCount, setLocalDislikeCount] = useState(initialMessage?.dislikeCount || 0);
  const [isLikingOrDisliking, setIsLikingOrDisliking] = useState(false); 
  const [isSubmittingDirectReply, setIsSubmittingDirectReply] = useState(false); 
  const [showReplyForm, setShowReplyForm] = useState(false);

  // DEBUGGING LOGS START
  console.log(`MessageItem (${message?._id || 'new'}): currentUser (memoized):`, currentUser);
  console.log(`MessageItem (${message?._id || 'new'}): isUserLoggedIn prop:`, isUserLoggedIn);
  console.log(`MessageItem (${message?._id || 'new'}): typeof onReply:`, typeof onReply);
  console.log(`MessageItem (${message?._id || 'new'}): showReplyForm state:`, showReplyForm);
  if (message) {
    // Safely log a preview of initialMessage.content
    const contentPreview = initialMessage && typeof initialMessage.content === 'string'
      ? initialMessage.content.substring(0, 30)
      : initialMessage?.content !== undefined && initialMessage?.content !== null 
        ? String(initialMessage.content).substring(0, 30) 
        : '[content not available]';
    console.log(`MessageItem (${message._id}): initialMessage.content (preview):`, contentPreview);
    console.log(`MessageItem (${message._id}): nestingLevel:`, nestingLevel);
  }
  // DEBUGGING LOGS END

  useEffect(() => {
    setMessage(initialMessage);
    setLocalLikeCount(initialMessage?.likeCount || 0);
    setLocalDislikeCount(initialMessage?.dislikeCount || 0);

    const likesArray = Array.isArray(initialMessage?.likes) ? initialMessage.likes : [];
    const dislikesArray = Array.isArray(initialMessage?.dislikes) ? initialMessage.dislikes : [];

    if (currentUser && initialMessage) {
      setIsLiked(likesArray.includes(currentUser._id));
      setIsDisliked(dislikesArray.includes(currentUser._id));
    } else {
      setIsLiked(false);
      setIsDisliked(false);
    }
  }, [initialMessage, currentUser]);

  useEffect(() => {
    const likesArray = Array.isArray(message?.likes) ? message.likes : [];
    const dislikesArray = Array.isArray(message?.dislikes) ? message.dislikes : [];

    if (currentUser && message) {
      setIsLiked(likesArray.includes(currentUser._id));
      setIsDisliked(dislikesArray.includes(currentUser._id));
      setLocalLikeCount(message.likeCount || 0);
      setLocalDislikeCount(message.dislikeCount || 0);
    }
  }, [message, currentUser]);

  let timeAgo = 'Unknown time';
  if (message.createdAt) {
      try {
         const createdAtDate = typeof message.createdAt === 'string' || typeof message.createdAt === 'number' 
                               ? new Date(message.createdAt) 
                               : message.createdAt;
        if (createdAtDate instanceof Date && !isNaN(createdAtDate)) {
          timeAgo = formatDistanceToNow(createdAtDate, { addSuffix: true });
        } else {
          timeAgo = 'Invalid date';
        }
      } catch (error) {
          console.error("Error formatting date in MessageItem:", error, "Raw createdAt:", message.createdAt);
          timeAgo = 'Invalid date';
      }
  }

  const authorInitial = message.authorName ? message.authorName.charAt(0).toUpperCase() : '?';

  let finalProfilePicUrl = null;
  if (message.profilePicUrl) {
    let path = message.profilePicUrl.replace(/^\/?uploads\//, '/uploads/'); // Corrected regex
    if (!path.startsWith('/')) {
      path = '/' + path;
    }
    const serverOrigin = new URL(import.meta.env.VITE_API_BASE_URL).origin;
    finalProfilePicUrl = serverOrigin + path;
  }

  let finalContentImageUrl = null;
  if (message.imageUrl) {
    let imagePath = message.imageUrl.replace(/^\/?uploads\//, '/uploads/'); 
    if (!imagePath.startsWith('/')) {
      imagePath = '/' + imagePath;
    }
    const serverOrigin = new URL(import.meta.env.VITE_API_BASE_URL).origin;
    finalContentImageUrl = serverOrigin + imagePath;
  }

  const handleDeleteClick = (e) => {
     e.stopPropagation();
     if (onDelete) {
       onDelete(message._id); 
     }
  }

  const handleReplyClick = () => {
    setShowReplyForm(!showReplyForm);
  };

  const indentSize = 20;
  const outerDivDynamicStyle = {
    paddingLeft: `${10 + nestingLevel * indentSize}px`,
  };

  const getIconButtonClassName = (isActive, type = 'default') => {
    let classNames = `${styles.iconButton} `;
    if (isActive) {
      classNames += type === 'dislike' ? styles.iconButtonActiveDislike : styles.iconButtonActiveLike;
    } else {
      classNames += styles.iconButtonInactive;
    }
    return classNames;
  };
  
  const handleLikeDislike = async (actionType) => {
    if (!currentUser || !message?._id || isLikingOrDisliking) {
      if (!currentUser) toast.error("You must be logged in to react.");
      return;
    }
    setIsLikingOrDisliking(true);
    
    const originalState = { 
      isLiked, 
      isDisliked, 
      localLikeCount, 
      localDislikeCount 
    };

    if (actionType === 'like') {
      setLocalLikeCount(prev => isLiked ? prev - 1 : prev + 1);
      setIsLiked(!isLiked);
      if (isDisliked) {
        setLocalDislikeCount(prev => prev - 1);
        setIsDisliked(false);
      }
    } else if (actionType === 'dislike') {
      setLocalDislikeCount(prev => isDisliked ? prev - 1 : prev + 1);
      setIsDisliked(!isDisliked);
      if (isLiked) {
        setLocalLikeCount(prev => prev - 1);
        setIsLiked(false);
      }
    }

    try {
      const updatedMessageData = await likeDislikeMessage(message._id, actionType);
      setMessage(prevMessage => ({ ...prevMessage, ...updatedMessageData.message }));
      setLocalLikeCount(updatedMessageData.message.likeCount);
      setLocalDislikeCount(updatedMessageData.message.dislikeCount);
      if (currentUser) {
        setIsLiked(updatedMessageData.message.likes.includes(currentUser._id));
        setIsDisliked(updatedMessageData.message.dislikes.includes(currentUser._id));
      }
    } catch (error) {
      console.error(`Failed to ${actionType} message:`, error);
      toast.error("Action Failed", {
        description: error.message || `Could not ${actionType} the message. Please try again.`,
      });
      setIsLiked(originalState.isLiked);
      setIsDisliked(originalState.isDisliked);
      setLocalLikeCount(originalState.localLikeCount);
      setLocalDislikeCount(originalState.localDislikeCount);
    } finally {
      setIsLikingOrDisliking(false);
    }
  };

  return (
    <div className={styles.messageItemOuterContainer} style={outerDivDynamicStyle}>
      <div className={styles.messageItemInnerContainer}>
        <div className={styles.avatarContainer}>
          {message.authorId ? (
            <Link to={`/profile/${message.authorId}`} onClick={(e) => e.stopPropagation()} className={styles.avatarLink}>
              <Avatar className={styles.avatar}>
                {finalProfilePicUrl ? (
                  <AvatarImage src={finalProfilePicUrl} alt={message.authorName} />
                ) : (
                  <AvatarFallback>{authorInitial}</AvatarFallback>
                )}
              </Avatar>
            </Link>
          ) : (
            <Avatar className={styles.avatar}>
              {finalProfilePicUrl ? (
                <AvatarImage src={finalProfilePicUrl} alt={message.authorName || 'Unknown User'} />
              ) : (
                <AvatarFallback>{authorInitial}</AvatarFallback>
              )}
            </Avatar>
          )}
        </div>
        <div className={styles.messageContentContainer}>
          <div className={styles.headerDiv}>
            <div className={styles.authorInfoDiv}>
                <Link 
                  to={`/profile/${message.authorId}`} 
                  className={styles.authorLink}
                >
                   {message.authorName || 'Unknown User'}
                </Link>
               <span className={styles.timeSpan}>· {timeAgo}</span>
            </div>
            {isOwnMessage && onDelete && (
              <Button 
                variant="ghost"
                size="icon"
                className={styles.deleteButton}
                onClick={handleDeleteClick}
                title="Delete message"
              >
                <Trash2 className={styles.deleteIcon} />
              </Button>
            )}
          </div>
          <div className={styles.contentDiv}>{renderContent(message.content)}</div>
          {finalContentImageUrl && (
            <img src={finalContentImageUrl} alt="Message content" className={styles.contentImage} />
          )}
          <div className={styles.actionsDiv}>
            {currentUser && (
              <Button
                variant="ghost"
                size="sm"
                className={getIconButtonClassName(isLiked, 'like')}
                onClick={() => handleLikeDislike('like')}
                disabled={isLikingOrDisliking || !currentUser}
                title={isLiked ? "Unlike" : "Like"}
              >
                <ThumbsUp size={16} className={isLiked ? "fill-primary" : ""} />
                <span>{localLikeCount}</span>
              </Button>
            )}

            {currentUser && (
              <Button
                variant="ghost"
                size="sm"
                className={getIconButtonClassName(isDisliked, 'dislike')}
                onClick={() => handleLikeDislike('dislike')}
                disabled={isLikingOrDisliking || !currentUser}
                title={isDisliked ? "Undislike" : "Dislike"}
              >
                <ThumbsDown size={16} className={isDisliked ? "fill-destructive" : ""} /> 
                <span>{localDislikeCount}</span>
              </Button>
            )}
            
            {isUserLoggedIn && onReply && (
              <Button
                variant="ghost"
                size="sm"
                className={getIconButtonClassName(false)}
                onClick={handleReplyClick}
                title="Reply to this message"
                disabled={isSubmittingDirectReply || parentReplyFormIsLoading || !isUserLoggedIn} 
              >
                <MessageSquare size={16} />
                <span>Reply</span>
              </Button>
            )}
          </div>
        </div>
      </div>
      {showReplyForm && isUserLoggedIn && onReply && (
         <ReplyForm 
            threadId={message.threadId}
            parentId={message._id} 
            onReplySubmit={async (content, parentIdFromFormCallback, imageFile) => {
              setIsSubmittingDirectReply(true);
              try {
                const success = await onReply(content, message._id, imageFile); 
                if (success) {
                  setShowReplyForm(false); 
                }
                return success; 
              } finally {
                setIsSubmittingDirectReply(false);
              }
            }} 
            isLoading={isSubmittingDirectReply || parentReplyFormIsLoading} 
        />
      )}
    </div>
  );
};

export default MessageItem;
