import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Trash2, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import styles from './styles/ProfileMessageItem.module.css'; // Import CSS module

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
  const [localLikeCount, setLocalLikeCount] = useState(initialMessage?.likeCount || 0);
  const [localDislikeCount, setLocalDislikeCount] = useState(initialMessage?.dislikeCount || 0);

  useEffect(() => {
    setMessage(initialMessage);
    setLocalLikeCount(initialMessage?.likeCount || 0);
    setLocalDislikeCount(initialMessage?.dislikeCount || 0);
  }, [initialMessage]);

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

  return (
    <>
      <div className={styles.outerDiv}>
        <Avatar className={styles.avatar}>
           {finalProfilePicUrl ? (
              <AvatarImage src={finalProfilePicUrl} alt={message.authorName} />
           ) : (
              <AvatarFallback>{authorInitial}</AvatarFallback>
           )}
        </Avatar>

         <div className={styles.infoDiv}>
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
                {isOwnMessage && onDelete && !message.isInitialPost && (
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
              <Button
                variant="ghost"
                size="sm"
                className={styles.iconButton} 
                disabled 
                title="Likes"
              >
                <ThumbsUp size={16} />
                <span>{localLikeCount}</span> 
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className={styles.iconButton} 
                disabled 
                title="Dislikes"
              >
                <ThumbsDown size={16} /> 
                <span>{localDislikeCount}</span>
              </Button>
            </div>
         </div>
      </div>
    </>
  );
};

export default ProfileMessageItem;
