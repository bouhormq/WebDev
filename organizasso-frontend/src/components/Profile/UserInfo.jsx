import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { format } from 'date-fns'; // For date formatting

const UserInfo = ({ user, isCurrentUserProfile }) => { 
  if (!user) return null;

  const joinDate = user.joinDate instanceof Date && !isNaN(user.joinDate)
    ? format(user.joinDate, 'PPP') // Format as Oct 21, 2023
    : 'Unknown';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">
          {user.username || 'User Profile'}
          {isCurrentUserProfile && <span className="text-sm font-normal text-muted-foreground ml-2">(Your Profile)</span>}
        </CardTitle>
        <CardDescription>
          Member since {joinDate}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Add more user details here if available, e.g., email (if own profile), roles */}
        {isCurrentUserProfile && (
          <p className="text-sm text-muted-foreground">
            {/* Placeholder for future info: You are viewing your own profile. */}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default UserInfo;
