# Organiz'asso - Testing Guide (User Personas)

This guide provides manual testing flows based on user personas to validate the features of the Organiz'asso application.

## Prerequisites

Before starting, ensure the following conditions are met:

1.  **Application Running:**
    *   The backend server is running (e.g., `cd organizasso-backend && npm run dev`).
    *   The frontend development server is running (e.g., `cd organizasso-frontend && npm run dev`). Access via `http://localhost:5173`.
2.  **Initial Database State:**
    *   Have credentials for at least one **Administrator** user (`isAdmin: true`, `isApproved: true`). If none exists, register a user, stop the servers, and manually update their `isAdmin` and `isApproved` fields to `true` in the MongoDB database (`organizasso.users` collection). Then restart the servers.
    *   Ensure no other users exist initially to follow the flows cleanly.
3.  **MongoDB Text Index:** (If testing search) The text index for message searching must be created:
    *   Connect using `mongosh mongodb://localhost:27017/organizasso`
    *   Run: `db.messages.createIndex({ content: "text" })`

---

## Testing Personas & Flows

### Persona 1: New Visitor

*Goal: Explore the site, register an account.* 

1.  **Explore Public Access:**
    *   **Action:** Open a new incognito browser window. Navigate to `http://localhost:5173`.
    *   **Expected:** Redirected to `/login` page. Header shows "Login" and "Register" buttons.
2.  **Attempt Access to Protected Areas:**
    *   **Action:** Try navigating directly to `/dashboard`, `/profile/someUserId`, `/admin`, `/forum/open`, `/forum/closed`, `/search`.
    *   **Expected:** Redirected to `/login` page for all attempts.
3.  **Navigate to Registration:**
    *   **Action:** Click the "Register" button or navigate to `/register`.
    *   **Expected:** Registration page loads with the form.
4.  **Register Account (Success):**
    *   **Action:** Fill form with unique credentials (e.g., `newUser`, `new@test.com`, `password123`). Submit.
    *   **Expected:** Stay on registration page. See success alert: "Registration Submitted! ... You can now login once an administrator approves your account." Link to Login page is present.
5.  **Register Account (Fail - Duplicate):**
    *   **Action:** Try registering *again* with the *same* username or email.
    *   **Expected:** Stay on registration page. See error toast/message like "Username already taken." or "Email already registered." Form does *not* show success message.
6.  **Attempt Login (Pending User):**
    *   **Action:** Click the "Login" link or navigate to `/login`. Try logging in with the `newUser` credentials.
    *   **Expected:** Stay on login page. See error toast/message: "Your account is pending admin approval."

### Persona 2: Administrator

*Goal: Log in, manage users, access admin features, interact with forums.* 

**Assumptions:** `newUser` from Persona 1 is pending approval. You have admin credentials.

1.  **Login as Admin:**
    *   **Action:** Navigate to `/login`. Log in with Administrator credentials.
    *   **Expected:** Login successful. Redirected to `/dashboard`. Header shows "Admin Panel", "Closed Forum", profile link, and logout.
2.  **Access & Review Admin Panel:**
    *   **Action:** Navigate to `/admin`.
    *   **Expected:** Admin Panel loads. "Pending Registrations" tab is selected. See `newUser` listed.
3.  **Approve Pending User:**
    *   **Action:** In "Pending Registrations", find `newUser`. Click "Approve".
    *   **Expected:** Success toast. User `newUser` disappears from the pending list. Spinner shown during action.
4.  **Verify User in Members List:**
    *   **Action:** Click the "Manage Members" tab.
    *   **Expected:** See `newUser` listed without "(Admin)" tag. Your own account is listed with "(Admin) (Your Account)".
5.  **Attempt Self-Demotion:**
    *   **Action:** Find your own admin account in "Manage Members".
    *   **Expected:** "Demote" button should be disabled or absent. Hovering might show a tooltip.
6.  **Promote Regular User to Admin:**
    *   **Action:** Find `newUser`. Click "Promote".
    *   **Expected:** Success toast. `newUser` now has the "(Admin)" tag. Spinner shown.
7.  **Demote User from Admin:**
    *   **Action:** Find `newUser`. Click "Demote".
    *   **Expected:** Confirmation dialog appears. Click "Confirm". Success toast. `newUser` loses the "(Admin)" tag. Spinner shown.
8.  **Reject Another Pending User:**
    *   **Action:** *(Requires another registration)* Log out. Register `anotherPendingUser`. Log back in as Admin. Go to Admin Panel > Pending. Find `anotherPendingUser`. Click "Reject".
    *   **Expected:** Confirmation dialog appears. Click "Confirm". Success toast. `anotherPendingUser` disappears from the list. Spinner shown.
