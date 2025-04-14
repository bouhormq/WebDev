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

  return (
    <div 
      className="flex items-center gap-4 p-4 hover:bg-accent/50 cursor-pointer transition-colors" 
      onClick={onClick}
      role="button" // Improve accessibility
      tabIndex={0} // Make focusable
      onKeyDown={(e) => e.key === 'Enter' && onClick()} // Allow activation with Enter key
    >
       {/* Avatar */}
       <Avatar className="h-9 w-9 hidden sm:flex"> 
         {/* Add AvatarImage src later if available */}
         <AvatarFallback>{authorInitial}</AvatarFallback>
       </Avatar>

      {/* Thread Info */}
      <div className="flex-grow space-y-1 overflow-hidden"> {/* Prevent long text overflow */} 
        <p className="text-sm font-medium leading-tight truncate">{thread.title || 'Untitled Thread'}</p>
        <p className="text-xs text-muted-foreground">
          Started by <span className="font-medium">{thread.authorName || 'Unknown'}</span>
        </p>
      </div>

      {/* Stats */}
      <div className="flex-shrink-0 flex items-center space-x-4 text-xs text-muted-foreground">
         <div className="flex items-center" title="Replies">
             <MessageSquareText className="h-3.5 w-3.5 mr-1" />
             <span>{thread.messageCount ?? thread.replyCount ?? 0}</span>
         </div>
         <div className="flex items-center" title={`Last post: ${lastPostTimeText}`}>
             <Clock className="h-3.5 w-3.5 mr-1" />
             <span className="hidden sm:inline">{lastPostTimeText}</span>
         </div>
      </div>
    </div>
  );
};

export default ThreadItem;
