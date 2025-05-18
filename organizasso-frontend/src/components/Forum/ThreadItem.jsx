import React from 'react';
import { formatDistanceToNow } from 'date-fns'; // For relative time
import { Avatar, AvatarFallback } from "@/components/ui/avatar" // Use Avatar
import { MessageSquareText, Clock, ChevronDown, ChevronUp } from 'lucide-react'; // Icons
import ThreadDetailView from './ThreadDetailView'; // Import ThreadDetailView

// --- Inline Style for Thread Content ---
const threadContentStyle = {
  padding: '1rem',
  paddingTop: '0.5rem', // Less top padding as it's below the summary
  fontSize: '0.9rem',
  lineHeight: '1.6',
  whiteSpace: 'pre-wrap', // Preserve whitespace and wrap text
  wordBreak: 'break-word',
  color: 'var(--foreground)', // Use appropriate text color
  // borderTop: '1px solid var(--border)', // Optional separator
  // marginTop: '0.5rem'
};
// --- End Inline Style ---

const ThreadItem = ({ thread, onClick, isExpanded }) => { 
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

  // --- Styles ---
  const itemContainerStyle = {
    // This div wraps both the summary and the detail view
  };
  const summaryDivStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem',
    // cursor: 'pointer', // Cursor will be on the toggle replies button instead
    transition: 'background-color 0.2s ease-in-out',
    // consider adding hover style: e.g., backgroundColor: 'var(--accent-hover)' or similar
  };
  const avatarStyle = { height: '2.25rem', width: '2.25rem'}; // sm:flex was lost, consider responsive display
  const infoDivStyle = { flexGrow: 1, margin: '0.125rem 0', overflow: 'hidden' };
  const titlePStyle = { fontSize: '0.875rem', fontWeight: 500, lineHeight: 1.25, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' };
  const authorInfoPStyle = { fontSize: '0.75rem', color: 'var(--muted-foreground)' };
  const authorSpanStyle = { fontWeight: 500 };
  const statsDivStyle = { flexShrink: 0, display: 'flex', alignItems: 'center', fontSize: '0.75rem', color: 'var(--muted-foreground)', gap: '1rem' };
  const statItemStyle = { display: 'flex', alignItems: 'center' };
  const iconStyle = { height: '0.875rem', width: '0.875rem', marginRight: '0.25rem' };
  const detailViewContainerStyle = { // Style for the container of ThreadDetailView (now replies view)
    paddingLeft: '2rem', // Indent replies further
    paddingRight: '1rem',
    paddingBottom: '1rem',
    // borderTop: '1px dashed var(--border)', // Optional subtle separator from summary
    // marginTop: '0.5rem' // Optional space
  };
  const toggleRepliesButtonStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    fontSize: '0.75rem',
    color: 'var(--muted-foreground)',
    cursor: 'pointer',
    padding: '0.25rem 0.5rem',
    borderRadius: 'var(--radius)',
    // hover effects can be added
  };

  return (
    <div style={itemContainerStyle}>
      <div 
        style={summaryDivStyle}
        // onClick is now handled by a dedicated button/area for replies
        // role="button" // Not the whole summary is clickable for expansion
        // tabIndex={0}
        // onKeyDown={(e) => e.key === 'Enter' && onClick()}
      >
        <Avatar style={avatarStyle}>
          <AvatarFallback>{authorInitial}</AvatarFallback>
        </Avatar>
        <div style={infoDivStyle}>
          <p style={titlePStyle}>{thread.title || 'Untitled Thread'}</p>
          <p style={authorInfoPStyle}>
            Started by <span style={authorSpanStyle}>{thread.authorName || 'Unknown'}</span>
          </p>
        </div>
        <div style={statsDivStyle}>
          <div style={statItemStyle} title={`Last post: ${lastPostTimeText}`}>
            <Clock style={iconStyle} />
            <span>{lastPostTimeText}</span> {/* Display last post time by default now */}
          </div>
          {/* Button to toggle replies */}
          <div 
            style={toggleRepliesButtonStyle}
            onClick={onClick} // onClick now toggles replies
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onClick()}
            title={isExpanded ? "Hide Replies" : "Show Replies"}
          >
            {isExpanded ? <ChevronUp style={iconStyle} /> : <ChevronDown style={iconStyle} />}
            <span>{isExpanded ? "Hide Replies" : `Show Replies (${thread.messageCount ?? thread.replyCount ?? 0})`}</span>
          </div>
        </div>
      </div>

      {/* Always visible thread content */}
      {thread.content && thread.content.trim() !== '' ? (
        <div style={threadContentStyle}>
          <p>{thread.content}</p>
        </div>
      ) : (
        <div style={{ ...threadContentStyle, color: 'var(--muted-foreground)', fontStyle: 'italic' }}>
          <p>[This thread has no content]</p>
        </div>
      )}

      {/* Conditionally rendered replies (via ThreadDetailView) */}
      {isExpanded && (
        <div style={detailViewContainerStyle}>
          <ThreadDetailView threadId={thread._id} originalThreadContent={thread.content} />
        </div>
      )}
    </div>
  );
};

export default ThreadItem;
