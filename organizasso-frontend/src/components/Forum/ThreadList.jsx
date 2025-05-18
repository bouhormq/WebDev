import React from 'react';
import ThreadItem from './ThreadItem';
import { Separator } from "@/components/ui/separator";

const ThreadList = ({ threads, onThreadClick, openThreadIds }) => {
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
            />
            {index < threads.length - 1 && <Separator />}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default ThreadList;
