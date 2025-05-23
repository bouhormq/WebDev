import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Clock, ChevronDown, ChevronUp, CornerDownRight, ThumbsUp, ThumbsDown, Trash2 } from 'lucide-react';
import ThreadDetailView from './ThreadDetailView';
import ReplyForm from './ReplyForm';
import { postReply, likeDislikeMessage, deleteThread } from '../../services/forumService';
import { toast } from "sonner";
import Spinner from '../Common/Spinner';
import { AuthContext } from '../../contexts/authContext.jsx';
import styles from './styles/ThreadItem.module.css';

const ThreadItem = ({ thread, onClick, isExpanded, onReplyPosted, ensureThreadOpen, onThreadDeleted, currentUserId, onDeleteMessage }) => {
  const { currentUser } = useContext(AuthContext);
  const [showInlineReplyForm, setShowInlineReplyForm] = useState(false);
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [detailViewKey, setDetailViewKey] = useState(0);

  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [localLikeCount, setLocalLikeCount] = useState(thread.initialPost?.likeCount || 0);
  const [localDislikeCount, setLocalDislikeCount] = useState(thread.initialPost?.dislikeCount || 0);
  const [isLikingOrDisliking, setIsLikingOrDisliking] = useState(false);

  const canDelete = currentUser && thread && thread.authorId && (currentUser._id === thread.authorId || currentUser.isAdmin);

  const handleDeleteThread = async (e) => {
    e.stopPropagation();
    if (!thread || !thread._id) {
      toast.error("Cannot delete: Thread ID is missing.");
      return;
    }
    if (window.confirm("Are you sure you want to delete this thread? This will also delete all associated replies and cannot be undone.")) {
      try {
        await deleteThread(thread._id);
        toast.success("Thread and all replies deleted successfully.");
        if (onThreadDeleted) {
          onThreadDeleted();
        }
      } catch (error) {
        toast.error(error.message || "Failed to delete thread. Please try again.");
        console.error("Error deleting thread:", error);
      }
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

  let lastPostTimeText = 'Unknown';
  if (thread.lastPostTime instanceof Date && !isNaN(thread.lastPostTime)) {
    try {
      lastPostTimeText = formatDistanceToNow(thread.lastPostTime, { addSuffix: true });
    } catch (error) {
      console.error("Error formatting date in ThreadItem:", error);
      lastPostTimeText = 'Invalid date'; 
    }
  }

  const authorInitial = thread.authorName ? thread.authorName.charAt(0).toUpperCase() : '?';
  
  let finalProfilePicUrl = null;
  if (thread.profilePicUrl) {
    let path = thread.profilePicUrl.replace(/^\/?uploads\//, '/uploads/');
    if (!path.startsWith('/')) {
      path = '/' + path;
    }
    const serverOrigin = new URL(import.meta.env.VITE_API_BASE_URL).origin;
    finalProfilePicUrl = serverOrigin + path;
  }

  let finalContentImageUrl = null;
  if (thread.initialPost?.imageUrl) { 
    let imagePath = thread.initialPost.imageUrl.replace(/^\/?uploads\//, '/uploads/');
    if (!imagePath.startsWith('/')) {
      imagePath = '/' + imagePath;
    }
    const serverOrigin = new URL(import.meta.env.VITE_API_BASE_URL).origin;
    finalContentImageUrl = serverOrigin + imagePath;
  }

  const handleInlineReplySubmit = async (content, parentId, imageFile) => {
    if (!thread._id) {
      toast.error("Error", { description: "Thread ID is missing. Cannot post reply." });
      return false;
    }
    setIsSubmittingReply(true);
    try {
      const newMessage = await postReply(thread._id, content, parentId, imageFile);
      toast.success("Success!", { description: "Your reply has been posted." });
      setShowInlineReplyForm(false);
      if (onReplyPosted) {
        onReplyPosted(thread._id, newMessage);
      }
      setDetailViewKey(prevKey => prevKey + 1);
      return true;
    } catch (error) {
      console.error("Failed to post inline reply:", error);
      toast.error("Reply Failed", { description: error.message || "Could not post your reply. Please try again." });
      return false;
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const toggleInlineReplyForm = (e) => {
    e.stopPropagation();
    if (ensureThreadOpen && !isExpanded) {
      ensureThreadOpen(thread._id);
    }
    setShowInlineReplyForm(!showInlineReplyForm);
  };

  const handleInitialPostLikeDislike = async (actionType) => {
    if (!thread.initialPost?._id || !currentUser) {
      toast.error("Error", { description: "Cannot perform action. Please log in or ensure the post is valid." });
      return;
    }
    if (isLikingOrDisliking) return;
    setIsLikingOrDisliking(true);
    try {
      const response = await likeDislikeMessage(thread.initialPost._id, actionType);
      const updatedMessageData = response.message;
      setLocalLikeCount(updatedMessageData.likeCount);
      setLocalDislikeCount(updatedMessageData.dislikeCount);
      setIsLiked(updatedMessageData.likes?.includes(currentUser._id) || false);
      setIsDisliked(updatedMessageData.dislikes?.includes(currentUser._id) || false);
    } catch (error) {
      console.error(`Failed to ${actionType} post:`, error);
      toast.error("Action Failed", { description: error.message || `Could not ${actionType} the post. Please try again.` });
    } finally {
      setIsLikingOrDisliking(false);
    }
  };

  return (
    <div className={styles.itemContainerStyle} onClick={onClick}>
      <div className={styles.summaryDivStyle}>
        {thread.authorId ? (
          <Link to={`/profile/${thread.authorId}`} onClick={(e) => e.stopPropagation()} className={styles.avatarLinkStyle}>
            <Avatar className={styles.avatarStyle}>
              {finalProfilePicUrl ? (
                <AvatarImage src={finalProfilePicUrl} alt={thread.authorName} />
              ) : (
                <AvatarFallback>{authorInitial}</AvatarFallback>
              )}
            </Avatar>
          </Link>
        ) : (
          <Avatar className={styles.avatarStyle}>
            {finalProfilePicUrl ? (
              <AvatarImage src={finalProfilePicUrl} alt={thread.authorName || 'Unknown Author'} />
            ) : (
              <AvatarFallback>{authorInitial}</AvatarFallback>
            )}
          </Avatar>
        )}
        <div className={styles.infoDivStyle}>
          <p className={styles.titlePStyle}>{thread.title || 'Untitled Thread'}</p>
          <p className={styles.authorInfoPStyle}>
            Started by <span className={styles.authorSpanStyle}>{thread.authorName || 'Unknown'}</span>
          </p>
        </div>
        <div className={styles.statsDivStyle}>
          <div className="flex items-center text-xs text-muted-foreground space-x-2">
            <span>{thread.replyCount || 0} replies</span>
            <span className="text-muted-foreground">·</span>
            <Clock className="h-3 w-3" />
            <span>Last post: {lastPostTimeText}</span>
          </div>
          {canDelete && (
            <button
              onClick={handleDeleteThread}
              className={`ml-auto p-1 text-red-500 hover:text-red-700 transition-colors ${styles.deleteButton}`}
              aria-label="Delete thread"
              title="Delete Thread"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {thread.initialPost?.content && thread.initialPost.content.trim() !== '' ? (
        <div className={styles.threadContentStyle}>
          <p>{thread.initialPost.content}</p>
          {finalContentImageUrl && (
            <img 
              src={finalContentImageUrl} 
              alt="Thread initial content image" 
              className={styles.contentImageStyle} 
            />
          )}
        </div>
      ) : (
        <div className={styles.noContentPlaceholder}>
          <p>[This thread has no initial content]</p>
          {finalContentImageUrl && (
            <img 
              src={finalContentImageUrl} 
              alt="Thread initial content image" 
              className={styles.contentImageStyle}
            />
          )}
        </div>
      )}

      <div className={styles.actionsContainerStyle}>
        <button 
          className={styles.replyButtonStyle} 
          onClick={toggleInlineReplyForm}
          title="Reply to this thread"
          disabled={isSubmittingReply || !currentUser}
        >
          {isSubmittingReply && showInlineReplyForm ? (
            <Spinner size="sm" className={styles.replyButtonSpinner} />
          ) : (
            <CornerDownRight className={`${styles.likeDislikeIconStyle} ${styles.replyButtonIcon}`} />
          )}
          Reply
        </button>

        {thread.initialPost?._id && currentUser && (
          <>
            <button
              className={`${styles.likeDislikeButtonSharedStyle} ${isLiked ? styles.liked : ''}`}
              onClick={() => handleInitialPostLikeDislike('like')}
              disabled={isLikingOrDisliking}
              title={isLiked ? "Unlike" : "Like"}
            >
              {isLikingOrDisliking && (isLiked || (!isLiked && !isDisliked)) ? <Spinner size="sm" /> : <ThumbsUp className={styles.likeDislikeIconStyle} />}
              <span className={styles.likeDislikeCount}>{localLikeCount}</span>
            </button>
            <button
              className={`${styles.likeDislikeButtonSharedStyle} ${isDisliked ? styles.disliked : ''}`}
              onClick={() => handleInitialPostLikeDislike('dislike')}
              disabled={isLikingOrDisliking}
              title={isDisliked ? "Undislike" : "Dislike"}
            >
              {isLikingOrDisliking && (isDisliked || (!isLiked && !isDisliked)) ? <Spinner size="sm" /> : <ThumbsDown className={styles.likeDislikeIconStyle} />}
              <span className={styles.likeDislikeCount}>{localDislikeCount}</span>
            </button>
          </>
        )}
      </div>

      {showInlineReplyForm && (
        <div className={styles.replyFormContainerStyle}>
          <ReplyForm 
            threadId={thread._id}
            parentId={null}
            onReplySubmit={handleInlineReplySubmit}
            isLoading={isSubmittingReply}
          />
        </div>
      )}

      {isExpanded && (
        <div className={styles.detailViewContainerStyle}>
          <ThreadDetailView
            key={detailViewKey}
            threadId={thread._id}
            originalThreadContent={thread.initialPost?.content}
            onPostReply={handleInlineReplySubmit}
            isPostingReply={isSubmittingReply}
            currentUserId={currentUserId} // Pass currentUserId prop
            onDeleteMessage={onDeleteMessage} // Pass onDeleteMessage prop
          />
        </div>
      )}
    </div>
  );
};

export default ThreadItem;
