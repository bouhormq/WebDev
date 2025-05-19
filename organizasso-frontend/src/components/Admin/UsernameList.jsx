import React from 'react';
import Username from './Username';
import { Separator } from "@/components/ui/separator";

const UsernameList = ({ users, type, onUserAction, actionLoading, currentUserId }) => { 
  return (
    <div style={{ width: '100%' }}>
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
  );
};

export default UsernameList;
