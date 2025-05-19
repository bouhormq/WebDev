import React from 'react';
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
  const avatarStyle = { height: '3rem', width: '3rem' };
  const infoDivStyle = { flex: '1', margin: '0.125rem 0' };
  const titleStyle = { fontSize: '1.25rem' };
  const youSpanStyle = {
    fontSize: '0.875rem',
    fontWeight: 'normal',
    color: 'var(--muted-foreground)',
    marginLeft: '0.5rem',
  };
  const descStyle = { color: 'var(--muted-foreground)', fontSize: '1rem' };
  // --- End Inline Styles ---

  return (
    <div style={{ width: '100%', background: '#fff', borderRadius: 'var(--radius)', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <Avatar style={avatarStyle}>
        <AvatarFallback>{initial}</AvatarFallback>
      </Avatar>
      <div style={infoDivStyle}>
        <div style={titleStyle}>
          {user.username || 'User Profile'}
          {isCurrentUserProfile && <span style={youSpanStyle}>(You)</span>}
        </div>
        <div style={descStyle}>
          Member since {joinDate}
        </div>
      </div>
    </div>
  );
};

export default UserInfo;
