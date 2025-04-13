import React from 'react';
import Username from './Username';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const UsernameList = ({ users, type, onUserAction, actionLoading, currentUserId }) => { 
  const cardTitle = type === 'pending' ? 'Pending Registrations' : 'Manage Members';
  const cardDescription = type === 'pending' 
    ? 'Review and approve or reject new user registrations.'
    : 'Grant or revoke administrator privileges for existing members.';

  if (!users || users.length === 0) {
    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>{cardTitle}</CardTitle>
          <CardDescription>{cardDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground italic text-center">
            {type === 'pending' ? 'No pending registrations found.' : 'No members found.'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>{cardTitle}</CardTitle>
        <CardDescription>{cardDescription}</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-0"> {/* Use p-0 on content and no space-y if items have borders/separators */}
          {users.map((user, index) => (
            <React.Fragment key={user._id}>
              <Username 
                user={user} 
                type={type} 
                onAction={(action) => onUserAction(action, user._id, user.username)}
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
