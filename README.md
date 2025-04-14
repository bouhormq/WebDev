# MID-PROJECT DOCUMENT

**Authors:** Salim BOUHORMA MOUFFAK | Alexander DIMANACHKI | Anthony PORISSE

## Getting Started

Follow these instructions to set up and run the Organiz'asso application locally for development and testing.

### Prerequisites

*   **Node.js:** Version 18.x or later recommended (check with `node -v`).
*   **npm** or **yarn:** Package manager (usually comes with Node.js).
*   **MongoDB:** A running local MongoDB instance or access to a MongoDB Atlas cluster.
    *   Default local connection URI expected: `mongodb://localhost:27017/organizasso`

### Installation & Setup

1.  **Clone the Repository:**
    ```bash
    git clone <your-repository-url>
    cd <repository-folder>
    ```

2.  **Setup Backend (`organizasso-backend`):
    ```bash
    cd organizasso-backend

    # Install dependencies
    npm install 
    # or: yarn install

    # Create .env file
    # Copy .env.example to .env (if example exists) or create manually
    # Edit .env and add the following:
    MONGODB_URI=mongodb://localhost:27017/organizasso # Or your Atlas URI
    JWT_SECRET=your_strong_jwt_secret_key # Choose a secure secret
    PORT=3001 # Or another port if 3001 is taken
    # Optional: Define initial admin credentials (used by seeding script if available)
    # ADMIN_USERNAME=admin
    # ADMIN_EMAIL=admin@example.com
    # ADMIN_PASSWORD=changeme123 

    # Optional: Seed initial data (like the first admin user)
    # Check backend package.json for a seed script, e.g.:
    # npm run seed 
    # If no seed script, you may need to register the first user and manually
    # set isApproved=true and isAdmin=true in the database.

    cd .. 
    ```

3.  **Setup Frontend (`organizasso-frontend`):
    ```bash
    cd organizasso-frontend

    # Install dependencies
    npm install
    # or: yarn install

    # Frontend uses Vite environment variables.
    # It defaults to connecting to backend at http://localhost:3001/api in development.
    # For production builds, create a .env.production file:
    # echo "VITE_API_BASE_URL=https://your-deployed-backend.com/api" > .env.production

    cd ..
    ```

### Running the Application

1.  **Start the Backend Server:**
    ```bash
    cd organizasso-backend
    npm run dev 
    # Or: npm start (if using a different start script for development)
    ```
    *The backend should now be running, typically on `http://localhost:3001`.* 

2.  **Start the Frontend Development Server:**
    *Open a **new** terminal window/tab.*
    ```bash
    cd organizasso-frontend
    npm run dev
    ```
    *The frontend should now be running, typically on `http://localhost:5173`.* 

3.  **Access the App:** Open your web browser and navigate to `http://localhost:5173`.

---

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
    * View their own profile, which contains at least the list of messages they've posted. From their profile, they can delete their own messages.
    * View the profiles of other members
    * Search for messages by specifying keywords, a time range of publication, or the author.

* **Administrators are users with additional privileges. An administrator can:**
    * Access the closed forum
    * Grant or revoke administrator status to another user (but not to themselves)
    * Review account registration requests and approve or reject member status for a user.

* **At the end of their session, a user has the option to log out.**

---

## Project Status (April 2025)

All core functionalities outlined in the specifications have been implemented. 

**Known Limitations/TODOs:**
*   **Search by Author:** The backend currently does not support filtering search results by author username. Searching by keyword and date range is functional.
*   **Author Name in Search Results:** Search results currently do not include the author's username (only their ID).

---

**Technology Stack Overview:**
* **Frontend:** React (Vite), Tailwind CSS, shadcn/ui, react-hook-form, zod, date-fns
* **Backend:** Node.js, Express.js
* **Database & Authentication:** MongoDB (Mongoose not used), JWT, bcrypt

*(Revision Note: This version reflects the current tech stack and implementation status.)*

## 1. Functionalities *(Derived from Specifications)*

* **Users**
    * ✅ **Registration:** Users can create an account (requires admin approval).
    * ✅ **Login:** Members can log in (pending users receive an error).
    * ✅ **Message Creation:**
        * ✅ Reply to existing threads (Open & Closed Forums).
        * ✅ Start new discussion threads (Open & Closed Forums).
    * ✅ **Message Deletion:** Members can delete their own messages via their profile.
    * ☑️ **Search:** Members can search messages by keywords and publication date range. *(Author search backend pending)*.
    * ✅ **Profile Management:** Members can view their own profiles and those of other users.
    * ✅ **Logout:** Ability to log out.
* **Administrators**
    * ✅ **Open Forum Access:** 
    * ✅ **Closed Forum Access:**
    * ✅ **User Management:** Approve/reject registrations, grant/revoke admin status (with confirmation, prevents self-action).
    * ✅ **Message Creation/Viewing:** (Implied, in both forums)

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

