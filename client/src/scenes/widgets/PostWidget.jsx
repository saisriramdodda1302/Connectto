import {
  MessageCircle,
  Heart,
  Share2
} from "lucide-react";
import FlexBetween from "components/FlexBetween";
import Friend from "components/Friend";
import WidgetWrapper from "components/WidgetWrapper";
import axios from "axios";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setPosts } from "state";

const PostWidget = ({
  postId,
  postUserId,
  name,
  description,
  location,
  picturePath,
  userPicturePath,
  likes,
}) => {
  const comments = ["HELLO", "HELLO"];
  const [isComments, setIsComments] = useState(false);
  const dispatch = useDispatch();
  const token = useSelector((state) => state.value.token);
  const loggedInUserId = useSelector((state) => state.value.user._id);

  if (likes == null) return null;

  const isLiked = likes.find((index) => index.userid === loggedInUserId);
  const likeCount = likes.length;

  const patchLike = async () => {
    const response = await axios.patch(`/posts/${postId}/like`, { userId: loggedInUserId }, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });
    const updatedPost = response.data;
    dispatch(setPosts({ posts: updatedPost }));
  };

  return (
    <WidgetWrapper className="my-8 transition-colors duration-300">
      <Friend
        friendId={postUserId}
        name={name}
        subtitle={location}
        userPicturePath={userPicturePath}
      />
      <p className="text-neutral-700 dark:text-gray-200 mt-4 text-base">
        {description}
      </p>
      {picturePath && (
        <img
          width="100%"
          height="auto"
          alt="post"
          className="rounded-xl mt-4 object-cover"
          src={`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/assets/${picturePath}`}
        />
      )}
      <FlexBetween className="mt-4">
        <FlexBetween gap="1.5rem">
          <FlexBetween gap="0.3rem">
            <button onClick={patchLike} className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors duration-300">
              {isLiked ? (
                <Heart className="w-7 h-7 text-blue-500 fill-blue-500" />
              ) : (
                <Heart className="w-7 h-7 text-neutral-500 dark:text-gray-400" />
              )}
            </button>
            <p className="text-neutral-600 dark:text-gray-300 text-lg">{likeCount}</p>
          </FlexBetween>

          <FlexBetween gap="0.3rem">
            <button onClick={() => setIsComments(!isComments)} className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors duration-300">
              <MessageCircle className="w-7 h-7 text-neutral-500 dark:text-gray-400" />
            </button>
            <p className="text-neutral-600 dark:text-gray-300 text-lg">{comments.length}</p>
          </FlexBetween>
        </FlexBetween>

        <button className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors duration-300">
          <Share2 className="w-7 h-7 text-neutral-500 dark:text-gray-400" />
        </button>
      </FlexBetween>
      
      {isComments && (
        <div className="mt-4 text-neutral-700 dark:text-gray-200 transition-colors duration-300">
          {comments.map((comment, i) => (
            <div key={`${name}-${i}`}>
              <hr className="border-neutral-200 dark:border-neutral-700 my-2" />
              <p className="my-3 pl-4 text-base">
                {comment}
              </p>
            </div>
          ))}
          <hr className="border-neutral-200 dark:border-neutral-700 my-2" />
        </div>
      )}
    </WidgetWrapper>
  );
};

export default PostWidget;
