import React from 'react';
import { format } from 'date-fns';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User } from 'lucide-react';
import styles from './styles/UserInfo.module.css'; // Import CSS module

const UserInfo = ({ user, isCurrentUserProfile }) => {
  if (!user) return null;

  const joinDate = user.joinDate instanceof Date && !isNaN(user.joinDate)
    ? format(user.joinDate, 'PPP')
    : 'Unknown';

  const initial = user.username
    ? user.username.charAt(0).toUpperCase()
    : <User className={styles.avatarFallbackIcon} />; // Apply class to User icon

  return (
    <div className={styles.userInfoContainer}>
      <Avatar className={styles.avatar}>
        <AvatarFallback>{initial}</AvatarFallback>
      </Avatar>
      <div className={styles.infoDiv}>
        <div className={styles.title}>
          {user.username || 'User Profile'}
          {isCurrentUserProfile && <span className={styles.youSpan}>(You)</span>}
        </div>
        <div className={styles.description}>
          Member since {joinDate}
        </div>
      </div>
    </div>
  );
};

export default UserInfo;
