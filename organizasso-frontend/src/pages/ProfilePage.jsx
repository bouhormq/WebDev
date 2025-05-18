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

  useEffect(() => {
    if (userInfo && userInfo.username) {
      document.title = `${userInfo.username}'s Profile | Organizasso`;
    } else {
      document.title = 'Profile | Organizasso';
    }
  }, [userInfo]);

  const fetchProfileData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log(`ProfilePage (${userId}): Fetching profile data from API...`);
      const [profile, messages] = await Promise.all([
        getUserProfile(userId),
        getUserMessages(userId),
      ]);

      const formattedProfile = {
        ...profile,
        createdAt: profile.createdAt ? new Date(profile.createdAt) : null,
        joinDate: profile.joinDate ? new Date(profile.joinDate) : (profile.createdAt ? new Date(profile.createdAt) : null),
      };
      const formattedMessages = messages.map(msg => ({
        ...msg,
        _id: msg._id,
        createdAt: msg.createdAt ? new Date(msg.createdAt) : null,
        authorName: msg.authorName || profile?.username || 'Unknown',
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
  }, [isOwnProfile, userMessages, userId]);

  // --- Inline Styles ---
  const centeredFlexMinHeightStyle = { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' };
  const errorCardStyle = { width: '100%', maxWidth: '32rem', textAlign: 'center', padding: '1.5rem' };
  const errorTitleStyle = { fontSize: '1.25rem', fontWeight: 600, color: 'var(--destructive)' };
  const errorPStyle = { color: 'var(--muted-foreground)' };
  const notFoundDivStyle = { textAlign: 'center', paddingTop: '3rem' };
  const notFoundH2Style = { fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' };
  const notFoundPStyle = { color: 'var(--muted-foreground)' };
  // --- End Inline Styles ---

  return (
    <PageWrapper>
      {isLoading ? (
        <div style={centeredFlexMinHeightStyle}><Spinner size="lg" /></div>
      ) : error ? (
        <div style={centeredFlexMinHeightStyle}>
          <Card style={errorCardStyle}>
            <CardHeader>
              <CardTitle style={errorTitleStyle}>Error Loading Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <p style={errorPStyle}>{error}</p>
            </CardContent>
          </Card>
        </div>
      ) : userInfo ? (
        <div>
          <div style={{ marginBottom: '1.5rem' }}>
            <UserInfo user={userInfo} isCurrentUserProfile={isOwnProfile} />
          </div>
          <Card>
            <UserMessages
              messages={userMessages}
              isOwnProfile={isOwnProfile}
              onDelete={handleDeleteMessage}
            />
          </Card>
        </div>
      ) : (
        <div style={notFoundDivStyle}>
          <h2 style={notFoundH2Style}>Profile Not Found</h2>
          <p style={notFoundPStyle}>The requested user profile could not be found.</p>
        </div>
      )}
    </PageWrapper>
  );
};

export default ProfilePage;
