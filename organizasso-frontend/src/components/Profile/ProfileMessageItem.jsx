import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Trash2, ThumbsUp, ThumbsDown } from 'lucide-react'; // Removed MessageSquare
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
// likeDislikeMessage and ReplyForm are removed as they are not needed.
// import { likeDislikeMessage } from '../../services/forumService'; 
// import ReplyForm from './ReplyForm'; // Assuming ReplyForm is not in the same directory

// Helper function to render content (can be kept if message.content structure is the same)
const renderContent = (content) => {
  if (Array.isArray(content)) {
    return content;
  }
  if (typeof content === 'object' && content !== null) {
    if (Object.prototype.hasOwnProperty.call(content, 'snippet') && typeof content.snippet === 'string') {
      return content.snippet;
    }
    console.warn("ProfileMessageItem renderContent received an unexpected object:", content);
    return '[Unsupported content object]'; 
  }
  return String(content);
};

const ProfileMessageItem = ({ 
  message: initialMessage, 
  isOwnMessage, 
  onDelete,
}) => {
  const [message, setMessage] = useState(initialMessage);
  // No need for isLiked, isDisliked, isLikingOrDisliking, showReplyForm, isSubmittingDirectReply states
  const [localLikeCount, setLocalLikeCount] = useState(initialMessage?.likeCount || 0);
  const [localDislikeCount, setLocalDislikeCount] = useState(initialMessage?.dislikeCount || 0);

  useEffect(() => {
    setMessage(initialMessage);
    setLocalLikeCount(initialMessage?.likeCount || 0);
    setLocalDislikeCount(initialMessage?.dislikeCount || 0);
    // No need to set isLiked/isDisliked based on currentUser for interaction
  }, [initialMessage]);

  // Removed useEffect that reacted to 'message' and 'currentUser' for like/dislike states

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
          console.error("Error formatting date in ProfileMessageItem:", error, "Raw createdAt:", message.createdAt);
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

  // Removed handleReplyClick

  // Removed nestingLevel, so paddingLeft is fixed or removed from outerDivStyle
  const outerDivStyle = {
    position: 'relative', 
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
    paddingTop: '0.75rem',
    paddingBottom: '0.75rem',
    paddingRight: '0.5rem',
    paddingLeft: '10px', // Fixed padding, or adjust as needed for profile page
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
  
  // Simplified iconButtonStyle as it's non-interactive for likes/dislikes
  const iconButtonStyle = () => ({ // Removed unused 'type' parameter
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.25rem 0.5rem',
    fontSize: '0.8rem',
    color: 'var(--muted-foreground)', // Always muted as it's non-interactive
    border: '1px solid transparent',
    borderRadius: 'var(--radius)',
    backgroundColor: 'transparent',
    lineHeight: '1',
    cursor: 'default', // Non-interactive
  });

  // Removed handleLikeDislike function

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
                      to={`/profile/${message.authorId}`} // This link might be to the same profile page, or to other users if this component is ever reused.
                      style={authorLinkStyle}
                    >
                       {message.authorName || 'Unknown User'}
                    </Link>
                   <span style={timeSpanStyle}>· {timeAgo}</span>
               </div>
                {isOwnMessage && onDelete && !message.isInitialPost && (
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
            <div style={contentDivStyle}>{renderContent(message.content)}</div>
            {finalContentImageUrl && (
              <img src={finalContentImageUrl} alt="Message content" style={contentImageStyle} />
            )}
            <div style={actionsDivStyle}>
              {/* Like Button - Non-interactive */}
              <Button
                variant="ghost"
                size="sm"
                style={iconButtonStyle('like')}
                disabled // Always disabled
                title="Likes"
              >
                <ThumbsUp size={16} />
                <span style={{ marginLeft: '0.25rem' }}>{localLikeCount}</span>
              </Button>

              {/* Dislike Button - Non-interactive */}
              <Button
                variant="ghost"
                size="sm"
                style={iconButtonStyle('dislike')}
                disabled // Always disabled
                title="Dislikes"
              >
                <ThumbsDown size={16} /> 
                <span style={{ marginLeft: '0.25rem' }}>{localDislikeCount}</span>
              </Button>
              
              {/* Reply Button Removed */}
            </div>
         </div>
      </div>
      {/* ReplyForm Removed */}
    </>
  );
};

export default ProfileMessageItem;
