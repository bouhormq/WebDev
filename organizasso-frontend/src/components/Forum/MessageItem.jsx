import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const MessageItem = ({ message, isOwnMessage, onDelete }) => { 
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
  const outerDivStyle = { display: 'flex', alignItems: 'flex-start', gap: '1rem' }; // flex items-start gap-4
  const avatarStyle = { height: '2.5rem', width: '2.5rem', border: '1px solid var(--border)' }; // h-10 w-10 border
  const infoDivStyle = { flex: 1, margin: '0.125rem 0' }; // flex-1 space-y-1 approximated
  const headerDivStyle = { display: 'flex', alignItems: 'center', justifyContent: 'space-between' }; // flex items-center justify-between
  const authorInfoDivStyle = { display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }; // flex items-center gap-2 text-sm
  const authorLinkStyle = { fontWeight: 600 }; // font-semibold (hover:underline lost)
  const timeSpanStyle = { fontSize: '0.75rem', color: 'var(--muted-foreground)' }; // text-xs text-muted-foreground
  const deleteButtonStyle = { color: 'var(--muted-foreground)' }; // hover:text-destructive lost
  const deleteIconStyle = { height: '1rem', width: '1rem' }; // h-4 w-4
  const contentDivStyle = { fontSize: '0.875rem', color: 'var(--foreground)', whiteSpace: 'pre-wrap', wordBreak: 'break-words' }; // text-sm text-foreground whitespace-pre-wrap break-words
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
