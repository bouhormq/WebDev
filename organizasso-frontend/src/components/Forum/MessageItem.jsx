import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const MessageItem = ({ message, isOwnMessage, onDelete, nestingLevel = 0 }) => { 
  let timeAgo = 'Unknown time';
  if (message.createdAt instanceof Date && !isNaN(message.createdAt)) {
      try {
         timeAgo = formatDistanceToNow(message.createdAt, { addSuffix: true });
      } catch (error) {
          console.error("Error formatting date in MessageItem:", error);
          timeAgo = 'Invalid date';
      }
  }

  const authorInitial = message.authorName ? message.authorName.charAt(0).toUpperCase() : '?';

  const handleDeleteClick = (e) => {
     e.stopPropagation();
     if (onDelete) {
       onDelete();
     }
  }

  // --- Inline Styles ---
  const indentSize = 20; // Base indent size in pixels per nesting level

  const outerDivStyle = {
    position: 'relative', 
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
    paddingTop: '0.75rem',
    paddingBottom: '0.75rem',
    paddingRight: '0.5rem',
    paddingLeft: `${nestingLevel * indentSize + 10}px`, // Adjusted paddingLeft (10px base indent)
  };

  const avatarStyle = { height: '2rem', width: '2rem' };
  const infoDivStyle = { flex: 1, paddingTop: '0.1rem' }; 
  const headerDivStyle = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' };
  const authorInfoDivStyle = { display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' };
  const authorLinkStyle = { fontWeight: 600, color: 'var(--foreground)', textDecoration: 'none' };
  const timeSpanStyle = { fontSize: '0.75rem', color: 'var(--muted-foreground)' };
  const deleteButtonStyle = { color: 'var(--muted-foreground)' };
  const deleteIconStyle = { height: '0.9rem', width: '0.9rem' };
  const contentDivStyle = { fontSize: '0.875rem', color: 'var(--foreground)', whiteSpace: 'pre-wrap', wordBreak: 'break-words', lineHeight: '1.5' };
  // --- End Inline Styles ---

  return (
    <div style={outerDivStyle}>
      <Avatar style={avatarStyle}>
         <AvatarFallback>{authorInitial}</AvatarFallback>
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
              {isOwnMessage && onDelete && (
                <Button 
                  variant="ghost" 
                  size="icon"
                  style={deleteButtonStyle}
                  onClick={handleDeleteClick}
                  title="Delete message"
                >
                  <Trash2 style={deleteIconStyle} />
                </Button>
             )}
          </div>
           <div style={contentDivStyle}>
             {typeof message.content === 'string' || React.isValidElement(message.content) 
               ? message.content 
               : String(message.content || '')}
           </div>
       </div>
    </div>
  );
};

export default MessageItem;
