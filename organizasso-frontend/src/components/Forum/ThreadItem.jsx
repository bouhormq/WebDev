import React, { useState, useEffect, useContext } from 'react'; // Added useEffect, useContext
import { formatDistanceToNow } from 'date-fns'; // For relative time
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"; // Import AvatarImage
import { Clock, ChevronDown, ChevronUp, CornerDownRight, ThumbsUp, ThumbsDown } from 'lucide-react'; // Icons, Added ThumbsUp, ThumbsDown
import ThreadDetailView from './ThreadDetailView'; // Import ThreadDetailView
import ReplyForm from './ReplyForm'; // Import ReplyForm
import { postReply, likeDislikeMessage } from '../../services/forumService'; // Import postReply and likeDislikeMessage
import { deleteUserMessage } from '../../services/userService'; // Import deleteUserMessage
import { toast } from "sonner"; // For showing notifications
import Spinner from '../Common/Spinner'; // For loading state in reply button
import { AuthContext } from '../../contexts/authContext.jsx'; // Import AuthContext

// --- Inline Style for Thread Content ---
const threadContentStyle = {
  padding: '1rem',
  paddingTop: '0.5rem',
  fontSize: '0.9rem',
  lineHeight: '1.6',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
  color: 'var(--foreground)',
};
// --- End Inline Style ---

