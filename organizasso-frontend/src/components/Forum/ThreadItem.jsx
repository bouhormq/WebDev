import React from 'react';
import { formatDistanceToNow } from 'date-fns'; // For relative time
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar" // Use Avatar
import { MessageSquareText, Clock } from 'lucide-react'; // Icons

const ThreadItem = ({ thread, onClick }) => { 
  // Ensure lastPostTime is a valid Date object before formatting
  let lastPostTimeText = 'Unknown';
  if (thread.lastPostTime instanceof Date && !isNaN(thread.lastPostTime)) {
    try {
      lastPostTimeText = formatDistanceToNow(thread.lastPostTime, { addSuffix: true });
    } catch (error) {
      console.error("Error formatting date in ThreadItem:", error);
      lastPostTimeText = 'Invalid date'; 
    }
  }

  // Get first letter for fallback avatar
  const authorInitial = thread.authorName ? thread.authorName.charAt(0).toUpperCase() : '?';

  // --- Inline Styles ---
  const outerDivStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem', // gap-4
    padding: '1rem', // p-4
    cursor: 'pointer',
    transition: 'background-color 0.2s ease-in-out', // transition-colors (approximated target)
    // hover:bg-accent/50 lost
  };
  const avatarStyle = { height: '2.25rem', width: '2.25rem', display: 'none' }; // h-9 w-9 hidden (sm:flex lost)
  const infoDivStyle = { flexGrow: 1, margin: '0.125rem 0', overflow: 'hidden' }; // flex-grow space-y-1 overflow-hidden
  const titlePStyle = { fontSize: '0.875rem', fontWeight: 500, lineHeight: 1.25, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }; // text-sm font-medium leading-tight truncate
  const authorInfoPStyle = { fontSize: '0.75rem', color: 'var(--muted-foreground)' }; // text-xs text-muted-foreground
  const authorSpanStyle = { fontWeight: 500 }; // font-medium
  const statsDivStyle = { flexShrink: 0, display: 'flex', alignItems: 'center', fontSize: '0.75rem', color: 'var(--muted-foreground)' }; // flex-shrink-0 flex items-center text-xs text-muted-foreground (space-x lost)
  const statItemStyle = { display: 'flex', alignItems: 'center' }; // flex items-center
  const iconStyle = { height: '0.875rem', width: '0.875rem', marginRight: '0.25rem' }; // h-3.5 w-3.5 mr-1
  const lastPostTimeSpanStyle = { display: 'none' }; // hidden (sm:inline lost)
  // --- End Inline Styles ---

  return (
    <div 
      style={outerDivStyle}
      onClick={onClick}
      role="button" // Improve accessibility
      tabIndex={0} // Make focusable
      onKeyDown={(e) => e.key === 'Enter' && onClick()} // Allow activation with Enter key
    >
       {/* Avatar */}
       <Avatar style={avatarStyle}> 
         {/* Add AvatarImage src later if available */}
         <AvatarFallback>{authorInitial}</AvatarFallback>
       </Avatar>

      {/* Thread Info */}
      <div style={infoDivStyle}> {/* Prevent long text overflow */} 
        <p style={titlePStyle}>{thread.title || 'Untitled Thread'}</p>
        <p style={authorInfoPStyle}>
          Started by <span style={authorSpanStyle}>{thread.authorName || 'Unknown'}</span>
        </p>
      </div>

      {/* Stats */}
      <div style={{ ...statsDivStyle, gap: '1rem' }}> {/* Added gap to approximate space-x */} 
        <div style={statItemStyle} title="Replies">
          <MessageSquareText style={iconStyle} />
          <span>{thread.messageCount ?? thread.replyCount ?? 0}</span>
        </div>
        <div style={statItemStyle} title={`Last post: ${lastPostTimeText}`}>
          <Clock style={iconStyle} />
          <span style={lastPostTimeSpanStyle}>{lastPostTimeText}</span>
        </div>
      </div>
    </div>
  );
};

export default ThreadItem;
