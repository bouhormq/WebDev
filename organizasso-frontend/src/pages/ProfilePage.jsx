import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import PageWrapper from '../components/Layout/PageWrapper';
import UserInfo from '../components/Profile/UserInfo';
import UserMessages from '../components/Profile/UserMessages';
import useAuth from '../hooks/useAuth';
import { toast } from "sonner";
import Spinner from '../components/Common/Spinner';
import { getUserProfile, getUserMessages, deleteUserMessage } from '../services/userService';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ProfilePage = () => {
  const { userId } = useParams();
  const { currentUser } = useAuth();
  const isOwnProfile = currentUser?._id === userId;

  const [userInfo, setUserInfo] = useState(null);
  const [userMessages, setUserMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfileData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log(`ProfilePage (${userId}): Fetching profile data from API...`);
      const [profile, messages] = await Promise.all([
          getUserProfile(userId),
          getUserMessages(userId)
      ]);

      const formattedProfile = {
          ...profile,
          createdAt: profile.createdAt ? new Date(profile.createdAt) : null,
          joinDate: profile.joinDate ? new Date(profile.joinDate) : (profile.createdAt ? new Date(profile.createdAt) : null)
      };
       const formattedMessages = messages.map(msg => ({
          ...msg,
          _id: msg._id,
          createdAt: msg.createdAt ? new Date(msg.createdAt) : null,
          authorName: msg.authorName || profile?.username || 'Unknown'
       }));

      setUserInfo(formattedProfile);
      setUserMessages(formattedMessages);

    } catch (err) {
      const message = err.message || "Failed to fetch profile data.";
      console.error(message, err);
      setError(message);
      toast.error(message);
      setUserInfo(null);
      setUserMessages([]);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const handleDeleteMessage = useCallback(async (messageId) => {
    if (!isOwnProfile) {
        toast.error("Cannot delete messages from another user's profile.");
        return;
    }
     if (!window.confirm("Are you sure you want to delete this message?")) {
      return;
    }

    const originalMessages = userMessages;
    setUserMessages(prev => prev.filter(msg => msg._id !== messageId));
    toast.info("Deleting message...");

    try {
        console.log(`ProfilePage (${userId}): Deleting message ${messageId} via API...`);
        await deleteUserMessage(messageId);
        toast.success("Message deleted successfully!");
    } catch (err) {
        const message = err.message || "Failed to delete message.";
        console.error(message, err);
        toast.error(message);
        setUserMessages(originalMessages);
    }
  }, [isOwnProfile, userMessages]);

  return (
    <PageWrapper>
      {isLoading ? (
        <div className="flex justify-center items-center min-h-[300px]"><Spinner size="lg"/></div>
      ) : error ? (
         <div className="flex justify-center items-center min-h-[300px]">
           <Card className="w-full max-w-md text-center p-6">
             <CardHeader>
                <CardTitle className="text-xl font-semibold text-destructive">Error Loading Profile</CardTitle>
             </CardHeader>
             <CardContent>
                <p className="text-muted-foreground">{error}</p>
             </CardContent>
           </Card>
         </div>
      ) : userInfo ? (
        <div className="space-y-6">
          <UserInfo user={userInfo} isCurrentUserProfile={isOwnProfile} />
          <Card>
            <UserMessages 
              messages={userMessages} 
              isOwnProfile={isOwnProfile} 
              onDelete={handleDeleteMessage} 
            />
          </Card>
        </div>
      ) : (
         <div className="text-center pt-12">
           <h2 className="text-xl font-semibold mb-2">Profile Not Found</h2>
           <p className="text-muted-foreground">The requested user profile could not be found.</p>
         </div>
      )}
    </PageWrapper>
  );
};

export default ProfilePage;
