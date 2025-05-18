import React from 'react';
import Username from './Username';
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const UsernameList = ({ users, type, onUserAction, actionLoading, currentUserId }) => { 
  return (
    <Card style={{ width: '100%' }}>
      <CardContent style={{ padding: 0 }}>
        <div>
          {users.map((user, index) => (
            <React.Fragment key={user._id}>
              <Username 
                user={user} 
                type={type} 
                onAction={onUserAction}
                actionLoading={actionLoading}
                currentUserId={currentUserId}
              />
              {index < users.length - 1 && <Separator />}
            </React.Fragment>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default UsernameList;
