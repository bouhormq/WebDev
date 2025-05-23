import React, { useState, useEffect } from 'react';
import { updateUserProfile } from '../../services/userService';
import useAuth from '../../hooks/useAuth';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { toast } from 'sonner';
import styles from './styles/EditProfileForm.module.css'; // Import CSS module

const EditProfileForm = ({ currentUser, onProfileUpdate }) => {
  const [displayName, setDisplayName] = useState('');
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { setCurrentUser } = useAuth();

  useEffect(() => {
    if (currentUser) {
      setDisplayName(currentUser.displayName || currentUser.username || '');
      setProfilePicPreview(currentUser.profilePicUrl ? `${import.meta.env.VITE_API_BASE_URL}${currentUser.profilePicUrl}` : '');
    }
  }, [currentUser]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicFile(file);
      // Create a preview URL for the selected file
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setProfilePicFile(null);
      // Revert to original profile picture if file is deselected, or clear if none
      setProfilePicPreview(currentUser.profilePicUrl ? `${import.meta.env.VITE_API_BASE_URL}${currentUser.profilePicUrl}` : '');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData();
    formData.append('displayName', displayName);
    if (profilePicFile) {
      formData.append('profilePic', profilePicFile);
    }

    try {
      // Pass FormData to the service
      const updatedProfile = await updateUserProfile(currentUser.id || currentUser._id, formData);
      
      // Construct the full URL for the profile picture if it exists
      const fullProfilePicUrl = updatedProfile.profilePicUrl 
        ? `${import.meta.env.VITE_API_BASE_URL}${updatedProfile.profilePicUrl}` 
        : '';
      
      const userForContext = {
        ...updatedProfile,
        profilePicUrl: fullProfilePicUrl, // Use the full URL for context and local state
        id: updatedProfile._id // ensure id is present
      };

      setCurrentUser(userForContext); // Update user in AuthContext
      
      if (onProfileUpdate) {
        onProfileUpdate(userForContext); // Callback to update parent component state
      }
      toast.success('Profile updated successfully!');
      // No need to manually set profilePicPreview here if onProfileUpdate handles it by re-fetching or using returned data
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error(error.message || 'Failed to update profile.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentUser) {
    return <p>Loading profile...</p>;
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div>
        <Label htmlFor="displayName" className={styles.label}>Display Name</Label>
        <Input
          id="displayName"
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Enter your display name"
          className={styles.input}
        />
      </div>
      <div>
        <Label htmlFor="profilePic" className={styles.label}>Profile Picture</Label>
        <Input
          id="profilePic"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className={styles.input}
        />
        {profilePicPreview && (
          <div className={styles.profilePicPreviewContainer}>
            <img src={profilePicPreview} alt="Profile Preview" className={styles.profilePicPreview} />
          </div>
        )}
      </div>
      <Button type="submit" disabled={isLoading} className={styles.submitButton}>
        {isLoading ? 'Saving...' : 'Save Changes'}
      </Button>
    </form>
  );
};

export default EditProfileForm;
