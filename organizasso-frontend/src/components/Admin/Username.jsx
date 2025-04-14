import React from 'react';
import { Button } from "@/components/ui/button";
import { Check, X, UserPlus, UserMinus, Loader2 } from 'lucide-react'; // Icons + Loader
import { cn } from "@/lib/utils";
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

  return (
    <div className={cn(
        "flex items-center gap-4 p-4", // Use gap for spacing
        isLoadingAnyAction ? "opacity-60 pointer-events-none" : "" // Dim slightly if loading
    )}> 
       <Avatar className="h-9 w-9 hidden sm:flex"> 
         <AvatarFallback>{userInitial}</AvatarFallback>
       </Avatar>
       {/* User Info */}
       <div className="flex-grow space-y-0.5 overflow-hidden"> {/* Tighten spacing, prevent overflow */}
         <div className="flex items-center gap-2">
            <p className="text-sm font-medium leading-tight truncate">{user.username}</p>
            {type === 'manageAdmins' && user.isAdmin && !isSelf && (
              <span className="text-xs font-semibold text-destructive">(Admin)</span>
            )}
            {type === 'manageAdmins' && isSelf && (
              <span className="text-xs text-muted-foreground italic">(Your Account)</span>
            )}
         </div>
        {user.email && <p className="text-xs text-muted-foreground truncate">{user.email}</p>}
       </div>

      {/* Action Buttons */}
      <div className="flex-shrink-0 flex items-center space-x-2 ml-auto">
        {/* Pending Actions */} 
        {type === 'pending' && (
          <>
            <Button 
              variant="outline" 
              size="sm" 
              // Use standard Tailwind classes for coloring
              className="border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700 dark:border-green-700 dark:text-green-500 dark:hover:bg-green-900/20 dark:hover:text-green-400"
              onClick={() => handleActionClick('approve')}
              disabled={isLoadingAnyAction}
              title="Approve Registration"
            >
               {isApproving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />} 
               Approve
            </Button>
            <Button 
              variant="destructiveOutline" // Use destructive outline variant if defined
              size="sm"
              // Or use standard Tailwind classes
              // className="border-destructive text-destructive hover:bg-destructive/10"
              onClick={() => handleActionClick('reject')}
              disabled={isLoadingAnyAction}
              title="Reject Registration"
            >
              {isRejecting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <X className="mr-2 h-4 w-4" />}
               Reject
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
                    {isDemoting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserMinus className="mr-2 h-4 w-4" />}
                     Demote
                </Button>
            ) : (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleActionClick('promote')}
                  disabled={isLoadingAnyAction}
                  title="Grant Admin Status"
                >
                    {isPromoting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />} 
                    Promote
                </Button>
            )
        )}
      </div>
    </div>
  );
};

export default Username;
