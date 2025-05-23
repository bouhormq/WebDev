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
import { Card, CardContent} from "@/components/ui/card"; // For empty states
import { UserCheck, UserCog } from 'lucide-react'; // Icons for tabs
import { Separator } from "@/components/ui/separator"; // Import Separator
import styles from './styles/AdminPanelPage.module.css'; // Import the new CSS module

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

  useEffect(() => {
    document.title = 'Admin Panel | Organizasso';
  }, []);

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

  const handleUserAction = async (action, userId, username) => {
    // Prevent admin from changing their own status for promote/demote actions
    if ((action === 'demote' || action === 'promote') && userId === currentUser?._id) {
        toast.error("Cannot change your own admin status.");
        return;
    }

    if (action === 'reject') {
        // For 'reject', set up the confirmation dialog
        setActionToConfirm({ action, userId, username });
        setDialogOpen(true);
    } else {
        // For 'approve', 'promote', and 'demote', perform the action directly
        setActionLoading(userId + '_' + action);
        try {
            let responseMessage = '';
            switch (action) {
              case 'approve': 
                responseMessage = (await approveRegistration(userId)).message;
                await fetchPending(); // Refresh pending list
                await fetchMembers(); // Refresh members list as user is now a member
                break;
              case 'promote': 
                // Self-action is already checked above
                responseMessage = (await grantAdminStatus(userId)).message;
                await fetchMembers(); // Refresh members list to reflect new admin status
                break;
              case 'demote':
                // Self-action is already checked above
                responseMessage = (await revokeAdminStatus(userId)).message;
                await fetchMembers(); // Refresh members list to reflect revoked admin status
                break;
              default: 
                console.error('Unhandled direct action:', action);
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
      // Use a class from the CSS module for spinner container if specific styling is needed beyond centering
      return <div className={styles.spinnerContainer}><Spinner size="lg"/></div>;
    }
    if (error) {
      // Use classes from the CSS module for error display
      return <div className={styles.errorAlert}><p className={styles.errorAlertDesc}>Error: {error}</p></div>;
    }
    if (React.Children.count(children) === 0) { // Check if list is empty
      return (
         // Use Card component with classes for styling if needed, or simple divs
         <Card className={styles.emptyStateCard}> {/* Added example class */}
           <CardContent className={styles.emptyStateCardContent}> {/* Added example class */}
             <p className={styles.pMuted}>{emptyMessage}</p>
           </CardContent>
         </Card>
      );
    }
    return children;
  };

  return (
    <PageWrapper className={styles.pageContainer}>
        
      <div className={styles.contentWrapper}>
        <div className={styles.headerDiv}>
          <h1 className={styles.h1Style}>
            <span role="img" aria-label="forum">👨🏻‍💻</span> Admin Panel
          </h1>
          <p className={styles.pMuted}>Manage user registrations, roles, and other site settings.</p>
        </div>

        <Separator className={styles.separator} />

        <Tabs defaultValue="pending" className={styles.tabsRoot}>
          <TabsList className={styles.tabsList}>
            <TabsTrigger 
              value="pending" 
              className={`${styles.tabsTrigger} black-white-tab`} // Added black-white-tab for specific active state styling if needed
            >
              <UserCheck className={styles.tabIcon}/> Pending ({pendingUsers.length})
            </TabsTrigger>
            <TabsTrigger 
              value="manageAdmins" 
              className={`${styles.tabsTrigger} black-white-tab`} // Added black-white-tab
            >
              <UserCog className={styles.tabIcon}/> Members ({members.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="pending" className={styles.tabsContent}>
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

          <TabsContent value="manageAdmins" className={styles.tabsContent}>
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
              {/* Only show description for 'reject' as 'demote' is now direct */}
              {actionToConfirm?.action === 'reject' && 
                `This action will permanently reject and delete the registration request for user "${actionToConfirm?.username}". They will need to register again.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setActionToConfirm(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmAndExecuteAction}
              // Apply variant directly if available, or use a conditional class from CSS module
              variant={actionToConfirm?.action === 'reject' ? "destructive" : "default"}
            >
                  Confirm {actionToConfirm?.action}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div> {/* Closing contentWrapper div */}
    </PageWrapper>
  );
};

export default AdminPanelPage;