## 3. List of React Components

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

## Project Structure

```
.
├── organizasso-backend/
│   ├── config/         # Database connection (db.js)
│   ├── controllers/    # Request handling logic for each route type
│   ├── middleware/     # Custom middleware (authMiddleware.js)
│   ├── node_modules/   # Backend dependencies (usually gitignored)
│   ├── routes/         # API route definitions
│   ├── .env            # Environment variables (DB URI, JWT secret, etc.)
│   ├── .gitignore      # Files ignored by Git for backend
│   ├── package.json    # Backend dependencies and scripts
│   ├── package-lock.json
│   └── server.js       # Main Express server setup
│
├── organizasso-frontend/
│   ├── public/         # Static assets (index.html, icons)
│   ├── src/
│   │   ├── assets/     # Static assets used in components (images, svgs)
│   │   ├── components/ # Reusable UI components
│   │   │   ├── Admin/
│   │   │   ├── Auth/       # (Currently empty or misc auth components)
│   │   │   ├── Common/
│   │   │   ├── Forum/
│   │   │   ├── Layout/
│   │   │   ├── Profile/
│   │   │   ├── Search/
│   │   │   └── ui/       # Shadcn/ui components (generated)
│   │   ├── contexts/   # React Context (AuthContext.jsx)
│   │   ├── hooks/      # Custom React hooks (useAuth.js, useApi.js [placeholder])
│   │   ├── lib/        # Utility libraries (e.g., Shadcn utils.js)
│   │   ├── pages/      # Top-level page components corresponding to routes
│   │   ├── services/   # API call functions (apiClient.js, etc.)
│   │   ├── styles/     # Additional global or scoped styles
│   │   ├── utils/      # General utility functions (helpers.js [placeholder])
│   │   ├── App.jsx       # Main application component (routing, context)
│   │   ├── App.css       # Component-specific styles for App.jsx
│   │   └── main.jsx      # Application entry point (renders App)
│   ├── .env            # Frontend environment variables
│   ├── .gitignore      # Files ignored by Git for frontend
│   ├── components.json # Shadcn/ui configuration
│   ├── eslint.config.js # ESLint configuration
│   ├── index.html      # Root HTML file (entry)
│   ├── jsconfig.json   # JS configuration (paths)
│   ├── package.json    # Frontend dependencies and scripts
│   ├── package-lock.json
│   ├── postcss.config.js # PostCSS configuration (for Tailwind)
│   ├── tailwind.config.js # Tailwind CSS configuration
│   └── vite.config.js  # Vite build configuration
│
├── .git/             # Git repository data
├── .gitignore        # Root gitignore (optional, can rely on specific ones)
├── package.json      # Root package.json (if managing both with Lerna/Nx, otherwise might not exist)
├── README.md         # This file
└── TESTING_GUIDE.md  # Manual testing steps
```

**File/Folder Descriptions:**

*   **`organizasso-backend/`**: Contains all backend code (Node.js/Express).
    *   `config/`: Database connection setup.
    *   `controllers/`: Functions that handle incoming requests and interact with models/database.
    *   `middleware/`: Functions that run before controllers (e.g., authentication checks).
    *   `routes/`: Defines API endpoints and links them to controllers/middleware.
    *   `server.js`: Initializes the Express app, connects DB, mounts middleware and routes.
    *   `.env`: **Crucial** file for storing secrets (DB connection string, JWT secret) and configuration. **Do not commit to Git.**
*   **`organizasso-frontend/`**: Contains all frontend code (React/Vite).
    *   `public/`: Static files served directly.
    *   `src/`: Main source code.
        *   `assets/`: Images, SVGs etc. used by components.
        *   `components/`: Reusable UI parts. Specific components like `login-form.jsx` and `register-form.jsx` are currently here, not in `Auth/`. `ui/` holds `shadcn/ui` components.
        *   `contexts/`: React Context for global state (e.g., `AuthContext.jsx`).
        *   `hooks/`: Custom hooks (e.g., `useAuth.js`).
        *   `lib/`: Utility functions, often includes `utils.js` from `shadcn/ui`.
        *   `pages/`: Components representing distinct application pages/views.
        *   `services/`: Functions dedicated to making API calls to the backend.
        *   `styles/`: Additional CSS files.
        *   `utils/`: General helper functions.
        *   `App.jsx`: Root React component, sets up routing and context providers.
        *   `main.jsx`: Application entry point, renders `<App />` into the DOM.
*   **`.gitignore`**: Files specified here will be ignored by Git (e.g., `node_modules`, `.env`). Ensure both backend and frontend have appropriate `.gitignore` files.
*   **`package.json`**: Lists dependencies and scripts for backend/frontend respectively.
*   **`README.md`**: This file - project overview.
*   **`TESTING_GUIDE.md`**: Manual testing procedures.

*(Note: Specific file names use `.jsx` for React components)*