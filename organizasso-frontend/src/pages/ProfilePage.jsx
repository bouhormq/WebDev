import React, { useState, useEffect, useCallback, useRef } from 'react'; // Import useRef
import { useParams } from 'react-router-dom';
import PageWrapper from '../components/Layout/PageWrapper';
import UserInfo from '../components/Profile/UserInfo';
import UserMessages from '../components/Profile/UserMessages';
import useAuth from '../hooks/useAuth';
import { toast } from "sonner";
import Spinner from '../components/Common/Spinner';
import { getUserProfile, getUserMessages, deleteUserMessage, updateUserProfile } from '../services/userService';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Keep for base structure
import { Separator } from "@/components/ui/separator"; // Import Separator
import { Button } from "@/components/ui/button"; // Keep for base structure
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Pencil } from 'lucide-react';
import styles from './styles/ProfilePage.module.css'; // Updated import path
import StarRating from '../components/Common/StarRating'; // Import StarRating

const ProfilePage = () => {
  const { userId } = useParams();
  const { currentUser, setCurrentUser } = useAuth();
  const isOwnProfile = currentUser?._id === userId;
  const fileInputRef = useRef(null); // Ref for file input

  const [userInfo, setUserInfo] = useState(null);
  const [userMessages, setUserMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false); // State to toggle edit form
  const [isEditingName, setIsEditingName] = useState(false);
  const [editableName, setEditableName] = useState('');
  const [isSavingName, setIsSavingName] = useState(false);
  const [totalLikesReceived, setTotalLikesReceived] = useState(0); // State for total likes

  useEffect(() => {
    if (userInfo && (userInfo.displayName || userInfo.username)) {
      document.title = `${userInfo.displayName || userInfo.username}'s Profile | Organizasso`;
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
        id: profile._id, // Ensure id is available for EditProfileForm
        createdAt: profile.createdAt ? new Date(profile.createdAt) : null,
        joinDate: profile.joinDate ? new Date(profile.joinDate) : (profile.createdAt ? new Date(profile.createdAt) : null),
        displayName: profile.displayName || profile.username,
        profilePicUrl: profile.profilePicUrl || '',
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

  // Calculate total likes when userMessages changes
  useEffect(() => {
    if (userMessages && userMessages.length > 0) {
      // console.log('ProfilePage: userMessages for like calculation (first 5):', JSON.stringify(userMessages.slice(0,5).map(m => ({ id: m._id, likeCount: m.likeCount })), null, 2)); // Optional deeper log
      const total = userMessages.reduce((sum, msg) => {
        const likes = Number(msg.likeCount); // Explicitly convert to number
        // console.log(`Inspecting message for likes: ID=${msg._id}, original likeCount=${msg.likeCount}, parsed likes=${likes}`); // Log each message's contribution
        return sum + (isNaN(likes) ? 0 : likes); // Add to sum if it's a valid number, otherwise add 0
      }, 0);
      setTotalLikesReceived(total);
      // Log the calculated total and a sample of messages with their likeCounts
      console.log('ProfilePage: Calculated totalLikesReceived:', total, 'from messages (sample):', userMessages.slice(0, 3).map(m => ({_id: m._id, likeCount: m.likeCount })));
    } else {
      setTotalLikesReceived(0);
      // console.log('ProfilePage: userMessages is empty or undefined, totalLikesReceived set to 0'); // This log is still relevant
    }
  }, [userMessages]);

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

  const handleProfileUpdate = (updatedProfile) => {
    const formattedUpdatedProfile = {
      ...updatedProfile,
      id: updatedProfile._id,
      createdAt: updatedProfile.createdAt ? new Date(updatedProfile.createdAt) : null,
      joinDate: updatedProfile.joinDate ? new Date(updatedProfile.joinDate) : (updatedProfile.createdAt ? new Date(updatedProfile.createdAt) : null),
      displayName: updatedProfile.displayName || updatedProfile.username,
      profilePicUrl: updatedProfile.profilePicUrl || '',
    };
    setUserInfo(formattedUpdatedProfile);
    if (isOwnProfile) {
      setCurrentUser(formattedUpdatedProfile); // Update AuthContext if it's the current user
    }
    setShowEditForm(false); // Hide form after update
  };

  const handleEditNameClick = () => {
    setIsEditingName(true);
    setEditableName(userInfo.displayName || userInfo.username || '');
  };

  const handleCancelEditName = () => {
    setIsEditingName(false);
  };

  const handleSaveName = async () => {
    if (editableName.trim() === (userInfo.displayName || userInfo.username || '')) { // Added userInfo.username as fallback
      setIsEditingName(false);
      return; // No change
    }
    setIsSavingName(true);
    const formData = new FormData();
    formData.append('displayName', editableName.trim());
    
    try {
      // Assuming updateUserProfile is already imported from '../services/userService'
      const updatedProfileFromServer = await updateUserProfile(userInfo.id, formData); 
      
      // Ensure the profilePicUrl is correctly formatted for handleProfileUpdate
      // This logic should align with how profilePicUrl is handled elsewhere (e.g., in fetchProfileData or EditProfileForm)
      // For simplicity, we'll assume updatedProfileFromServer returns the necessary fields.
      // If profilePicUrl needs specific prefixing (like VITE_API_BASE_URL), that should be handled here or in handleProfileUpdate.
      
      // The existing handleProfileUpdate function expects a certain structure.
      // Let's ensure the object passed to it is consistent.
      // It already handles formatting like date conversion and setting displayName.
      handleProfileUpdate(updatedProfileFromServer); 
      setIsEditingName(false);
      toast.success('Display name updated successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to update display name.');
    } finally {
      setIsSavingName(false);
    }
  };

  const handleProfilePicChange = async (event) => {
    const file = event.target.files[0];
    if (!file) {
      return;
    }

    const formData = new FormData();
    formData.append('profilePic', file);

    toast.info('Updating profile picture...');
    try {
      const updatedProfileFromServer = await updateUserProfile(userInfo.id, formData);
      handleProfileUpdate(updatedProfileFromServer);
      toast.success('Profile picture updated successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile picture.');
    } finally {
      // Reset file input value to allow re-uploading the same file if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = null;
      }
    }
  };

  if (isLoading) {
    return (
      <PageWrapper>
        <div className={styles.centeredFlexMinHeight}><Spinner size="large" /></div>
      </PageWrapper>
    );
  }

  if (error && !userInfo) { // Show error only if userInfo is not loaded
    return (
      <PageWrapper>
        <div className={styles.centeredFlexMinHeight}>
          <div className={styles.errorCard}>
            <div className={styles.errorTitle}>Error Loading Profile</div>
            <p className={styles.errorParagraph}>{error}</p>
          </div>
        </div>
      </PageWrapper>
    );
  }

  if (!userInfo) {
    return (
      <PageWrapper>
        <div className={styles.notFoundContainer}>
          {/* CardHeader and CardTitle might be from ui/card, so keep them if they provide base styling */}
          <CardHeader>
            <CardTitle className={styles.notFoundTitle}>User Not Found</CardTitle> {/* Added className */}
          </CardHeader>
          <CardContent>
            <p className={styles.notFoundText}>The profile you are looking for does not exist or could not be loaded.</p> {/* Added className */}
          </CardContent>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className={styles.pageContainer}>
        <Card className={styles.profileCard}>
          <div className={styles.headerDiv}>
            <h1 className={styles.h1Style}>
              <span role="img" aria-label="forum">👨🏻</span> Profile Panel
            </h1>
            <p className={styles.pMuted}>View messages and delete, check rating, edit profile name and profile picture. </p>
          </div>
          <Separator className={styles.separator} />
          <CardHeader className={styles.cardHeader}>
            <div className={styles.headerLayout}>
              {userInfo && (
                <div 
                  className={`${styles.avatarContainer} ${isOwnProfile ? styles.clickableAvatarContainer : ''}`}
                  onClick={isOwnProfile ? () => fileInputRef.current?.click() : undefined}
                  role={isOwnProfile ? "button" : undefined}
                  tabIndex={isOwnProfile ? 0 : undefined}
                  onKeyDown={isOwnProfile ? (e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); } : undefined}
                  aria-label={isOwnProfile ? "Change profile picture" : undefined}
                >
                  <Avatar className={styles.avatar}>
                    {(() => {
                      let srcUrl = null;
                      if (userInfo.profilePicUrl) {
                        if (userInfo.profilePicUrl.startsWith('http://') || userInfo.profilePicUrl.startsWith('https://')) {
                          srcUrl = userInfo.profilePicUrl;
                        } else {
                          const serverOrigin = new URL(import.meta.env.VITE_API_BASE_URL).origin;
                          let path = userInfo.profilePicUrl;
                          if (!path.startsWith('/')) {
                            path = '/' + path;
                          }
                          srcUrl = serverOrigin + path;
                        }
                      }

                      if (srcUrl) {
                        return <AvatarImage src={srcUrl} alt={userInfo.displayName || userInfo.username} />;
                      } else {
                        return (
                          <AvatarFallback className={styles.avatarFallback}>
                            {userInfo.displayName ? userInfo.displayName.charAt(0).toUpperCase() : 
                             (userInfo.username ? userInfo.username.charAt(0).toUpperCase() : '?')}
                          </AvatarFallback>
                        );
                      }
                    })()}
                  </Avatar>
                  {isOwnProfile && (
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleProfilePicChange}
                      className={styles.hiddenInput} // Added className
                      accept="image/*"
                    />
                  )}
                  {/* Pencil icon overlay for editing profile picture (visual cue) */}
                  {isOwnProfile && (
                    <div className={styles.avatarOverlayIconContainer}>
                      <Pencil className={styles.avatarPencilIcon} />
                    </div>
                  )}
                </div>
              )}

              <div className={styles.userInfoColumn}> {/* Renamed from titleButtonColumn for clarity */}
                {isEditingName ? (
                  <>
                    <Input
                      type="text"
                      value={editableName}
                      onChange={(e) => setEditableName(e.target.value)}
                      className={styles.inlineNameInput}
                      aria-label="Edit display name"
                    />
                    <div className={styles.inlineEditActions}>
                      <Button onClick={handleSaveName} disabled={isSavingName} className={styles.saveNameButton}>
                        {isSavingName ? 'Saving...' : 'Save'}
                      </Button>
                      <Button onClick={handleCancelEditName} variant="outline" className={styles.cancelNameButton}>
                        Cancel
                      </Button>
                    </div>
                  </>
                ) : (
                  // Container for Name and Edit Icon
                  <div className={styles.nameAndEditContainer}>
                    <CardTitle className={styles.cardTitle}>
                      {userInfo.displayName || userInfo.username}
                    </CardTitle>
                    {isOwnProfile && (
                      <Pencil
                        className={styles.editNameIcon}
                        size={18} // Or your preferred size
                        onClick={handleEditNameClick}
                        aria-label="Edit display name"
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleEditNameClick(); }}
                      />
                    )}
                  </div>
                )}
                {/* StarRating moved here, outside the conditional rendering for name editing, but still within userInfoColumn */}
                {!isEditingName && (
                  <div className={styles.starRatingContainer}>
                    <StarRating totalLikes={totalLikesReceived} />
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          <UserMessages
          messages={userMessages}
          currentUserId={currentUser?._id} 
          onDeleteRequest={handleDeleteMessage} 
        />
        </Card>
      </div>
    </PageWrapper>
  );
};

export default ProfilePage;
