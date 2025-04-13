# MID-PROJECT DOCUMENT

**Authors:** Salim BOUHORMA MOUFFAK | Alexander DIMANACHKI | Anthony PORISSE

## Specifications

Our site, **Organiz'asso**, allows members of an association to exchange messages through forums.
The association is managed by a board of directors, made up of elected members called administrators. The platform offers two forums:

* The open forum, which every registered member can view and where they can post messages.
* The closed forum, reserved for members of the board of directors.

When not logged in, a user can only create an account. Their registration must then be approved by an administrator to be granted member status.
When a member logs in, they gain access to the main page, which includes the open forum.

**User Roles & Actions:**

* **A visitor arriving on the site can:**
    * Create an account and request member status
    * Log in

* **Once logged in, and after their registration has been approved by an administrator, a member can:**
    * Create messages:
        * In reply to an existing message
        * Or to start a new discussion
    * View their own profile, which contains at least the list of messages they’ve posted. From their profile, they can delete their own messages.
    * View the profiles of other members
    * Search for messages by specifying keywords, a time range of publication, or the author.

* **Administrators are users with additional privileges. An administrator can:**
    * Access the closed forum
    * Grant or revoke administrator status to another user (but not to themselves)
    * Review account registration requests and approve or reject member status for a user.

* **At the end of their session, a user has the option to log out.**

---

**Technology Stack Overview:**
* **Frontend:** React
* **Backend:** Node.js (implied)
* **Database & Authentication:** MongoDB

*(Revision Note: This version aligns the component structure with the provided dependency graph image (`image_e23876.jpg`), reinstating `LoginForm` and `RegisterForm` as separate components. It retains other previous updates like the technology stack, exclusion of Redux/Mongoose, and inclusion of the `Footer` component based on text feedback.)*

## 1. Functionalities *(Derived from Specifications)*

* **Users**
    * **Registration:** Users can create an account to become members (requires admin approval).
    * **Login:** Members can log in to access site features.
    * **Message Creation:** Members can create messages, either replying to existing threads or starting new ones (in Open Forum).
    * **Message Deletion:** Members can delete their own messages (likely via profile).
    * **Search:** Members can search for messages by keywords, publication date, or author.
    * **Profile Management:** Members can view their own profiles and those of other users.
    * **Logout:** Ability to log out from the site.
* **Administrators**
    * **Open Forum Access:** (Implied, as they are members)
    * **Closed Forum Access:** Reserved for board members (administrators).
    * **User Management:** Administrators can grant or revoke administrator status and approve/reject new registrations.
    * **Message Creation/Viewing:** (Implied, in both forums)

## 2. Information Circulating in the Application

* **User Information**
    * List of account creation requests (pending approval).
    * List of members (approved users).
    * List of administrators (users with admin privileges).
    * User profiles (username, messages, etc.).
* **Forum Information**
    * List of forums (Open, Closed).
    * Threads within each forum.
* **Message Information**
    * Messages within threads.
    * Message content, author, publication date.

## 3. List of React Components (Reflecting Dependency Graph Image)

### `App` (Main Component)
* **Function:** Main component managing routing and displaying pages based on the user's authentication status and the current route. Uses React Router (or similar) for navigation.
* **Props:** None
* **State (Potentially managed via Context):**
    * `isLoggedIn`: boolean
    * `currentUser`: object (details of the logged-in user, including approval status and admin role)
    * `isAdmin`: boolean
* **Contains:** `LoginPage`, `RegisterPage`, `DashBoard` (conditionally rendered based on route and `isLoggedIn` state, likely via React Router).

### `LoginPage`
* **Function:** Authentication page container. Renders the login form.
* **Props:**
    * `onLoginSuccess`: function (callback executed on successful login, likely updates global Auth state/context)
* **State:**
    * `error`: string (to display login errors passed potentially from `LoginForm` submission)
