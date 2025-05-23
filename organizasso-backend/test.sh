#!/bin/bash

# =============================================================================
# Organiz'asso Backend API Test Script
# =============================================================================
# Prerequisites:
# 1. Backend server running (default: http://localhost:3001)
# 2. jq installed (brew install jq)
# 3. An existing admin user in the database (update ADMIN_USERNAME and ADMIN_PASSWORD below)
# =============================================================================

# --- Configuration ---
BASE_URL="http://localhost:5001/api"
ADMIN_USERNAME="admin" 
ADMIN_PASSWORD="changeme123" 

# --- Helper Functions ---
log_step() {
  echo ""
  echo "📋 STEP $1: $2"
  echo "======================================================================"
}

log_action() {
  echo "  -> $1..."
}

log_response() {
  echo "  Response:"
  echo "$1" | jq '.'
  echo ""
}

# --- Global Variables ---
ADMIN_TOKEN=""
REGULAR_USER_TOKEN=""
REGULAR_USER_ID=""
REGULAR_USER_USERNAME=""
REGULAR_USER_EMAIL=""
THREAD_ID=""
INITIAL_MESSAGE_ID="" # Message created with the thread
REPLY_MESSAGE_ID=""

# --- Script Start ---
echo "🚀 Organiz'asso Backend API Test Suite"
echo "Base URL: $BASE_URL"
echo "Admin for approval: $ADMIN_USERNAME"
if [ "$ADMIN_USERNAME" == "your_admin_username" ]; then
  echo "🛑 CRITICAL: Please update ADMIN_USERNAME and ADMIN_PASSWORD in the script."
  exit 1
fi
echo ""

# =============================================================================
# PHASE 1: USER REGISTRATION, ADMIN APPROVAL, AND LOGIN
# =============================================================================
log_step "1" "USER REGISTRATION, ADMIN APPROVAL, AND LOGIN"

# 1.1 Register a new dynamic user
log_action "1.1 Registering a new dynamic user"
TIMESTAMP=$(date +%s)
REGULAR_USER_USERNAME="testuser_${TIMESTAMP}"
REGULAR_USER_EMAIL="test_${TIMESTAMP}@example.com"
REGISTER_PAYLOAD=$(cat <<EOF
{
  "username": "$REGULAR_USER_USERNAME",
  "email": "$REGULAR_USER_EMAIL",
  "password": "password123"
}
EOF
)
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "$REGISTER_PAYLOAD")
log_response "$REGISTER_RESPONSE"
# Basic check
if ! echo "$REGISTER_RESPONSE" | jq -e '.message | test("submitted")' > /dev/null; then
  echo "  ❌ ERROR: Registration failed or response format unexpected."
  # exit 1 # Comment out if you want to proceed with admin login anyway
fi

# 1.2 Admin login
log_action "1.2 Admin login to approve the new user"
ADMIN_LOGIN_PAYLOAD=$(cat <<EOF
{
  "username": "$ADMIN_USERNAME",
  "password": "$ADMIN_PASSWORD"
}
EOF
)
ADMIN_LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "$ADMIN_LOGIN_PAYLOAD")
log_response "$ADMIN_LOGIN_RESPONSE"
ADMIN_TOKEN=$(echo "$ADMIN_LOGIN_RESPONSE" | jq -r '.token // empty')
if [ -z "$ADMIN_TOKEN" ]; then
  echo "  ❌ ERROR: Admin login failed. Check credentials or backend."
  exit 1
fi
echo "  Admin Token extracted."

