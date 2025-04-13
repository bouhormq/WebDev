// organizasso-frontend/src/services/adminService.js
// eslint-disable-next-line no-unused-vars
import apiClient from './apiClient';

// Get Pending Registrations
export const getPendingRegistrations = async () => {
  try {
    const response = await apiClient.get('/admin/pending');
    return response.data;
  } catch (error) {
    console.error("API Error fetching pending registrations:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to fetch pending registrations");
  }
};

// Get Members
export const getMembers = async () => {
  try {
    const response = await apiClient.get('/admin/members');
    return response.data;
  } catch (error) {
    console.error("API Error fetching members:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to fetch members");
  }
};

// Approve Registration
export const approveRegistration = async (userId) => {
  try {
    const response = await apiClient.post(`/admin/users/${userId}/approve`);
    return response.data; // { message: "..." }
  } catch (error) {
    console.error(`API Error approving user ${userId}:`, error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to approve user");
  }
};

// Reject Registration
export const rejectRegistration = async (userId) => {
  try {
    const response = await apiClient.post(`/admin/users/${userId}/reject`);
    return response.data; // { message: "..." }
  } catch (error) {
    console.error(`API Error rejecting user ${userId}:`, error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to reject user");
  }
};

// Grant Admin Status
export const grantAdminStatus = async (userId) => {
  try {
    const response = await apiClient.post(`/admin/users/${userId}/grant-admin`);
    return response.data; // { message: "..." }
  } catch (error) {
    console.error(`API Error granting admin to user ${userId}:`, error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to grant admin status");
  }
};

// Revoke Admin Status
export const revokeAdminStatus = async (userId) => {
  try {
    const response = await apiClient.post(`/admin/users/${userId}/revoke-admin`);
    return response.data; // { message: "..." }
  } catch (error) {
    console.error(`API Error revoking admin from user ${userId}:`, error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to revoke admin status");
  }
};
