import React from 'react';
import { Button } from "@/components/ui/button";
import { Check, X, UserPlus, UserMinus, Loader2 } from 'lucide-react'; // Icons + Loader
import { Avatar, AvatarFallback } from "@/components/ui/avatar"; // Import Avatar

const Username = ({ user, type, onAction, actionLoading, currentUserId }) => { 
  const isSelf = user._id === currentUserId; // Use _id from MongoDB
  
  // Determine if a specific action button for *this* user is loading
  const isApproving = actionLoading === user._id + '_approve';
  const isRejecting = actionLoading === user._id + '_reject';
  const isPromoting = actionLoading === user._id + '_promote';
  const isDemoting = actionLoading === user._id + '_demote';
  const isLoadingAnyAction = isApproving || isRejecting || isPromoting || isDemoting;

  // Get user initial
  const userInitial = user.username ? user.username.charAt(0).toUpperCase() : '?';

  // Pass username back to parent for confirmation dialogs
  const handleActionClick = (action) => {
     // Pass user._id and user.username along with the action
     onAction(action, user._id, user.username); 
  };

  // --- Inline Styles ---
  const outerDivBaseStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem', // gap-4
    padding: '1rem', // p-4
  };
  const outerDivLoadingStyle = isLoadingAnyAction ? { opacity: 0.6, pointerEvents: 'none' } : {};
  const avatarStyle = { height: '2.25rem', width: '2.25rem', display: 'none' }; // h-9 w-9 hidden - sm:flex lost
  const userInfoDivStyle = { flexGrow: 1, margin: '0.125rem 0', overflow: 'hidden' }; // flex-grow space-y-0.5 overflow-hidden (space-y approximated)
  const usernamePStyle = { fontSize: '0.875rem', fontWeight: 500, lineHeight: 1.25, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }; // text-sm font-medium leading-tight truncate
  const adminSpanStyle = { fontSize: '0.75rem', fontWeight: 600, color: 'var(--destructive)' }; // text-xs font-semibold text-destructive
  const selfSpanStyle = { fontSize: '0.75rem', color: 'var(--muted-foreground)', fontStyle: 'italic' }; // text-xs text-muted-foreground italic
  const emailPStyle = { fontSize: '0.75rem', color: 'var(--muted-foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }; // text-xs text-muted-foreground truncate
  const buttonContainerStyle = { flexShrink: 0, display: 'flex', alignItems: 'center', marginLeft: 'auto' }; // flex-shrink-0 flex items-center ml-auto (space-x lost)
  const iconStyle = { marginRight: '0.5rem', height: '1rem', width: '1rem' }; // mr-2 h-4 w-4
  const loaderIconStyle = { ...iconStyle }; // animate-spin lost
  const buttonChildWrapperStyle = { display: 'inline-flex', alignItems: 'center' }; // To align icon and text within button
  // --- End Inline Styles ---

  return (
    <div style={{ ...outerDivBaseStyle, ...outerDivLoadingStyle }}> 
       <Avatar style={avatarStyle}> 
         <AvatarFallback>{userInitial}</AvatarFallback>
       </Avatar>
       {/* User Info */}
       <div style={userInfoDivStyle}>
         <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <p style={usernamePStyle}>{user.username}</p>
            {type === 'manageAdmins' && user.isAdmin && !isSelf && (
              <span style={adminSpanStyle}>(Admin)</span>
            )}
            {type === 'manageAdmins' && isSelf && (
              <span style={selfSpanStyle}>(Your Account)</span>
            )}
         </div>
        {user.email && <p style={emailPStyle}>{user.email}</p>}
       </div>

      {/* Action Buttons */}
      <div style={buttonContainerStyle}>
        {/* Pending Actions */} 
        {type === 'pending' && (
          <>
            <Button 
              variant="successOutline" // Use new successOutline variant
              size="sm" 
              onClick={() => handleActionClick('approve')}
              disabled={isLoadingAnyAction}
              title="Approve Registration"
              style={{ marginRight: '0.5rem' }} // Approximate space-x-2
            >
              <span style={buttonChildWrapperStyle}>
                {isApproving ? <Loader2 style={loaderIconStyle} /> : <Check style={iconStyle} />}
                Approve
              </span>
            </Button>
            <Button 
              variant="destructiveOutline" // Use destructive outline variant
              size="sm"
              onClick={() => handleActionClick('reject')}
              disabled={isLoadingAnyAction}
              title="Reject Registration"
            >
              <span style={buttonChildWrapperStyle}>
                {isRejecting ? <Loader2 style={loaderIconStyle} /> : <X style={iconStyle} />}
                Reject
              </span>
            </Button>
          </>
        )}
         {/* Manage Admins Actions */}
        {type === 'manageAdmins' && !isSelf && (
            user.isAdmin ? (
                <Button 
                  variant="destructiveOutline" 
                  size="sm" 
                  onClick={() => handleActionClick('demote')}
                  disabled={isLoadingAnyAction}
                  title="Revoke Admin Status"
                >
                    <span style={buttonChildWrapperStyle}>
                      {isDemoting ? <Loader2 style={loaderIconStyle} /> : <UserMinus style={iconStyle} />}
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
                    <span style={buttonChildWrapperStyle}>
                      {isPromoting ? <Loader2 style={loaderIconStyle} /> : <UserPlus style={iconStyle} />}
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