const ThreadItem = ({ thread, onClick, isExpanded, onReplyPosted, ensureThreadOpen }) => {
  const { currentUser } = useContext(AuthContext); // Get currentUser
  const [showInlineReplyForm, setShowInlineReplyForm] = useState(false);
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [detailViewKey, setDetailViewKey] = useState(0);

  // State for Like/Dislike functionality for the initial post
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [localLikeCount, setLocalLikeCount] = useState(thread.initialPost?.likeCount || 0);
  const [localDislikeCount, setLocalDislikeCount] = useState(thread.initialPost?.dislikeCount || 0);
  const [isLikingOrDisliking, setIsLikingOrDisliking] = useState(false);

  // Function to handle deleting a message from the detail view
  const handleDeleteMessageInDetailView = async (messageId) => {
    if (!currentUser) {
      toast.error("Error", { description: "You must be logged in to delete messages." });
      return;
    }
    // Optional: Add a confirmation dialog here if desired
    // if (!window.confirm("Are you sure you want to delete this message?")) return;

    toast.info("Deleting message...");
    try {
      await deleteUserMessage(messageId);
      toast.success("Success!", { description: "Message deleted successfully." });
      setDetailViewKey(prevKey => prevKey + 1); // Refresh ThreadDetailView
    } catch (error) {
      console.error("Failed to delete message:", error);
      toast.error("Delete Failed", {
        description: error.message || "Could not delete the message. Please try again.",
      });
    }
  };

  useEffect(() => {
    if (currentUser && thread.initialPost && thread.initialPost.likes && thread.initialPost.dislikes) {
      setIsLiked(thread.initialPost.likes.includes(currentUser._id));
      setIsDisliked(thread.initialPost.dislikes.includes(currentUser._id));
    }
    setLocalLikeCount(thread.initialPost?.likeCount || 0);
    setLocalDislikeCount(thread.initialPost?.dislikeCount || 0);
  }, [currentUser, thread.initialPost]);


  // Ensure lastPostTime is a valid Date object before formatting
  let lastPostTimeText = 'Unknown';
  if (thread.lastPostTime instanceof Date && !isNaN(thread.lastPostTime)) {
    try {
      lastPostTimeText = formatDistanceToNow(thread.lastPostTime, { addSuffix: true });
    } catch (error) {
      console.error("Error formatting date in ThreadItem:", error);
      lastPostTimeText = 'Invalid date'; 
    }
  }

  // Get first letter for fallback avatar
  const authorInitial = thread.authorName ? thread.authorName.charAt(0).toUpperCase() : '?';
  
  let finalProfilePicUrl = null;
  if (thread.profilePicUrl) {
    let path = thread.profilePicUrl.replace(/^\/?uploadss\//, '/uploads/'); // Corrects "uploadss" if present
    if (!path.startsWith('/')) {
      path = '/' + path;
    }
    const serverOrigin = new URL(import.meta.env.VITE_API_BASE_URL).origin;
    finalProfilePicUrl = serverOrigin + path;
    // console.log('ThreadItem: Corrected Profile Pic URL:', finalProfilePicUrl, 'Original:', thread.profilePicUrl);
  }

  let finalContentImageUrl = null;
  // Access imageUrl from initialPost
  if (thread.initialPost?.imageUrl) { 
    let imagePath = thread.initialPost.imageUrl.replace(/^\/?uploads\//, '/uploads/');
    if (!imagePath.startsWith('/')) {
      imagePath = '/' + imagePath;
    }
    const serverOrigin = new URL(import.meta.env.VITE_API_BASE_URL).origin;
    finalContentImageUrl = serverOrigin + imagePath;
    // console.log('ThreadItem: Content Image URL:', finalContentImageUrl, 'Original Initial Post imageUrl:', thread.initialPost.imageUrl);
  }

  const handleInlineReplySubmit = async (content, parentId, imageFile) => {
    if (!thread._id) {
      toast.error("Error", {
        description: "Thread ID is missing. Cannot post reply.",
      });
      return false;
    }
    setIsSubmittingReply(true);
    try {
      const newMessage = await postReply(thread._id, content, parentId, imageFile);
      toast.success("Success!", {
        description: "Your reply has been posted.",
      });
      setShowInlineReplyForm(false);
      if (onReplyPosted) {
        onReplyPosted(thread._id, newMessage);
      }
      setDetailViewKey(prevKey => prevKey + 1);
      return true;
    } catch (error) {
      console.error("Failed to post inline reply:", error);
      toast.error("Reply Failed", {
        description: error.message || "Could not post your reply. Please try again.",
      });
      return false;
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const toggleInlineReplyForm = (e) => {
    e.stopPropagation();
    if (ensureThreadOpen && !isExpanded) {
      ensureThreadOpen(thread._id); // Ensure the thread detail view is open
    }
    setShowInlineReplyForm(!showInlineReplyForm);
  };

  const handleInitialPostLikeDislike = async (actionType) => {
    if (!thread.initialPost?._id || !currentUser) {
      toast.error("Error", {
        description: "Cannot perform action. Please log in or ensure the post is valid.",
      });
      return;
    }
    if (isLikingOrDisliking) return;

    setIsLikingOrDisliking(true);
    try {
      const response = await likeDislikeMessage(thread.initialPost._id, actionType);
      // Correctly access the nested message object from the response
      const updatedMessageData = response.message; 

      setLocalLikeCount(updatedMessageData.likeCount);
      setLocalDislikeCount(updatedMessageData.dislikeCount);
      setIsLiked(updatedMessageData.likes?.includes(currentUser._id) || false);
      setIsDisliked(updatedMessageData.dislikes?.includes(currentUser._id) || false);

    } catch (error) {
      console.error(`Failed to ${actionType} post:`, error);
      toast.error("Action Failed", {
        description: error.message || `Could not ${actionType} the post. Please try again.`,
      });
    } finally {
      setIsLikingOrDisliking(false);
    }
  };

  // --- Styles ---
  const itemContainerStyle = {};
  const summaryDivStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem',
    transition: 'background-color 0.2s ease-in-out',
  };
  const avatarStyle = { height: '2.25rem', width: '2.25rem'};
  const infoDivStyle = { flexGrow: 1, margin: '0.125rem 0', overflow: 'hidden' };
  const titlePStyle = { fontSize: '0.875rem', fontWeight: 500, lineHeight: 1.25, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' };
  const authorInfoPStyle = { fontSize: '0.75rem', color: 'var(--muted-foreground)' };
  const authorSpanStyle = { fontWeight: 500 };
  const statsDivStyle = { flexShrink: 0, display: 'flex', alignItems: 'center', fontSize: '0.75rem', color: 'var(--muted-foreground)', gap: '1rem' };
  const statItemStyle = { display: 'flex', alignItems: 'center' };
  const iconStyle = { height: '0.875rem', width: '0.875rem', marginRight: '0.25rem' };
  
  const likeDislikeIconStyle = { height: '0.9rem', width: '0.9rem' }; // Slightly larger for action buttons
  const likeDislikeButtonSharedStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    fontSize: '0.8rem',
    cursor: 'pointer',
    padding: '0.25rem 0.5rem',
    borderRadius: 'var(--radius)',
    backgroundColor: 'transparent',
    border: '1px solid transparent',
    lineHeight: '1', // For better alignment of icon and text
  };

  const detailViewContainerStyle = {
    paddingLeft: '2rem',
    paddingRight: '1rem',
    paddingBottom: '1rem',
  };
  const toggleRepliesButtonStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    fontSize: '0.75rem',
    color: 'var(--muted-foreground)',
    cursor: 'pointer',
    padding: '0.25rem 0.5rem',
    borderRadius: 'var(--radius)',
  };
  const contentImageStyle = {
    maxWidth: '100%',
    maxHeight: '300px',
    marginTop: '0.75rem',
    borderRadius: 'var(--radius)',
    objectFit: 'contain',
  };
  const actionsContainerStyle = {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: '1rem', // Spacing between Reply, Like, Dislike
    padding: '0 1rem 0.5rem 1rem',
    marginTop: '0.5rem',
  };
  const replyButtonStyle = { // Combined with likeDislikeButtonSharedStyle for consistency
    ...likeDislikeButtonSharedStyle,
    color: 'var(--primary)',
  };
  const replyFormContainerStyle = {
    padding: '0 1rem 1rem 1rem',
    marginTop: '0.5rem',
  };

  return (
    <div style={itemContainerStyle}>
      <div style={summaryDivStyle}>
        <Avatar style={avatarStyle}>
          {finalProfilePicUrl ? (
            <AvatarImage src={finalProfilePicUrl} alt={thread.authorName} />
          ) : (
            <AvatarFallback>{authorInitial}</AvatarFallback>
          )}
        </Avatar>
        <div style={infoDivStyle}>
          <p style={titlePStyle}>{thread.title || 'Untitled Thread'}</p>
          <p style={authorInfoPStyle}>
            Started by <span style={authorSpanStyle}>{thread.authorName || 'Unknown'}</span>
          </p>
        </div>
        <div style={statsDivStyle}>
          <div style={statItemStyle} title={`Last post: ${lastPostTimeText}`}>
            <Clock style={iconStyle} />
            <span>{lastPostTimeText}</span>
          </div>
          <div 
            style={toggleRepliesButtonStyle}
            onClick={onClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onClick()}
            title={isExpanded ? "Hide Replies" : "Show Replies"}
          >
            {isExpanded ? <ChevronUp style={iconStyle} /> : <ChevronDown style={iconStyle} />}
            <span>{isExpanded ? "Hide Replies" : `Show Replies (${thread.messageCount ?? thread.replyCount ?? 0})`}</span>
          </div>
        </div>
      </div>

      {/* Always visible thread content - uses initialPost */}
      {thread.initialPost?.content && thread.initialPost.content.trim() !== '' ? (
        <div style={threadContentStyle}>
          <p>{thread.initialPost.content}</p>
          {finalContentImageUrl && (
            <img 
              src={finalContentImageUrl} 
              alt="Thread initial content image" 
              style={contentImageStyle} 
            />
          )}
        </div>
      ) : (
        <div style={{ ...threadContentStyle, color: 'var(--muted-foreground)', fontStyle: 'italic' }}>
          <p>[This thread has no initial content]</p>
          {finalContentImageUrl && ( // Still show image if content is empty but image exists
            <img 
              src={finalContentImageUrl} 
              alt="Thread initial content image" 
              style={contentImageStyle} 
            />
          )}
        </div>
      )}

      {/* Actions: Reply, Like, Dislike buttons */}
      <div style={actionsContainerStyle}>
        <button 
          style={replyButtonStyle} 
          onClick={toggleInlineReplyForm}
          title="Reply to this thread"
          disabled={isSubmittingReply || !currentUser} // Disable if not logged in or submitting
        >
          {isSubmittingReply && showInlineReplyForm ? (
            <Spinner size="sm" style={{marginRight: '0.35rem'}} />
          ) : (
            <CornerDownRight style={{ ...likeDislikeIconStyle, marginRight: '0.1rem' }} />
          )}
          Reply
        </button>

        {/* Like/Dislike only if initialPost exists and user is logged in */}
        {thread.initialPost?._id && currentUser && (
          <>
            <button
              style={{ 
                ...likeDislikeButtonSharedStyle, 
                color: isLiked ? 'var(--primary)' : 'var(--muted-foreground)',
              }}
              onClick={() => handleInitialPostLikeDislike('like')}
              disabled={isLikingOrDisliking}
              title={isLiked ? "Unlike" : "Like"}
            >
              {isLikingOrDisliking && (isLiked || (!isLiked && !isDisliked)) ? <Spinner size="sm" /> : <ThumbsUp style={likeDislikeIconStyle} />}
              <span style={{ marginLeft: '0.25rem' }}>{localLikeCount}</span>
            </button>

            <button
              style={{ 
                ...likeDislikeButtonSharedStyle, 
                color: isDisliked ? 'var(--destructive)' : 'var(--muted-foreground)',
              }}
              onClick={() => handleInitialPostLikeDislike('dislike')}
              disabled={isLikingOrDisliking}
              title={isDisliked ? "Undislike" : "Dislike"}
            >
              {isLikingOrDisliking && (isDisliked || (!isLiked && !isDisliked)) ? <Spinner size="sm" /> : <ThumbsDown style={likeDislikeIconStyle} />}
              <span style={{ marginLeft: '0.25rem' }}>{localDislikeCount}</span>
            </button>
          </>
        )}
      </div>

      {showInlineReplyForm && (
        <div style={replyFormContainerStyle}>
          <ReplyForm 
            threadId={thread._id}
            parentId={null} // Direct reply to the thread's initial post conceptually
            onReplySubmit={handleInlineReplySubmit}
            isLoading={isSubmittingReply}
          />
        </div>
      )}

      {isExpanded && (
        <div style={detailViewContainerStyle}>
          <ThreadDetailView
            key={detailViewKey}
            threadId={thread._id}
            originalThreadContent={thread.initialPost?.content} // Use initialPost content
            onPostReply={handleInlineReplySubmit}
            isPostingReply={isSubmittingReply}
            currentUserId={currentUser?._id} // Pass currentUserId
            onDeleteMessage={handleDeleteMessageInDetailView} // Pass the delete handler
          />
        </div>
      )}
    </div>
  );
};

export default ThreadItem;