# 1.3 Admin: Get pending users and find the new user's ID
log_action "1.3 Admin: Fetching pending users to find '$REGULAR_USER_USERNAME'"
PENDING_USERS_RESPONSE_RAW=$(curl -s -X GET "$BASE_URL/admin/pending" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
echo "  Raw Pending Users Response: $PENDING_USERS_RESPONSE_RAW" # ADD THIS LINE
PENDING_USERS_RESPONSE="$PENDING_USERS_RESPONSE_RAW" # Keep your original variable
# log_response "$PENDING_USERS_RESPONSE" # Can be verbose
USER_TO_APPROVE_ID=$(echo "$PENDING_USERS_RESPONSE" | jq -r --arg username "$REGULAR_USER_USERNAME" '.[] | select(.username == $username) | ._id // empty')

if [ -z "$USER_TO_APPROVE_ID" ]; then
  echo "  ❌ ERROR: Could not find pending user '$REGULAR_USER_USERNAME' or extract ID."
  echo "  Pending users response:"
  log_response "$PENDING_USERS_RESPONSE"
  # exit 1 # Allow script to continue for other tests if admin part fails
else
  echo "  User ID to approve: $USER_TO_APPROVE_ID"

  # 1.4 Admin: Approve the new user
  log_action "1.4 Admin: Approving user ID '$USER_TO_APPROVE_ID'"
  APPROVE_RESPONSE=$(curl -s -X PUT "$BASE_URL/admin/users/$USER_TO_APPROVE_ID/approve" \
    -H "Authorization: Bearer $ADMIN_TOKEN")
  log_response "$APPROVE_RESPONSE"
  if ! echo "$APPROVE_RESPONSE" | jq -e '.message | test("approved")' > /dev/null; then
    echo "  ⚠️ WARNING: User approval might have failed or response format unexpected."
  fi
fi

# 1.5 Admin logout (optional, good practice)
log_action "1.5 Admin logout"
curl -s -X POST "$BASE_URL/auth/logout" -H "Authorization: Bearer $ADMIN_TOKEN" > /dev/null
echo "  Admin logged out."
ADMIN_TOKEN="" # Clear admin token

# 1.6 Login as the newly approved regular user
log_action "1.6 Logging in as the newly approved user '$REGULAR_USER_USERNAME'"
REGULAR_USER_LOGIN_PAYLOAD=$(cat <<EOF
{
  "username": "$REGULAR_USER_USERNAME",
  "password": "password123"
}
EOF
)
REGULAR_USER_LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "$REGULAR_USER_LOGIN_PAYLOAD")
log_response "$REGULAR_USER_LOGIN_RESPONSE"

REGULAR_USER_TOKEN=$(echo "$REGULAR_USER_LOGIN_RESPONSE" | jq -r '.token // empty')
REGULAR_USER_ID=$(echo "$REGULAR_USER_LOGIN_RESPONSE" | jq -r '.user.id // empty')

if [ -z "$REGULAR_USER_TOKEN" ] || [ -z "$REGULAR_USER_ID" ]; then
  echo "  ❌ ERROR: Login for '$REGULAR_USER_USERNAME' failed. This user might not have been approved correctly."
  # exit 1 # Allow script to continue if possible
else
  echo "  Regular User Token extracted."
  echo "  Regular User ID: $REGULAR_USER_ID"
fi


# =============================================================================
# PHASE 2: THREAD AND INITIAL MESSAGE CREATION (by Regular User)
# =============================================================================
if [ -n "$REGULAR_USER_TOKEN" ]; then
log_step "2" "THREAD AND INITIAL MESSAGE CREATION (by Regular User)"

