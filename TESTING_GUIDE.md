# Organiz'asso - Testing Guide

This guide provides a set of user flows to manually test and validate the features of the Organiz'asso application.

## Prerequisites

Before starting, ensure the following conditions are met:

1.  **Database State:**
    *   At least one **Administrator** user exists (`isAdmin: true`, `isApproved: true`). Default credentials (if seeded from `.env`) are `admin` / `changeme123`.
    *   At least one **Pending** user account exists (`isApproved: false`). Register a new user if needed.
    *   At least one regular **Approved Member** user exists (`isApproved: true`, `isAdmin: false`). Approve a pending user via the Admin Panel if needed.
    *   Some existing messages and threads are present in the **Open Forum** for testing views and replies.
2.  **MongoDB Text Index:** The text index for message searching must be created:
    *   Connect using `mongosh mongodb://localhost:27017/organizasso`
    *   Run: `db.messages.createIndex({ content: "text" })`
3.  **Application Running:**
    *   The backend server is running (e.g., `cd organizasso-backend && npm run dev`).
    *   The frontend development server is running (e.g., `cd organizasso-frontend && npm run dev`).

---

## Testing Flows

### Flow 1: Visitor Experience & Registration

1.  **Access Control (Logged Out):**
    *   **Action:** Open a new browser/incognito window. Try navigating directly to `/dashboard`, `/profile/someUserId`, `/admin`, `/forum/open`, `/forum/closed`, `/search`.
    *   **Expected:** Redirected to `/login` page for all attempts.
2.  **Registration (Success):**
    *   **Action:** Navigate to `/register`. Fill form with unique username/email and a valid password (e.g., `pendingUser`/`pending@test.com`/`password123`). Submit.
    *   **Expected:** Redirected (likely to `/login`) with a success toast: "Registration request submitted successfully. Please wait for admin approval."
3.  **Registration (Fail - Duplicate):**
    *   **Action:** Navigate to `/register`. Try registering with the *same* username or email used above.
    *   **Expected:** Stay on `/register`. See error toast/message like "Username already taken." or "Email already registered."
4.  **Login Attempt (Pending):**
    *   **Action:** Navigate to `/login`. Try logging in with the `pendingUser` credentials.
    *   **Expected:** Stay on `/login`. See error toast/message: "Your account is pending admin approval."
5.  **Login Attempt (Invalid):**
    *   **Action:** Navigate to `/login`. Try logging in with correct username but wrong password, or non-existent username.
    *   **Expected:** Stay on `/login`. See error toast/message: "Invalid credentials".

### Flow 2: Admin - User Management & Forum Access

1.  **Login (Admin):**
    *   **Action:** Navigate to `/login`. Log in with Administrator credentials.
    *   **Expected:** Login successful, redirect to `/dashboard`. Header shows "Admin Panel" and "Closed Forum".
2.  **Access Admin Panel:**
    *   **Action:** Navigate to `/admin`.
    *   **Expected:** Admin Panel loads, showing tabs.
3.  **Approve Pending User:**
    *   **Action:** Go to "Pending Registrations". Find `pendingUser`. Click "Approve".
    *   **Expected:** Success toast. User removed from pending list. Spinner shown. Go to "Manage Members", see `pendingUser` listed (no admin tag).
4.  **Reject Pending User:**
    *   **Action:** *(Requires another pending user)*. Go to "Pending Registrations", find the *other* pending user. Click "Reject".
    *   **Expected:** Confirmation dialog appears. Click "Confirm". Success toast. User removed from list. Spinner shown.
5.  **Grant Admin Status:**
    *   **Action:** Go to "Manage Members". Find the *approved* user (originally `pendingUser`). Click "Promote".
    *   **Expected:** Success toast. User gets "(Admin)" tag. Spinner shown.
6.  **Revoke Admin Status:**
    *   **Action:** Find the user just promoted. Click "Demote".
    *   **Expected:** Confirmation dialog appears. Click "Confirm". Success toast. User loses "(Admin)" tag. Spinner shown.
7.  **Self-Action Prevention:**
    *   **Action:** Find your *own* admin account in "Manage Members".
    *   **Expected:** "(Your Account)" label shown. "Demote" button is disabled/absent.
