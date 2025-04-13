import React from 'react';
import { formatDistanceToNow } from 'date-fns'; // For relative time

const ThreadItem = ({ thread, onClick }) => { 
  // Basic check for valid date
  const lastPostTime = thread.lastPostTime instanceof Date && !isNaN(thread.lastPostTime)
    ? formatDistanceToNow(thread.lastPostTime, { addSuffix: true })
    : 'Invalid date';

  return (
    <div 
      className="flex items-center justify-between p-4 hover:bg-muted/50 cursor-pointer transition-colors" 
      onClick={onClick}
    >
      <div className="space-y-1">
        <p className="text-sm font-medium leading-none">{thread.title || 'Untitled Thread'}</p>
        <p className="text-xs text-muted-foreground">
          Started by {thread.author || 'Unknown'}
        </p>
      </div>
      <div className="ml-auto text-right text-xs text-muted-foreground">
        <p>{thread.replyCount ?? 0} replies</p>
        <p>Last post {lastPostTime}</p>
      </div>
    </div>
  );
};

export default ThreadItem;
