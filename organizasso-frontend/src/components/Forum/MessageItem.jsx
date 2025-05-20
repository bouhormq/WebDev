import React, { useState, useEffect, useMemo } from 'react'; // Added useMemo
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Trash2, ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { likeDislikeMessage } from '../../services/forumService'; 
import ReplyForm from './ReplyForm';
import { toast } from "sonner"; // Import toast

const MessageItem = ({ 
  message: initialMessage, 
  isOwnMessage, 
  onDelete, 
  onReply, 
  nestingLevel = 0, 
  replyFormIsLoading: parentReplyFormIsLoading,
  isUserLoggedIn, // Received from MessageList
  currentUserId // Received from MessageList
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
    console.log(`MessageItem (${message._id}): initialMessage.content:`, initialMessage?.content?.substring(0, 30));
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
      // Update local counts if the message object (which includes counts) changes
      // This is important if the message prop is updated from parent after a reply or other action
      setLocalLikeCount(message.likeCount || 0);
      setLocalDislikeCount(message.dislikeCount || 0);
    }
    // Not resetting to false here as this effect primarily reacts to changes in the 'message' state
    // or 'currentUser'. The initial state is handled by the first useEffect.
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
    let path = message.profilePicUrl.replace(/^\/?uploadss\//, '/uploads/'); 
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
  const outerDivStyle = {
    position: 'relative', 
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
    paddingTop: '0.75rem',
    paddingBottom: '0.75rem',
    paddingRight: '0.5rem',
    paddingLeft: `${10 + nestingLevel * indentSize}px`, 
  };

  const avatarStyle = { height: '2rem', width: '2rem' };
  const infoDivStyle = { flex: 1, paddingTop: '0.1rem' }; 
  const headerDivStyle = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' };
  const authorInfoDivStyle = { display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' };
  const authorLinkStyle = { fontWeight: 600, color: 'var(--foreground)', textDecoration: 'none' };
  const timeSpanStyle = { fontSize: '0.75rem', color: 'var(--muted-foreground)' };
  const deleteButtonStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    border: '1px solid #d1d5db',
    background: '#fff',
    color: 'var(--muted-foreground)',
    borderRadius: 'var(--radius)',
    padding: '0.25rem 0.75rem',
    fontSize: '0.95rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background 0.15s, border 0.15s',
  };
  const deleteIconStyle = { height: '1rem', width: '1rem'};
  const contentDivStyle = { fontSize: '0.875rem', color: 'var(--foreground)', whiteSpace: 'pre-wrap', wordBreak: 'break-words', lineHeight: '1.5' };
  const contentImageStyle = {
    maxWidth: '100%', 
    maxHeight: '400px', 
    marginTop: '0.75rem', 
    borderRadius: 'var(--radius)', 
    objectFit: 'contain', 
  };
  const actionsDivStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginTop: '0.5rem',
  };
  const iconButtonStyle = (isActive, type = 'default') => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.25rem 0.5rem',
    fontSize: '0.8rem',
    color: isActive ? (type === 'dislike' ? 'var(--destructive)' : 'var(--primary)') : 'var(--muted-foreground)',
    // Adding a subtle border for inactive, and stronger for active to match ThreadItem
    border: '1px solid transparent', // Keep it subtle
    borderRadius: 'var(--radius)',
    backgroundColor: 'transparent',
    lineHeight: '1',
  });

  const handleLikeDislike = async (actionType) => {
    if (!currentUser || !message?._id || isLikingOrDisliking) {
      if (!currentUser) toast.error("You must be logged in to react.");
      return;
    }
    setIsLikingOrDisliking(true);
    
    // Optimistic UI updates
    const originalState = { 
      isLiked, 
      isDisliked, 
      localLikeCount, 
      localDislikeCount 
    };

    if (actionType === 'like') {
      setLocalLikeCount(prev => isLiked ? prev - 1 : prev + 1);
      setIsLiked(!isLiked);
      if (isDisliked) { // If previously disliked, remove dislike
        setLocalDislikeCount(prev => prev - 1);
        setIsDisliked(false);
      }
    } else if (actionType === 'dislike') {
      setLocalDislikeCount(prev => isDisliked ? prev - 1 : prev + 1);
      setIsDisliked(!isDisliked);
      if (isLiked) { // If previously liked, remove like
        setLocalLikeCount(prev => prev - 1);
        setIsLiked(false);
      }
    }

    try {
      // The API returns the updated message object, including its new like/dislike arrays and counts
      const updatedMessageData = await likeDislikeMessage(message._id, actionType);
      
      // Update state with data from the server to ensure consistency
      setMessage(prevMessage => ({ ...prevMessage, ...updatedMessageData.message })); // Update the whole message state
      setLocalLikeCount(updatedMessageData.message.likeCount);
      setLocalDislikeCount(updatedMessageData.message.dislikeCount);
      // Server is the source of truth for who liked/disliked
      if (currentUser) {
        setIsLiked(updatedMessageData.message.likes.includes(currentUser._id));
        setIsDisliked(updatedMessageData.message.dislikes.includes(currentUser._id));
      }

    } catch (error) {
      console.error(`Failed to ${actionType} message:`, error);
      toast.error("Action Failed", {
        description: error.message || `Could not ${actionType} the message. Please try again.`,
      });
      // Revert optimistic updates on error
      setIsLiked(originalState.isLiked);
      setIsDisliked(originalState.isDisliked);
      setLocalLikeCount(originalState.localLikeCount);
      setLocalDislikeCount(originalState.localDislikeCount);
    } finally {
      setIsLikingOrDisliking(false);
    }
  };

  return (
    <>
      <div style={outerDivStyle}>
        <Avatar style={avatarStyle}>
           {finalProfilePicUrl ? (
              <AvatarImage src={finalProfilePicUrl} alt={message.authorName} />
           ) : (
              <AvatarFallback>{authorInitial}</AvatarFallback>
           )}
        </Avatar>

         <div style={infoDivStyle}>
            <div style={headerDivStyle}>
               <div style={authorInfoDivStyle}>
                   <Link 
                      to={`/profile/${message.authorId}`} 
                      style={authorLinkStyle}
                    >
                       {message.authorName || 'Unknown User'}
                    </Link>
                   <span style={timeSpanStyle}>· {timeAgo}</span>
               </div>
                {/* isOwnMessage is determined by MessageList comparing authorId to currentUserId prop */}
                {/* onDelete is also determined by MessageList based on the same comparison */} 
                {isOwnMessage && onDelete && (
                  <Button 
                    variant="ghost"
                    size="icon"
                    style={{...deleteButtonStyle, padding: '0.25rem'}}
                    onClick={handleDeleteClick}
                    title="Delete message"
                  >
                    <Trash2 style={deleteIconStyle} />
                  </Button>
                )}
            </div>
            <div style={contentDivStyle} dangerouslySetInnerHTML={{ __html: message.content }}></div>
            {finalContentImageUrl && (
              <img src={finalContentImageUrl} alt="Message content" style={contentImageStyle} />
            )}
            <div style={actionsDivStyle}>
              {/* Like Button */}
              {currentUser && (
                <Button
                  variant="ghost"
                  size="sm"
                  style={iconButtonStyle(isLiked, 'like')}
                  onClick={() => handleLikeDislike('like')}
                  disabled={isLikingOrDisliking || !currentUser}
                  title={isLiked ? "Unlike" : "Like"}
                >
                  <ThumbsUp size={16} className={isLiked ? "fill-primary" : ""} />
                  <span style={{ marginLeft: '0.25rem' }}>{localLikeCount}</span>
                </Button>
              )}

              {/* Dislike Button */}
              {currentUser && (
                <Button
                  variant="ghost"
                  size="sm"
                  style={iconButtonStyle(isDisliked, 'dislike')}
                  onClick={() => handleLikeDislike('dislike')}
                  disabled={isLikingOrDisliking || !currentUser}
                  title={isDisliked ? "Undislike" : "Dislike"}
                >
                  <ThumbsDown size={16} className={isDisliked ? "fill-destructive" : ""} /> 
                  <span style={{ marginLeft: '0.25rem' }}>{localDislikeCount}</span>
                </Button>
              )}
              
              {/* Reply Button */}
              {isUserLoggedIn && onReply && (
                <Button
                  variant="ghost"
                  size="sm"
                  style={iconButtonStyle(false)} 
                  onClick={handleReplyClick}
                  title="Reply to this message"
                  disabled={isSubmittingDirectReply || parentReplyFormIsLoading || !isUserLoggedIn} 
                >
                  <MessageSquare size={16} />
                  <span style={{ marginLeft: '0.25rem' }}>Reply</span>
                </Button>
              )}
            </div>
         </div>
      </div>
      {/* Use isUserLoggedIn prop for ReplyForm visibility */}
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
    </>
  );
};

export default MessageItem;
