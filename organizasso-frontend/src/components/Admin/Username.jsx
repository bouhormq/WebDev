import React from 'react';
import { Button } from "@/components/ui/button";
import { Check, X, UserPlus, UserMinus, Loader2 } from 'lucide-react'; // Icons + Loader
import { cn } from "@/lib/utils";

const Username = ({ user, type, onAction, actionLoading, currentUserId }) => { 
  const isSelf = user._id === currentUserId; // Use _id from MongoDB
  
  // Determine if a specific action button for *this* user is loading
  const isApproving = actionLoading === user._id + '_approve';
  const isRejecting = actionLoading === user._id + '_reject';
  const isPromoting = actionLoading === user._id + '_promote';
  const isDemoting = actionLoading === user._id + '_demote';
  const isLoadingAction = isApproving || isRejecting || isPromoting || isDemoting;

  return (
    <div className={cn(
        "flex items-center justify-between p-4",
        isLoadingAction ? "opacity-50 pointer-events-none" : "" // Dim if loading
    )}> 
      <div className="space-y-1">
        <p className="text-sm font-medium leading-none">{user.username}</p>
        {user.email && <p className="text-xs text-muted-foreground">{user.email}</p>}
        {type === 'manageAdmins' && user.isAdmin && (
            <span className="text-xs font-semibold text-destructive">(Admin)</span>
        )}
      </div>

      <div className="flex items-center space-x-2 ml-auto">
        {type === 'pending' && (
          <>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700" 
              onClick={() => onAction('approve')}
              disabled={isLoadingAction} // Disable if any action is loading for this user
              title="Approve Registration"
            >
               {isApproving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />} 
               Approve
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={() => onAction('reject')}
              disabled={isLoadingAction}
              title="Reject Registration"
            >
              {isRejecting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <X className="mr-2 h-4 w-4" />}
               Reject
            </Button>
          </>
        )}
        {type === 'manageAdmins' && !isSelf && (
            user.isAdmin ? (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onAction('demote')}
                  disabled={isSelf || isLoadingAction} // Prevent demoting self or if loading
                  title={isSelf ? "Cannot demote self" : "Revoke Admin Status"}
                >
                    {isDemoting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserMinus className="mr-2 h-4 w-4" />}
                     Demote
                </Button>
            ) : (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onAction('promote')}
                  disabled={isLoadingAction}
                  title="Grant Admin Status"
                >
                    {isPromoting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />} 
                    Promote
                </Button>
            )
        )}
         {type === 'manageAdmins' && isSelf && (
            <span className="text-xs text-muted-foreground italic">(Your Account)</span>
         )}
      </div>
    </div>
  );
};

export default Username;
