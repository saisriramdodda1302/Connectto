import {
  MessageCircle,
  Heart,
  Share2,
  Send
} from "lucide-react";
import FlexBetween from "components/FlexBetween";
import Friend from "components/Friend";
import WidgetWrapper from "components/WidgetWrapper";
import axios from "axios";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updatePost } from "state";

const PostWidget = ({
  postId,
  postUserId,
  name,
  description,
  location,
  picturePath,
  userPicturePath,
  likes,
  comments = [], // Ensuring it defaults to array
}) => {
  const [isComments, setIsComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useDispatch();
  const token = useSelector((state) => state.value.token);
  const loggedInUserId = useSelector((state) => state.value.user._id);

  if (!likes) return null;

  const isLiked = likes.find((index) => index.userid === loggedInUserId);
  const likeCount = likes.length;

  const patchLike = async () => {
    const response = await axios.patch(`/posts/${postId}/like`, { userId: loggedInUserId }, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });
    const updatedPost = response.data;
    dispatch(updatePost({ post: updatedPost }));
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await axios.post(`/posts/${postId}/comment`, 
        { userId: loggedInUserId, text: newComment }, 
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      const updatedPost = response.data;
      dispatch(updatePost({ post: updatedPost }));
      setNewComment("");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <WidgetWrapper className="my-2 transition-colors duration-300">
      <Friend
        friendId={postUserId}
        name={name}
        subtitle={location}
        userPicturePath={userPicturePath}
      />
      <p className="text-neutral-700 dark:text-gray-200 mt-4 text-base leading-relaxed">
        {description}
      </p>
      {picturePath && (
        <img
          width="100%"
          height="auto"
          alt="post"
          className="rounded-xl mt-4 object-cover max-h-[500px]"
          src={`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/assets/${picturePath}`}
        />
      )}
      <FlexBetween className="mt-4 pb-2">
        <FlexBetween gap="1.5rem">
          <FlexBetween gap="0.3rem">
            <button onClick={patchLike} className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors duration-300">
              {isLiked ? (
                <Heart className="w-6 h-6 text-blue-500 fill-blue-500" />
              ) : (
                <Heart className="w-6 h-6 text-neutral-500 dark:text-gray-400" />
              )}
            </button>
            <p className="text-neutral-600 dark:text-gray-300 font-medium">{likeCount}</p>
          </FlexBetween>

          <FlexBetween gap="0.3rem">
            <button onClick={() => setIsComments(!isComments)} className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors duration-300">
              <MessageCircle className="w-6 h-6 text-neutral-500 dark:text-gray-400" />
            </button>
            <p className="text-neutral-600 dark:text-gray-300 font-medium">{comments.length}</p>
          </FlexBetween>
        </FlexBetween>

        <button className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors duration-300">
          <Share2 className="w-6 h-6 text-neutral-500 dark:text-gray-400" />
        </button>
      </FlexBetween>
      
      {isComments && (
        <div className="mt-2 pt-4 border-t border-neutral-100 dark:border-neutral-800 transition-colors duration-300">
          <form onSubmit={handleCommentSubmit} className="flex gap-3 mb-6 items-center">
            <input 
              type="text" 
              placeholder="Write a comment..." 
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-gray-200 outline-none px-4 py-2.5 rounded-full text-sm"
              disabled={isSubmitting}
            />
            <button 
              type="submit" 
              disabled={!newComment.trim() || isSubmitting}
              className="p-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors disabled:opacity-50 disabled:hover:bg-blue-500"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          <div className="flex flex-col gap-4">
            {comments.map((comment, i) => (
              <div key={`${comment.id}-${i}`} className="flex gap-3">
                <img 
                  src={`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/assets/${comment.picturePath}`} 
                  alt="user"
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="flex flex-col bg-neutral-100 dark:bg-neutral-800 px-4 py-2.5 rounded-2xl rounded-tl-sm w-fit max-w-[85%]">
                  <span className="font-semibold text-sm text-neutral-800 dark:text-gray-200">
                    {comment.firstName} {comment.lastName}
                  </span>
                  <p className="text-sm text-neutral-700 dark:text-gray-300 mt-0.5">
                    {comment.text}
                  </p>
                </div>
              </div>
            ))}
            {comments.length === 0 && (
              <p className="text-sm text-center text-neutral-500 py-4">No comments yet. Be the first!</p>
            )}
          </div>
        </div>
      )}
    </WidgetWrapper>
  );
};

export default PostWidget;