* **Contains:** `LoginForm`, links to `RegisterPage`.

### `LoginForm`
* **Function:** Form allowing users to enter login credentials.
* **Props:**
    * `onSubmit`: function (handles form submission logic, likely calls authService and triggers `onLoginSuccess` or sets error state in `LoginPage`)
* **State:**
    * `username`: string
    * `password`: string
* **Contains:** Input fields (username, password), submit button.

### `RegisterPage`
* **Function:** Page container for user registration. Renders the registration form.
* **Props:**
    * `onRegisterSuccess`: function (callback executed on successful registration request submission)
* **State:**
    * `error`: string (to display registration errors passed potentially from `RegisterForm` submission)
    * `successMessage`: string (e.g., "Registration successful, awaiting admin approval.")
* **Contains:** `RegisterForm`, links to `LoginPage`.

### `RegisterForm`
* **Function:** Form allowing users to enter information for account creation.
* **Props:**
    * `onSubmit`: function (handles form submission logic, likely calls userService/authService and triggers `onRegisterSuccess` or sets error state in `RegisterPage`)
* **State:**
    * `username`: string
    * `email`: string
    * `password`: string
    * `confirmPassword`: string
* **Contains:** Input fields (username, email, passwords), submit button.

### `DashBoard`
* **Function:** Main interface after login **for approved members**. Provides access to site features. Renders different sections based on user role and navigation (nested routes likely).
* **Props:**
    * `user`: object (user details, possibly from context)
    * `isAdmin`: boolean (possibly from context)
    * `onLogout`: function (passed down to `Header`/`Logout` button, likely triggers context update)
* **State:** (Minimal state, mostly relies on nested routes for content display)
* **Contains:** `Header`, `Footer`. Renders `OpenForum`, `ClosedForum` (conditionally), `ProfilePage`, `SearchPage`, `AdminPanel` (conditionally) via nested routing.

### `Header`
* **Function:** Main navigation bar showing the site name, user info, and links to primary sections accessible to the logged-in user type.
* **Props:**
    * `user`: object (user details, possibly from context)
    * `isAdmin`: boolean (possibly from context)
    * `onLogout`: function
* **State:** None
* **Contains:** Navigation Links (e.g., Open Forum, Closed Forum [if admin], Profile), `AdminPanel` link (conditional), `Logout` button, `SearchPage` link/access.

### `Footer`
* **Function:** Displays footer information like copyright, contact links, etc. *(Note: Not explicitly shown in the provided dependency graph image)*.
* **Props:** None
* **State:** None
* **Contains:** Text, Links.

### `OpenForum`
* **Function:** Displays the open forum accessible to all approved members, listing discussion threads. Fetches data from the backend API.
* **Props:**
    * `userId`: string (ID of the logged-in user, possibly from context)
* **State:**
    * `threads`: array (list of discussion threads)
    * `isLoading`: boolean
    * `error`: string
* **Contains:** `ThreadList`, button to create a new thread, potentially link/render `ThreadView`.

### `ClosedForum`
* **Function:** Displays the admin-only forum, listing confidential threads. Fetches data from the backend API. Access restricted to administrators.
* **Props:**
    * `userId`: string (ID of the logged-in user, possibly from context)
    * `isAdmin`: boolean (for access control, likely checked via context)
* **State:**
    * `threads`: array (list of admin discussion threads)
    * `isLoading`: boolean
    * `error`: string
* **Contains:** `ThreadList`, button to create a new admin thread, potentially link/render `ThreadView`.

### `ThreadList`
* **Function:** Displays a list of discussion threads for a specific forum (Open or Closed).
* **Props:**
    * `threads`: array (list of threads)
    * `onThreadSelect`: function (handles selecting a thread to view, likely navigates)
    * `forumType`: string ("open" or "closed")
* **State:** None
* **Contains:** Multiple `ThreadItem` components.

