import React, { useState, useEffect, useCallback } from 'react';
import PageWrapper from '../components/Layout/PageWrapper';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UsernameList from '../components/Admin/UsernameList';
import Spinner from '../components/Common/Spinner';
import { toast } from "sonner";
// Import AlertDialog components
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
// Import admin service functions
import {
    getPendingRegistrations, 
    getMembers, 
    approveRegistration, 
    rejectRegistration, 
    grantAdminStatus, 
    revokeAdminStatus 
} from '../services/adminService';
import useAuth from '../hooks/useAuth'; // Import useAuth to get current user ID

const AdminPanelPage = () => {
  const { currentUser } = useAuth(); // Get current user for self-check
  const [pendingUsers, setPendingUsers] = useState([]);
  const [members, setMembers] = useState([]);
  const [isLoadingPending, setIsLoadingPending] = useState(true);
  const [isLoadingMembers, setIsLoadingMembers] = useState(true);
  const [errorPending, setErrorPending] = useState(null);
  const [errorMembers, setErrorMembers] = useState(null);
  const [actionLoading, setActionLoading] = useState(null); // Track loading state for specific user actions

  // State for confirmation dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionToConfirm, setActionToConfirm] = useState(null); // { action: string, userId: string, username: string }

  // Fetch Pending Users
  const fetchPending = useCallback(async () => {
    setIsLoadingPending(true);
    setErrorPending(null);
    try {
      console.log("AdminPanelPage: Fetching pending users from API...");
      const data = await getPendingRegistrations();
      setPendingUsers(data);
    } catch (err) {
      const message = err.message || "Failed to fetch pending registrations.";
      console.error(message, err);
      setErrorPending(message);
      toast.error(message);
    } finally {
      setIsLoadingPending(false);
    }
  }, []);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  // Fetch Members
  const fetchMembers = useCallback(async () => {
    setIsLoadingMembers(true);
    setErrorMembers(null);
    try {
      console.log("AdminPanelPage: Fetching members from API...");
      const data = await getMembers();
      setMembers(data);
    } catch (err) {
      const message = err.message || "Failed to fetch members list.";
      console.error(message, err);
      setErrorMembers(message);
      toast.error(message);
    } finally {
      setIsLoadingMembers(false);
    }
  }, []);

  useEffect(() => {
     fetchMembers();
  }, [fetchMembers]);


  // --- Action Handlers (calling API) ---
  // Updated to accept username for dialog messages
  const handleUserAction = async (action, userId, username) => {
    // Actions requiring confirmation
    if (action === 'reject' || action === 'demote') {
        // Prevent self-demotion check here too, before opening dialog
        if (action === 'demote' && userId === currentUser?._id) {
             toast.error("Cannot change your own admin status.");
             return;
        }
        setActionToConfirm({ action, userId, username });
        setDialogOpen(true);
    } else { 
        // Actions that execute directly (Approve, Promote)
        setActionLoading(userId + '_' + action); // Set loading state for this specific action
        try {
            let responseMessage = '';
            switch (action) {
              case 'approve': 
                responseMessage = (await approveRegistration(userId)).message;
                await fetchPending();
                await fetchMembers(); 
                break;
              case 'promote': 
                if (userId === currentUser?._id) throw new Error("Cannot change your own admin status.");
                responseMessage = (await grantAdminStatus(userId)).message;
                await fetchMembers(); // Refresh members list
                break;
              default: 
                throw new Error('Unhandled direct action: ' + action);
            }
            toast.success(responseMessage || `Action "${action}" successful.`);
        } catch (err) {
           const message = err.message || `Failed to perform action: ${action}`;
           console.error(`Action ${action} failed for user ${userId}:`, err);
           toast.error(message);
        } finally {
           setActionLoading(null); // Clear loading state
        }
    }
  };

  // Function called when confirmation dialog's confirm button is clicked
  const confirmAndExecuteAction = async () => {
    if (!actionToConfirm) return;

    const { action, userId } = actionToConfirm;
    setActionLoading(userId + '_' + action); // Set loading for the confirmed action
    setDialogOpen(false); // Close dialog immediately

    try {
      let responseMessage = '';
      if (action === 'reject') {
        responseMessage = (await rejectRegistration(userId)).message;
        await fetchPending(); // Only need to refresh pending list
      } else if (action === 'demote') {
         if (userId === currentUser?._id) throw new Error("Cannot change your own admin status."); // Double check
         responseMessage = (await revokeAdminStatus(userId)).message;
         await fetchMembers(); // Refresh members list
      }
       toast.success(responseMessage || `Action "${action}" successful.`);
    } catch (err) {
        const message = err.message || `Failed to perform action: ${action}`;
        console.error(`Action ${action} failed for user ${userId}:`, err);
        toast.error(message);
    } finally {
       setActionLoading(null);
       setActionToConfirm(null); // Clear the action to confirm
    }
  };


  return (
    <PageWrapper>
      <h2 className="text-3xl font-bold tracking-tight mb-6">Admin Panel</h2>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pending">Pending Registrations ({pendingUsers.length})</TabsTrigger>
          <TabsTrigger value="manageAdmins">Manage Members ({members.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending">
          {isLoadingPending ? (
            <div className="flex justify-center mt-8"><Spinner /></div>
          ) : errorPending ? (
            <p className="text-destructive text-center mt-8">Error: {errorPending}</p>
          ) : (
            <> {/* Use Fragment to wrap multiple elements */} 
              {pendingUsers.length === 0 ? (
                 <p className="text-muted-foreground text-center mt-8">No pending registrations found.</p>
              ) : (
                <UsernameList 
                  users={pendingUsers} 
                  type="pending" 
                  onUserAction={handleUserAction}
                  actionLoading={actionLoading} // Pass loading state down
                  currentUserId={currentUser?._id}
                />
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="manageAdmins">
           {isLoadingMembers ? (
            <div className="flex justify-center mt-8"><Spinner /></div>
          ) : errorMembers ? (
            <p className="text-destructive text-center mt-8">Error: {errorMembers}</p>
          ) : (
            <> {/* Use Fragment */} 
              {members.length === 0 ? (
                 <p className="text-muted-foreground text-center mt-8">No members found.</p>
              ) : (
                <UsernameList 
                  users={members} 
                  type="manageAdmins" 
                  onUserAction={handleUserAction}
                  actionLoading={actionLoading} // Pass loading state down
                  currentUserId={currentUser?._id}
                />
               )}
             </>
          )}
        </TabsContent>
      </Tabs>

      {/* Confirmation Dialog */}
      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        {/* AlertDialogTrigger is omitted as we trigger manually via state */}
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {actionToConfirm?.action === 'reject' && 
                `This action will permanently reject and delete the registration request for user "${actionToConfirm?.username}". They will need to register again.`
              }
               {actionToConfirm?.action === 'demote' && 
                `This action will revoke admin privileges for user "${actionToConfirm?.username}".`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setActionToConfirm(null)}>Cancel</AlertDialogCancel>
            {/* Call confirmAndExecuteAction on click */}
            <AlertDialogAction 
              onClick={confirmAndExecuteAction}
              // Optionally style the confirmation button differently for destructive actions
              className={actionToConfirm?.action === 'reject' || actionToConfirm?.action === 'demote' ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
            >
                Confirm {actionToConfirm?.action}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </PageWrapper>
  );
};

export default AdminPanelPage;