9.  **Access & Use Closed Forum:**
    *   **Action:** Navigate to `/forum/closed`.
    *   **Expected:** Closed Forum page loads.
    *   **Action:** Click "Create New Admin Thread". Fill Title ("Admin Test Thread") and Content. Submit.
    *   **Expected:** Success toast. Redirected to the new admin thread page.
    *   **Action:** Navigate back to `/forum/closed`.
    *   **Expected:** "Admin Test Thread" is listed.
10. **Interact in Open Forum:**
    *   **Action:** Navigate to `/forum/open`. Create a thread ("Open Test Thread by Admin"). View it. Post a reply.
    *   **Expected:** All actions succeed. Thread/reply appear correctly.
11. **View Own Profile (Admin):**
    *   **Action:** Navigate to your profile via header link.
    *   **Expected:** Profile loads. See "Admin Test Thread", "Open Test Thread by Admin", and the reply listed under "Messages Posted". Delete buttons are present for all.
12. **Logout:**
    *   **Action:** Click "Logout".
    *   **Expected:** Redirected to `/login`.

### Persona 3: Approved Member

*Goal: Log in, participate in the open forum, view profiles, manage own messages, use search.* 

**Assumptions:** `newUser` was approved by the Admin (and potentially demoted back to regular member). "Open Test Thread by Admin" exists.

1.  **Login as Approved Member:**
    *   **Action:** Navigate to `/login`. Log in with `newUser` credentials.
    *   **Expected:** Login successful. Redirected to `/dashboard`. Header does *not* show Admin Panel or Closed Forum links.
2.  **Attempt Access to Admin Areas:**
    *   **Action:** Try navigating directly to `/admin` and `/forum/closed`.
    *   **Expected:** Redirected away (likely to `/dashboard` or `/forum/open`) or shown an unauthorized message/page.
3.  **View Open Forum & Existing Thread:**
    *   **Action:** Navigate to `/forum/open`.
    *   **Expected:** See "Open Test Thread by Admin" listed.
    *   **Action:** Click on the thread title.
    *   **Expected:** Thread view page loads, showing messages by Admin.
4.  **Reply to Thread:**
    *   **Action:** Type a reply (min 10 chars) in the reply form. Submit.
    *   **Expected:** Success toast. Your reply appears at the bottom of the message list.
5.  **Create New Thread:**
    *   **Action:** Navigate back to `/forum/open`. Click "Create New Thread". Fill Title ("Member Test Thread") and Content. Submit.
    *   **Expected:** Success toast. Redirected to the new thread page.
6.  **View Own Profile:**
    *   **Action:** Navigate to your profile via header link (`/profile/newUser-id`).
    *   **Expected:** Profile loads. See "Member Test Thread" (initial post) and your reply to the admin's thread listed under "Messages Posted". Delete buttons are visible next to both.
7.  **View Another User's Profile (Admin's):**
    *   **Action:** *(Requires knowing admin's user ID)* Navigate to `/profile/adminUserId`.
    *   **Expected:** Admin's profile loads. See their messages ("Open Test Thread by Admin", "Admin Test Thread"). Delete buttons are *not* visible.
8.  **Delete Own Reply:**
    *   **Action:** Go back to your own profile. Find the reply you posted to the admin's thread. Click "Delete".
    *   **Expected:** Confirmation prompt. Confirm. Success toast. The reply disappears from your message list.
9.  **Delete Own Thread (Initial Post):**
    *   **Action:** On your profile, find the initial post for "Member Test Thread". Click "Delete".
    *   **Expected:** Confirmation prompt. Confirm. Success toast. The thread's initial post disappears.
    *   **Action:** Navigate to `/forum/open`. Verify the "Member Test Thread" is gone or shows as empty/deleted (depending on implementation).
10. **Use Search:**
    *   **Action:** Navigate to `/search`.
    *   **Action:** Search for a keyword present in the remaining "Open Test Thread by Admin" (e.g., "Admin").
    *   **Expected:** Spinner shown. Search results display the relevant message(s).
    *   **Action:** Search for a keyword *not* present (e.g., "xyzzy").
    *   **Expected:** Spinner shown. "No messages found..." message displayed.
11. **Logout:**
    *   **Action:** Click "Logout".
    *   **Expected:** Redirected to `/login`.

---

*Remember to check the browser's developer console (F12) for any errors during testing.* 