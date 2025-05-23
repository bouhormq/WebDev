import React from 'react';
import ThreadItem from './ThreadItem';
import { Separator } from "@/components/ui/separator";

const ThreadList = ({ threads, onThreadClick, openThreadIds, onReplyPosted, ensureThreadOpen, onThreadDeleted, forumType, currentUserId, onDeleteMessage }) => {
  return (
        <div>
      {threads.map((thread, index) => {
        const isExpanded = openThreadIds && openThreadIds.has(thread._id);
        return (
            <React.Fragment key={thread._id}>
              <ThreadItem 
                thread={thread} 
                onClick={() => onThreadClick(thread._id)}
                isExpanded={isExpanded}
                onReplyPosted={onReplyPosted}
                ensureThreadOpen={ensureThreadOpen}
                onThreadDeleted={onThreadDeleted} // Pass down the prop
                // Keep other props for ClosedForumPage as they are
                forumType={forumType}
                currentUserId={currentUserId}
                onDeleteMessage={onDeleteMessage}
              />
              {index < threads.length - 1 && <Separator />}
            </React.Fragment>
        );
      })}
        </div>
  );
};

export default ThreadList;
