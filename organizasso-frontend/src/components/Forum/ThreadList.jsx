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

  return (
    <Card>
      <CardContent className="p-0">
        <div>
          {threads.map((thread, index) => (
            <React.Fragment key={thread._id}>
              <ThreadItem 
                thread={thread} 
                onClick={() => handleThreadSelect(thread._id)} 
              />
              {index < threads.length - 1 && <Separator />}
            </React.Fragment>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ThreadList;
