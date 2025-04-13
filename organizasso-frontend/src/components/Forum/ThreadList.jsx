import React from 'react';
import ThreadItem from './ThreadItem';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from 'react-router-dom';

const ThreadList = ({ threads, forumType }) => { // eslint-disable-line no-unused-vars
  const navigate = useNavigate();

  const handleThreadSelect = (threadId) => {
    navigate(`/forum/thread/${threadId}`);
  };

  if (!threads || threads.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Threads</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No threads found in this forum yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        {/* Optional: Add sorting/filtering controls here */}
        <CardTitle>Threads</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-0"> {/* Removes default spacing if items have borders */}
          {threads.map((thread, index) => (
            <React.Fragment key={thread._id}>
              <ThreadItem 
                thread={thread} 
                onClick={() => handleThreadSelect(thread._id)} 
              />
              {/* Add separator between items, but not after the last one */}
              {index < threads.length - 1 && <Separator />}
            </React.Fragment>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ThreadList;
