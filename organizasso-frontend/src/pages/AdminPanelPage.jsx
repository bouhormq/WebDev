import React, { useState, useEffect, useCallback } from 'react';
import PageWrapper from '../components/Layout/PageWrapper';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UsernameList from '../components/Admin/UsernameList';
import Spinner from '../components/Common/Spinner';
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"; // No trigger needed
import {
    getPendingRegistrations, 
    getMembers, 
    approveRegistration, 
    rejectRegistration, 
    grantAdminStatus, 
    revokeAdminStatus 
} from '../services/adminService';
import useAuth from '../hooks/useAuth'; 
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"; // For empty states
import { UserCheck, UserCog } from 'lucide-react'; // Icons for tabs

const AdminPanelPage = () => {
  const { currentUser } = useAuth();
  const [pendingUsers, setPendingUsers] = useState([]);
  const [members, setMembers] = useState([]);
  const [isLoadingPending, setIsLoadingPending] = useState(true);
  const [isLoadingMembers, setIsLoadingMembers] = useState(true);
  const [errorPending, setErrorPending] = useState(null);
  const [errorMembers, setErrorMembers] = useState(null);
  const [actionLoading, setActionLoading] = useState(null); 
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionToConfirm, setActionToConfirm] = useState(null);

  // fetchPending and fetchMembers remain the same (already use useCallback)
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

  // handleUserAction and confirmAndExecuteAction remain the same
  const handleUserAction = async (action, userId, username) => {
    if (action === 'reject' || action === 'demote') {
        if (action === 'demote' && userId === currentUser?._id) {
             toast.error("Cannot change your own admin status.");
             return;
        }
        setActionToConfirm({ action, userId, username });
        setDialogOpen(true);
    } else { 
        setActionLoading(userId + '_' + action);
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
                await fetchMembers(); 
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
           setActionLoading(null);
        }
    }
  };
  const confirmAndExecuteAction = async () => {
    if (!actionToConfirm) return;
    const { action, userId } = actionToConfirm;
    setActionLoading(userId + '_' + action);
    setDialogOpen(false); 
    try {
      let responseMessage = '';
      if (action === 'reject') {
        responseMessage = (await rejectRegistration(userId)).message;
        await fetchPending(); 
      } else if (action === 'demote') {
         if (userId === currentUser?._id) throw new Error("Cannot change your own admin status."); 
         responseMessage = (await revokeAdminStatus(userId)).message;
         await fetchMembers();
      }
       toast.success(responseMessage || `Action "${action}" successful.`);
    } catch (err) {
        const message = err.message || `Failed to perform action: ${action}`;
        console.error(`Action ${action} failed for user ${userId}:`, err);
        toast.error(message);
    } finally {
       setActionLoading(null);
       setActionToConfirm(null); 
    }
  };

  // Helper component for empty/error states
  const StatusDisplay = ({ isLoading, error, children, emptyMessage }) => {
    if (isLoading) {
      return <div className="flex justify-center items-center py-12"><Spinner size="lg"/></div>;
    }
    if (error) {
      return <p className="text-destructive text-center py-12">Error: {error}</p>;
    }
    if (React.Children.count(children) === 0) { // Check if list is empty
      return (
         <Card className="mt-4 text-center py-12">
           <CardContent>
             <p className="text-muted-foreground">{emptyMessage}</p>
           </CardContent>
         </Card>
      );
    }
    return children;
  };

  return (
    <PageWrapper>
      <div className="mb-6">
         <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Admin Panel</h1>
         <p className="text-muted-foreground">Manage user registrations and roles.</p>
       </div>

      <Tabs defaultValue="pending" className="w-full space-y-4">
        <TabsList className="grid w-full grid-cols-2 h-11">
           <TabsTrigger value="pending" className="gap-2">
              <UserCheck className="h-4 w-4"/> Pending ({pendingUsers.length})
           </TabsTrigger>
           <TabsTrigger value="manageAdmins" className="gap-2">
              <UserCog className="h-4 w-4"/> Members ({members.length})
           </TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending">
           <StatusDisplay isLoading={isLoadingPending} error={errorPending} emptyMessage="No pending registrations found.">
             {/* Only render UsernameList if there are users */}
             {pendingUsers.length > 0 && (
                 <UsernameList 
                    users={pendingUsers} 
                    type="pending" 
                    onUserAction={handleUserAction}
                    actionLoading={actionLoading}
                    currentUserId={currentUser?._id}
                 />
              )}
           </StatusDisplay>
        </TabsContent>

        <TabsContent value="manageAdmins">
           <StatusDisplay isLoading={isLoadingMembers} error={errorMembers} emptyMessage="No members found.">
             {members.length > 0 && (
                 <UsernameList 
                    users={members} 
                    type="manageAdmins" 
                    onUserAction={handleUserAction}
                    actionLoading={actionLoading}
                    currentUserId={currentUser?._id}
                 />
             )}
           </StatusDisplay>
        </TabsContent>
      </Tabs>

      {/* Confirmation Dialog (remains the same) */}
      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
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
            <AlertDialogAction 
              onClick={confirmAndExecuteAction}
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
