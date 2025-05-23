import React from 'react';
import { Button } from "@/components/ui/button";
import { Check, X, UserPlus, UserMinus, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import styles from './styles/Username.module.css';

const Username = ({ user, type, onAction, actionLoading, currentUserId }) => { 
  const isSelf = user._id === currentUserId;
  
  const isApproving = actionLoading === user._id + '_approve';
  const isRejecting = actionLoading === user._id + '_reject';
  const isPromoting = actionLoading === user._id + '_promote';
  const isDemoting = actionLoading === user._id + '_demote';
  const isLoadingAnyAction = isApproving || isRejecting || isPromoting || isDemoting;

  const userInitial = user.username ? user.username.charAt(0).toUpperCase() : '?';

  const handleActionClick = (action) => {
     onAction(action, user._id, user.username); 
  };

  const outerDivClassName = `${styles.outerDivBase} ${isLoadingAnyAction ? styles.outerDivLoading : ''}`;

  return (
    <div className={outerDivClassName}> 
       <Avatar className={styles.avatar}> 
         <AvatarFallback>{userInitial}</AvatarFallback>
       </Avatar>
       <div className={styles.userInfoDiv}>
         <div className={styles.usernameMetaContainer}>
            <p className={styles.usernameP}>{user.username}</p>
            {type === 'manageAdmins' && user.isAdmin && !isSelf && (
              <span className={styles.adminSpan}>(Admin)</span>
            )}
            {type === 'manageAdmins' && isSelf && (
              <span className={styles.selfSpan}>(Your Account)</span>
            )}
         </div>
        {user.email && <p className={styles.emailP}>{user.email}</p>}
       </div>

      <div className={styles.buttonContainer}>
        {type === 'pending' && (
          <>
            <Button 
              variant="successOutline"
              size="sm" 
              onClick={() => handleActionClick('approve')}
              disabled={isLoadingAnyAction}
              title="Approve Registration"
            >
              <span className={styles.buttonChildWrapper}>
                {isApproving ? <Loader2 className={styles.loaderIcon} /> : <Check className={styles.icon} />}
                Approve
              </span>
            </Button>
            <Button 
              variant="destructiveOutline"
              size="sm"
              onClick={() => handleActionClick('reject')}
              disabled={isLoadingAnyAction}
              title="Reject Registration"
            >
              <span className={styles.buttonChildWrapper}>
                {isRejecting ? <Loader2 className={styles.loaderIcon} /> : <X className={styles.icon} />}
                Reject
              </span>
            </Button>
          </>
        )}
        {type === 'manageAdmins' && !isSelf && (
            user.isAdmin ? (
                <Button 
                  variant="destructiveOutline" 
                  size="sm" 
                  onClick={() => handleActionClick('demote')}
                  disabled={isLoadingAnyAction}
                  title="Revoke Admin Status"
                >
                    <span className={styles.buttonChildWrapper}>
                      {isDemoting ? <Loader2 className={styles.loaderIcon} /> : <UserMinus className={styles.icon} />}
                      Demote
                    </span>
                </Button>
            ) : (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleActionClick('promote')}
                  disabled={isLoadingAnyAction}
                  title="Grant Admin Status"
                >
                    <span className={styles.buttonChildWrapper}>
                      {isPromoting ? <Loader2 className={styles.loaderIcon} /> : <UserPlus className={styles.icon} />}
                      Promote
                    </span>
                </Button>
            )
        )}
      </div>
    </div>
  );
};

export default Username;
