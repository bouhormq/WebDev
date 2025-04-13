import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import PageWrapper from '../components/Layout/PageWrapper';
import UserInfo from '../components/Profile/UserInfo';
import UserMessages from '../components/Profile/UserMessages';
import useAuth from '../hooks/useAuth';
import { toast } from "sonner";
import Spinner from '../components/Common/Spinner';
import { getUserProfile, getUserMessages, deleteUserMessage } from '../services/userService';

const ProfilePage = () => {
  const { userId } = useParams();
  const { currentUser } = useAuth();
  const isOwnProfile = currentUser?._id === userId;

  const [userInfo, setUserInfo] = useState(null);
  const [userMessages, setUserMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfileData = async () => {
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
            createdAt: msg.createdAt ? new Date(msg.createdAt) : null,
            timestamp: msg.createdAt ? new Date(msg.createdAt) : null
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
    };

    fetchProfileData();
  }, [userId]);

  const handleDeleteMessage = async (messageId) => {
    if (!isOwnProfile) {
        toast.error("Cannot delete messages from another user's profile.");
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
  };

  return (
    <PageWrapper>
      {isLoading ? (
        <div className="flex justify-center pt-8"><Spinner /></div>
      ) : error ? (
        <p className="text-destructive text-center pt-8">Error: {error}</p>
      ) : userInfo ? (
        <div className="space-y-6">
          <UserInfo user={userInfo} isCurrentUserProfile={isOwnProfile} />
          <UserMessages 
            messages={userMessages} 
            isOwnProfile={isOwnProfile} 
            onDelete={handleDeleteMessage} 
          />
        </div>
      ) : (
        <p className="text-muted-foreground text-center pt-8">User profile not found.</p>
      )}
    </PageWrapper>
  );
};

export default ProfilePage;