8.  **Access Closed Forum:**
    *   **Action:** Navigate to `/forum/closed`.
    *   **Expected:** Page loads successfully.

### Flow 3: Create New Threads

1.  **Open Forum (As Admin/Approved Member):**
    *   **Action:** Log in (Admin or Approved Member). Go to `/forum/open`. Click "Create New Thread".
    *   **Expected:** Dialog appears.
    *   **Action:** Fill Title ("Test Open Thread") and Content (min 10 chars). Click "Create Thread".
    *   **Expected:** Success toast. Dialog closes. Redirected to the new thread page (`/forum/thread/newThreadId`).
    *   **Action:** Go back to `/forum/open`.
    *   **Expected:** "Test Open Thread" appears in the list.
2.  **Closed Forum (As Admin):**
    *   **Action:** Log in as Admin. Go to `/forum/closed`. Click "Create New Admin Thread".
    *   **Expected:** Dialog appears.
    *   **Action:** Fill Title ("Test Closed Thread") and Content. Click "Create Admin Thread".
    *   **Expected:** Success toast. Dialog closes. Redirected to the new thread page.
    *   **Action:** Go back to `/forum/closed`.
    *   **Expected:** "Test Closed Thread" appears in the list.
3.  **Closed Forum (As Non-Admin - Access Denied):**
    *   **Action:** Log in as Approved Member. Try accessing `/forum/closed`.
    *   **Expected:** Redirected away or shown unauthorized message.

### Flow 4: Approved Member - Forum Interaction & Profile

1.  **Login (Member):**
    *   **Action:** Log in as the regular Approved Member.
    *   **Expected:** Successful login to `/dashboard`. No Admin links in header.
2.  **View Open Forum & Thread:**
    *   **Action:** Go to `/forum/open`. Click on "Test Open Thread".
    *   **Expected:** Navigate to thread view. See initial message. Reply form visible.
3.  **Post Reply:**
    *   **Action:** In thread view, type a reply and submit.
    *   **Expected:** Success toast. New reply appears in message list.
4.  **View Own Profile:**
    *   **Action:** Go to your profile (`/profile/yourUserId`).
    *   **Expected:** See user info. Messages list includes the initial thread message and the reply. "Delete" button visible next to both.
5.  **View Other Profile:**
    *   **Action:** Go to Admin's profile (`/profile/adminUserId`).
    *   **Expected:** See Admin info/messages. *No* "Delete" button next to their messages.
6.  **Delete Own Message:**
    *   **Action:** Go to your profile. Click "Delete" next to the *reply*.
    *   **Expected:** Success toast. Reply disappears.
    *   **Action:** Click "Delete" next to the *initial message* of the thread you created.
    *   **Expected:** Success toast. Initial message disappears.

### Flow 5: Search Functionality

1.  **Access Search Page:**
    *   **Action:** Log in (any approved user). Go to `/search`.
    *   **Expected:** Search page loads. Initial message shown.
2.  **Search by Keyword:**
    *   **Action:** Enter a keyword from a test message (e.g., "Test") in "Keywords". Click "Search".
    *   **Expected:** Loading spinner. Results shown with "Test" highlighted (<mark>). Search description includes keyword.
3.  **Search by Date Range:**
    *   **Action:** Clear form. Select a `startDate` and `endDate` including test messages. Click "Search".
    *   **Expected:** Loading spinner. Results shown within date range. Description includes dates.
4.  **Search (Combined):**
    *   **Action:** Enter keyword *and* select date range. Click "Search".
    *   **Expected:** Loading spinner. Results shown matching *both* criteria. Description includes both.
5.  **Search (No Results):**
    *   **Action:** Enter non-existent keyword (e.g., "xyzzy"). Click "Search".
    *   **Expected:** Loading spinner. Info toast "No messages found...". Results area shows "No messages found..."
6.  **Search by Author (Limitation Check):**
    *   **Action:** Enter a known username in "Author Username". Click "Search".
    *   **Expected:** Loading spinner. Results *not* filtered by author (backend limitation). Description *does* mention the author filter attempted.

### Flow 6: Logout

1.  **Logout:**
    *   **Action:** While logged in, click Logout button.
    *   **Expected:** Redirected to `/login`. Access to protected routes blocked.

---

*Remember to check the browser's developer console for any errors during testing.* 