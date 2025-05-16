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
  const initial = user.username
    ? user.username.charAt(0).toUpperCase()
    : <User style={{ height: '1rem', width: '1rem' }} />; // h-4 w-4

  // --- Inline Styles ---
  const headerStyle = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    // space-x-4 approximated with gap
    gap: '1rem',
    paddingBottom: '1rem', // pb-4
  };
  const avatarStyle = { height: '3rem', width: '3rem' }; // h-12 w-12
  const infoDivStyle = { flex: '1', margin: '0.125rem 0' }; // flex-1, space-y-1 approximated
  const titleStyle = { fontSize: '1.25rem' }; // text-xl
  const youSpanStyle = {
    fontSize: '0.875rem', // text-sm
    fontWeight: 'normal',
    color: 'var(--muted-foreground)',
    marginLeft: '0.5rem', // ml-2
  };
  // --- End Inline Styles ---

  return (
    <Card>
      <CardHeader style={headerStyle}>
        <Avatar style={avatarStyle}>
          {/* Placeholder for user avatar image if available */}
          {/* <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" /> */}
          <AvatarFallback>{initial}</AvatarFallback>
        </Avatar>
        <div style={infoDivStyle}>
          <CardTitle style={titleStyle}>
            {user.username || 'User Profile'}
            {isCurrentUserProfile && <span style={youSpanStyle}>(You)</span>}
          </CardTitle>
          <CardDescription>
            Member since {joinDate}
          </CardDescription>
        </div>
      </CardHeader>
      {/* CardContent can be used for additional details if needed */}
      {/* <CardContent>
        {isCurrentUserProfile && (
          <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>
            Viewing your own profile.
          </p>
        )}
      </CardContent> */}
    </Card>
  );
};

export default UserInfo;