log_action "2.1 Creating a new thread in 'open' forum"
CREATE_THREAD_PAYLOAD=$(cat <<EOF
{
  "title": "Test Thread by $REGULAR_USER_USERNAME ($TIMESTAMP)",
  "content": "This is the initial post for a test thread. Let's discuss testing APIs!",
  "forumType": "open"
}
EOF
# "imageUrl": "https://example.com/test-thread.jpg" # Optional
)
CREATE_THREAD_RESPONSE=$(curl -s -X POST "$BASE_URL/threads" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $REGULAR_USER_TOKEN" \
  -d "$CREATE_THREAD_PAYLOAD")
log_response "$CREATE_THREAD_RESPONSE"

THREAD_ID=$(echo "$CREATE_THREAD_RESPONSE" | jq -r '.thread._id // empty')
INITIAL_MESSAGE_ID=$(echo "$CREATE_THREAD_RESPONSE" | jq -r '.thread.initialPost._id // .initialPostId // empty') # Backend might return initialPost._id or initialPostId

if [ -z "$THREAD_ID" ]; then
  echo "  ❌ ERROR: Failed to create thread or extract THREAD_ID."
else
  echo "  Thread ID created: $THREAD_ID"
  echo "  Initial Message ID (from thread creation): $INITIAL_MESSAGE_ID"
fi
else
  echo "  ⚠️ SKIPPING THREAD CREATION: Regular user token not available."
fi

# =============================================================================
# PHASE 3: POSTING REPLIES (by Regular User)
# =============================================================================
if [ -n "$REGULAR_USER_TOKEN" ] && [ -n "$THREAD_ID" ]; then
log_step "3" "POSTING REPLIES (by Regular User)"

log_action "3.1 Posting a reply to thread '$THREAD_ID'"
POST_REPLY_PAYLOAD=$(cat <<EOF
{
  "content": "This is a reply from $REGULAR_USER_USERNAME. API testing is fun!",
  "threadId": "$THREAD_ID"
}
EOF
# "imageUrl": "https://example.com/reply-image.jpg", # Optional
# "parentId": "$INITIAL_MESSAGE_ID" # Optional: if replying to a specific message within the thread
)
POST_REPLY_RESPONSE=$(curl -s -X POST "$BASE_URL/threads/$THREAD_ID/replies" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $REGULAR_USER_TOKEN" \
  -d "$POST_REPLY_PAYLOAD")
log_response "$POST_REPLY_RESPONSE"

REPLY_MESSAGE_ID=$(echo "$POST_REPLY_RESPONSE" | jq -r '.message._id // ._id // empty') # Backend might return message._id or just _id for the new message
if [ -z "$REPLY_MESSAGE_ID" ]; then
  echo "  ❌ ERROR: Failed to post reply or extract REPLY_MESSAGE_ID."
else
  echo "  Reply Message ID created: $REPLY_MESSAGE_ID"
fi
else
  echo "  ⚠️ SKIPPING POSTING REPLIES: Regular user token or Thread ID not available."
fi

# =============================================================================
# PHASE 4: MESSAGE INTERACTIONS (by Regular User)
# =============================================================================
if [ -n "$REGULAR_USER_TOKEN" ] && [ -n "$INITIAL_MESSAGE_ID" ] && [ -n "$REPLY_MESSAGE_ID" ]; then
log_step "4" "MESSAGE INTERACTIONS (by Regular User)"

# 4.1 Like the initial message
log_action "4.1 Liking initial message '$INITIAL_MESSAGE_ID'"
LIKE_PAYLOAD='{ "actionType": "like" }'
LIKE_RESPONSE=$(curl -s -X POST "$BASE_URL/forums/messages/$INITIAL_MESSAGE_ID/reaction" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $REGULAR_USER_TOKEN" \
  -d "$LIKE_PAYLOAD")
log_response "$LIKE_RESPONSE"

# 4.2 Dislike the reply message
log_action "4.2 Disliking reply message '$REPLY_MESSAGE_ID'"
DISLIKE_PAYLOAD='{ "actionType": "dislike" }'
DISLIKE_RESPONSE=$(curl -s -X POST "$BASE_URL/forums/messages/$REPLY_MESSAGE_ID/reaction" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $REGULAR_USER_TOKEN" \
  -d "$DISLIKE_PAYLOAD")
log_response "$DISLIKE_RESPONSE"
else
  echo "  ⚠️ SKIPPING MESSAGE INTERACTIONS: Token or message IDs not available."
fi

# =============================================================================
# PHASE 5: DATA VERIFICATION
# =============================================================================
log_step "5" "DATA VERIFICATION"

# 5.1 Get details of the created thread (includes messages)
if [ -n "$REGULAR_USER_TOKEN" ] && [ -n "$THREAD_ID" ]; then
  log_action "5.1 Fetching details for thread '$THREAD_ID'"
  GET_THREAD_RESPONSE=$(curl -s -X GET "$BASE_URL/threads/$THREAD_ID" \
    -H "Authorization: Bearer $REGULAR_USER_TOKEN")
  log_response "$GET_THREAD_RESPONSE"
  # Add jq checks here for specific fields if needed
else
  echo "  ⚠️ SKIPPING THREAD DETAIL FETCH: Token or Thread ID not available."
fi

# 5.2 Get messages posted by the regular user
if [ -n "$REGULAR_USER_TOKEN" ] && [ -n "$REGULAR_USER_ID" ]; then
  log_action "5.2 Fetching messages for user '$REGULAR_USER_ID' ($REGULAR_USER_USERNAME)"
  GET_USER_MESSAGES_RESPONSE=$(curl -s -X GET "$BASE_URL/users/$REGULAR_USER_ID/messages" \
    -H "Authorization: Bearer $REGULAR_USER_TOKEN")
  log_response "$GET_USER_MESSAGES_RESPONSE"
  # Add jq checks here
else
  echo "  ⚠️ SKIPPING USER MESSAGE FETCH: Token or User ID not available."
fi

# =============================================================================
# PHASE 6: ERROR CASE TESTING (for Replies)
# =============================================================================
if [ -n "$REGULAR_USER_TOKEN" ] && [ -n "$THREAD_ID" ]; then
log_step "6" "ERROR CASE TESTING (for Replies)"

# 6.1 Post reply without authentication token
log_action "6.1 Attempting to post reply without auth (expected 401)"
NO_AUTH_REPLY_RESPONSE=$(curl -s -w " HTTP_STATUS:%{http_code}" -X POST "$BASE_URL/threads/$THREAD_ID/replies" \
  -H "Content-Type: application/json" \
  -d '{ "content": "This reply should fail due to no auth." }')
log_response "$NO_AUTH_REPLY_RESPONSE"

# 6.2 Post reply with missing content field
log_action "6.2 Attempting to post reply with missing content (expected 400)"
MISSING_FIELD_REPLY_PAYLOAD='{ "threadId": "'"$THREAD_ID"'" }' # Missing content
MISSING_FIELD_REPLY_RESPONSE=$(curl -s -w " HTTP_STATUS:%{http_code}" -X POST "$BASE_URL/threads/$THREAD_ID/replies" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $REGULAR_USER_TOKEN" \
  -d "$MISSING_FIELD_REPLY_PAYLOAD")
log_response "$MISSING_FIELD_REPLY_RESPONSE"

# 6.3 Post reply to a non-existent thread
log_action "6.3 Attempting to post reply to non-existent thread (expected 404)"
NON_EXISTENT_THREAD_ID="600000000000000000000000" # Example invalid ObjectId
NON_EXISTENT_THREAD_REPLY_RESPONSE=$(curl -s -w " HTTP_STATUS:%{http_code}" -X POST "$BASE_URL/threads/$NON_EXISTENT_THREAD_ID/replies" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $REGULAR_USER_TOKEN" \
  -d '{ "content": "Replying to a ghost thread." }')
log_response "$NON_EXISTENT_THREAD_REPLY_RESPONSE"
else
  echo "  ⚠️ SKIPPING ERROR CASE TESTING: Token or Thread ID not available."
fi

# =============================================================================
# PHASE 7: SEARCH FUNCTIONALITY
# =============================================================================
if [ -n "$REGULAR_USER_TOKEN" ]; then
log_step "7" "SEARCH FUNCTIONALITY"

log_action "7.1 Searching for messages with keyword 'testing'"
SEARCH_RESPONSE=$(curl -s -G "$BASE_URL/search" \
  -H "Authorization: Bearer $REGULAR_USER_TOKEN" \
  --data-urlencode "query=testing")
log_response "$SEARCH_RESPONSE"

log_action "7.2 Searching for messages with a non-existent keyword 'xyz123zyx'"
SEARCH_NO_RESULTS_RESPONSE=$(curl -s -G "$BASE_URL/search" \
  -H "Authorization: Bearer $REGULAR_USER_TOKEN" \
  --data-urlencode "query=xyz123zyx")
log_response "$SEARCH_NO_RESULTS_RESPONSE"
else
  echo "  ⚠️ SKIPPING SEARCH FUNCTIONALITY: Regular user token not available."
fi

# =============================================================================
# PHASE 8: REGULAR USER LOGOUT
# =============================================================================
if [ -n "$REGULAR_USER_TOKEN" ]; then
log_step "8" "REGULAR USER LOGOUT"

log_action "8.1 Logging out regular user '$REGULAR_USER_USERNAME'"
LOGOUT_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/logout" \
  -H "Authorization: Bearer $REGULAR_USER_TOKEN")
log_response "$LOGOUT_RESPONSE"
REGULAR_USER_TOKEN="" # Clear token
echo "  Regular user logged out."
else
  echo "  ⚠️ SKIPPING REGULAR USER LOGOUT: Token not available."
fi

# =============================================================================
# SUMMARY
# =============================================================================
echo ""
echo "✅✅✅ TEST SUITE COMPLETED ✅✅✅"
echo "Summary of created/used dynamic data:"
echo "  - Registered User: $REGULAR_USER_USERNAME ($REGULAR_USER_EMAIL)"
echo "  - Registered User ID: $REGULAR_USER_ID"
echo "  - Thread ID: $THREAD_ID"
echo "  - Initial Message ID (in thread): $INITIAL_MESSAGE_ID"
echo "  - Reply Message ID: $REPLY_MESSAGE_ID"
echo ""
echo "👉 Review the output above for detailed responses and potential errors/warnings."
echo "👉 Remember to check your database state if needed."
echo ""

exit 0