import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Trash2 } from 'lucide-react'; // Import an icon
import { cn } from "@/lib/utils";

const MessageItem = ({ message, isOwnMessage, onDelete }) => { 
  const timeAgo = message.timestamp instanceof Date && !isNaN(message.timestamp)
    ? formatDistanceToNow(message.timestamp, { addSuffix: true })
    : 'Invalid date';

  return (
    <Card className={cn("w-full", isOwnMessage ? "bg-muted/30 border-primary/20" : "")}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          <Link to={`/profile/${message.authorId}`} className="hover:underline">
             {message.authorName || 'Unknown User'}
          </Link>
        </CardTitle>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-muted-foreground">{timeAgo}</span>
          {isOwnMessage && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 text-muted-foreground hover:text-destructive" 
              onClick={onDelete}
              title="Delete message"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm whitespace-pre-wrap">{/* Preserve line breaks */}
          {message.content || ''}
        </p>
      </CardContent>
      {/* Optional CardFooter for actions like reply-to-message if needed */}
      {/* <CardFooter>
        <Button variant="ghost" size="sm">Reply</Button>
      </CardFooter> */}
    </Card>
  );
};

export default MessageItem;