### `ThreadItem`
* **Function:** Represents a single discussion thread in the list (e.g., shows title, author, last post time).
* **Props:**
    * `thread`: object (thread data)
    * `onClick`: function (triggered when item is clicked for navigation)
* **State:** None
* **Contains:** Display elements for thread information.

### `ThreadView`
* **Function:** Displays the full content of a selected discussion thread, including all its messages. Fetches data from the backend API.
* **Props:**
    * `threadId`: string (likely from route params)
    * `userId`: string (ID of the logged-in user, from context)
    * `isAdmin`: boolean (from context, potentially relevant for moderation if added later)
    * `forumType`: string ("open" or "closed", needed to post reply to correct forum type)
* **State:**
    * `thread`: object (thread details)
    * `messages`: array (messages in the thread)
    * `isLoading`: boolean
    * `error`: string
* **Contains:** `MessageList`, `ReplyForm`.

### `ReplyForm`
* **Function:** Form for replying to a thread or creating a new message within it.
* **Props:**
    * `threadId`: string
    * `userId`: string (from context)
    * `onReplySubmit`: function (handles submitting the new message to the backend)
* **State:**
    * `content`: string (message content being typed)
    * `isSubmitting`: boolean
* **Contains:** Text area, submit button.

### `MessageList`
* **Function:** Displays the list of messages within a thread, usually chronologically.
* **Props:**
    * `messages`: array (list of messages)
    * `userId`: string (ID of logged-in user, from context)
    * `onDeleteRequest`: function (passed down to MessageItem, likely only enabled for user's own messages)
* **State:** None
* **Contains:** Multiple `MessageItem` components.

### `MessageItem`
* **Function:** Displays an individual message with its content, author info, and timestamp.
* **Props:**
    * `message`: object (message data)
    * `isOwnMessage`: boolean (derived by comparing `message.authorId` with `userId` from context)
    * `onDelete`: function (handles delete action for this specific message, only shown if `isOwnMessage` is true)
* **State:** None
* **Contains:** Message content display, delete button (conditional).

### `Logout` Component/Functionality
* **Function:** Handles the user logout process (e.g., clearing auth state in Context, redirecting). Often integrated into `Header`.
* **Props:**
    * `onLogout`: function (updates global Auth state/context)
* **State:** None

### `AdminPanel`
* **Function:** Administration interface, accessible only to administrators. Used for managing user registration requests and potentially admin statuses. Fetches data from the backend API.
* **Props:**
    * `userId`: string (ID of the admin, from context)
* **State:**
    * `pendingRegistrations`: array (users awaiting approval)
    * `members`: array (list of members for managing admin status)
    * `activeTab`: string ("pending", "manageAdmins")
    * `isLoading`: boolean
    * `error`: string
* **Contains:** Tabs/sections for Pending Requests, Manage Admins; each containing a `UsernameList`.

### `UsernameList`
* **Function:** Displays a list of users with actions appropriate to the list type (pending approval, existing members for admin management).
* **Props:**
    * `users`: array (list of users)
    * `type`: string ("pending", "manageAdmins")
    * `onUserAction`: function (handles various actions like approve, reject, promote, demote by calling API services)
* **State:**
    * `filter`: string (for optional client-side filtering/search)
* **Contains:** Multiple `Username` components, search/filter input.

### `Username` (List Item)
* **Function:** Represents a single user within an admin list, displaying info and action buttons (Approve/Reject for pending, Promote/Demote for members).
* **Props:**
    * `user`: object (user data)
    * `type`: string (list type, determines available actions)
    * `onAction`: function (callback for actions like approve, reject, promote, demote)
* **State:** None
* **Contains:** User details display, action buttons (conditional based on `type`).

### `ProfilePage`
* **Function:** Displays the profile of a user (either self or another member). Fetches data from the backend API.
* **Props:**
    * `profileUserId`: string (ID of the user whose profile is being viewed, from route param)
    * `currentUserId`: string (ID of logged-in user from context, for comparison/permissions)
* **State:**
    * `userInfo`: object
    * `userMessages`: array
    * `isLoading`: boolean
    * `error`: string
    * `isOwnProfile`: boolean (derived from comparing `profileUserId` and `currentUserId`)
* **Contains:** `UserInfo`, `UserMessages`.

### `OtherProfilePage`
* **Function:** *(Consider removing/merging)* This component seems redundant if `ProfilePage` handles both own and other profiles via props/route params. The graph shows it separate, but functionality likely overlaps entirely with `ProfilePage` when viewing someone else.
* **Props:** (Same as `ProfilePage` essentially)
* **State:** (Same as `ProfilePage`)
* **Contains:** `UserInfo`, `UserMessages`.

### `UserInfo`
* **Function:** Displays personal information for a user profile.
* **Props:**
    * `user`: object (user data)
    * `isCurrentUserProfile`: boolean (indicates if this is the logged-in user's own profile being viewed)
* **State:** None
* **Contains:** Display elements for user details (username, join date, etc.).

### `UserMessages`
* **Function:** Displays a list of messages published by the user whose profile is being viewed. Allows deletion if it's the user's own profile.
* **Props:**
    * `messages`: array (user's messages)
    * `isOwnProfile`: boolean (determines if delete option is shown)
    * `onDelete`: function (passed to MessageItem, handles message deletion via profile)
* **State:** (Potentially state for sorting/filtering messages)
* **Contains:** List/table of `MessageItem` components, sorting/filtering controls.

### `SearchPage`
* **Function:** Interface for searching messages based on criteria.
* **Props:**
    * `userId`: string (ID of the logged-in user, from context)
* **State:**
    * `results`: array (search results)
    * `isSearching`: boolean
    * `error`: string
    * `searchParams`: object (holding current search criteria used for the API call)
* **Contains:** `SearchForm`, `SearchResults`.

### `SearchForm`
* **Function:** Form for defining message search criteria (keywords, author, date range).
* **Props:**
    * `onSearch`: function (callback to initiate search in `SearchPage`, passing the criteria)
* **State:**
    * `keywords`: string
    * `author`: string
    * `startDate`: date
    * `endDate`: date
* **Contains:** Input fields (text, date pickers), submit button.

### `SearchResults`
* **Function:** Displays the messages found by the search.
* **Props:**
    * `results`: array (search results)
    * `userId`: string (ID of logged-in user, from context)
* **State:** (Potentially state for sorting results)
* **Contains:** List/table of messages matching search criteria, likely rendering `MessageItem` or similar.

## 4. Dependency Graph

Visually represented in the provided dependency graph image (`image_e23876.jpg`). This graph shows the component hierarchy and primary dependencies, indicating which components contain or link to others.

---

## Proposed Frontend Folder Structure & File Descriptions (Updated)

This structure organizes the React application by feature/type for better maintainability, reflecting the reinstated `LoginForm` and `RegisterForm`.



├── public/             # Static assets served directly (index.html, favicon.ico)
│   └── index.html      # Main HTML file where React app mounts
├── src/                # Main source code directory
│   ├── assets/         # Static assets used within the app (images, fonts, svgs)
│   ├── components/     # Reusable UI components shared across pages/features
│   │   ├── Auth/       # Components specific to Authentication (LoginForm.js, RegisterForm.js)
│   │   ├── Common/     # Highly reusable basic components (Button, Input, Modal, Spinner)
│   │   ├── Forum/      # Components related to forums/threads (ThreadList, ThreadItem, MessageList, MessageItem, ReplyForm)
│   │   ├── Layout/     # Layout components (Header, Footer, PageWrapper)
│   │   ├── Profile/    # Components related to user profiles (UserInfo, UserMessages)
│   │   ├── Admin/      # Components specific to the Admin Panel (UsernameList, Username)
│   │   └── Search/     # Components related to search (SearchForm, SearchResults)
│   ├── contexts/       # React Context API providers and consumers
│   │   └── AuthContext.js # Manages global authentication state (isLoggedIn, currentUser [incl. roles/status], isAdmin, login/logout functions)
│   ├── hooks/          # Custom React hooks
│   │   └── useAuth.js  # Hook to easily access AuthContext
│   │   └── useApi.js   # Optional: Custom hook for handling API calls (loading, error states)
│   ├── pages/          # Top-level components representing application pages/routes
│   │   ├── AdminPanelPage.js
│   │   ├── ClosedForumPage.js
│   │   ├── DashBoardPage.js  # Might contain nested routing setup
│   │   ├── LoginPage.js      # Imports and renders components/Auth/LoginForm.js
│   │   ├── OpenForumPage.js
│   │   ├── OtherProfilePage.js # Consider removing/merging logic into ProfilePage.js
│   │   ├── ProfilePage.js      # Handles viewing own or others' profiles based on route param
│   │   ├── RegisterPage.js   # Imports and renders components/Auth/RegisterForm.js
│   │   ├── SearchPage.js
│   │   └── ThreadViewPage.js
│   ├── services/       # Functions for interacting with the backend API (using MongoDB)
│   │   ├── authService.js # Functions for login, register, logout API calls
│   │   ├── forumService.js # Functions for fetching threads, messages, posting replies API calls
│   │   ├── userService.js # Functions for fetching user profiles API calls
│   │   ├── adminService.js # Functions for managing users (approval, roles) API calls
│   │   └── apiClient.js  # Optional: Axios instance or fetch wrapper for base URL, headers etc.
│   ├── utils/          # Utility functions (date formatting, validation, constants)
│   ├── App.js          # Main application component: Sets up Router, Context Providers, renders base layout/pages
│   ├── index.js        # Application entry point: Renders App component into the DOM
│   └── index.css       # Global CSS styles or entry point for CSS framework/modules
├── .env                # Environment variables (e.g., REACT_APP_API_BASE_URL)
├── .gitignore          # Specifies intentionally untracked files that Git should ignore
├── package.json        # Project metadata, dependencies, scripts
└── README.md           # This file (or a more detailed project overview)



**File/Folder Descriptions (Updated):**

* **`public/`**: Contains the base HTML file and other static assets that don't go through the build process.
* **`src/`**: All the application's source code lives here.
* **`src/assets/`**: Store images, fonts, icons, etc., imported into components.
* **`src/components/`**: Contains reusable UI pieces.
    * **`Auth/`**: Contains `LoginForm.js` and `RegisterForm.js`.
    * **Other subfolders**: Group components by feature or type.
* **`src/contexts/`**: Holds React Context files. `AuthContext.js` is crucial for managing user login state, user details (including roles/approval status), and providing auth functions.
* **`src/hooks/`**: Place for custom React Hooks.
* **`src/pages/`**: Contains components that correspond to application routes.
    * **`LoginPage.js` / `RegisterPage.js`**: Container pages importing forms from `src/components/Auth/`.
    * **`ProfilePage.js`**: Designed to handle displaying both the logged-in user's profile and other users' profiles based on route parameters (`/profile/:userId`).
    * **`OtherProfilePage.js`**: Likely redundant, consider removing.
* **`src/services/`**: Modules for API calls. Added `adminService.js` for admin-specific actions.
* **`src/utils/`**: Small, pure functions for common tasks.
* **`src/App.js`**: The root component. Sets up the main router, Context Providers, and top-level routes, potentially including protected routes based on login status and admin role.
* **`src/index.js`**: The entry point that renders the `App` component.
* **`src/index.css`**: Global styles.
* **`.env`**: Stores environment-specific variables.
* **`.gitignore`**: Lists files/folders ignored by Git.
* **`package.json`**: Defines project dependencies and scripts.
* **`README.md`**: This document.