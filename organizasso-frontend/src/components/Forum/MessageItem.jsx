import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

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

  return (
    <div className={cn(
      "flex items-start gap-4 p-4", 
    )}>
      <Avatar className="h-10 w-10 border">
         <AvatarFallback>{authorInitial}</AvatarFallback>
      </Avatar>

       <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-2 text-sm">
                 <Link 
                    to={`/profile/${message.authorId}`} 
                    className="font-semibold hover:underline"
                  >
                     {message.authorName || 'Unknown User'}
                  </Link>
                 <span className="text-xs text-muted-foreground">· {timeAgo}</span>
             </div>
              {isOwnMessage && onDelete && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 text-muted-foreground hover:text-destructive" 
                  onClick={handleDeleteClick}
                  title="Delete message"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
             )}
          </div>
           <div className="text-sm text-foreground whitespace-pre-wrap break-words">
             {typeof message.content === 'string' || React.isValidElement(message.content) 
               ? message.content 
               : String(message.content || '')}
           </div>
       </div>
    </div>
  );
};

export default MessageItem;
