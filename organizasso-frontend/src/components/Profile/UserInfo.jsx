import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { format } from 'date-fns'; // For date formatting
import { Avatar, AvatarFallback } from "@/components/ui/avatar"; // Import Avatar
import { User } from 'lucide-react'; // Import User icon for fallback

const UserInfo = ({ user, isCurrentUserProfile }) => { 
  if (!user) return null;

  const joinDate = user.joinDate instanceof Date && !isNaN(user.joinDate)
    ? format(user.joinDate, 'PPP') // Format as Oct 21, 2023
    : 'Unknown';

  // Get initial for Avatar fallback
  const initial = user.username ? user.username.charAt(0).toUpperCase() : <User className="h-4 w-4" />;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center space-x-4 pb-4"> 
         <Avatar className="h-12 w-12">
           {/* Placeholder for user avatar image if available */}
           {/* <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" /> */}
           <AvatarFallback>{initial}</AvatarFallback>
         </Avatar>
         <div className="flex-1 space-y-1">
           <CardTitle className="text-xl"> {/* Slightly smaller title */}
             {user.username || 'User Profile'}
             {isCurrentUserProfile && <span className="text-sm font-normal text-muted-foreground ml-2">(You)</span>}
           </CardTitle>
           <CardDescription>
             Member since {joinDate}
           </CardDescription>
         </div>
      </CardHeader>
      {/* CardContent can be used for additional details if needed */}
      {/* <CardContent>
        {isCurrentUserProfile && (
          <p className="text-sm text-muted-foreground">
            Viewing your own profile.
          </p>
        )}
      </CardContent> */}
    </Card>
  );
};

export default UserInfo;
