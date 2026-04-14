import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setPosts, appendPosts } from "state";
import PostWidget from "./PostWidget";

const PostsWidget = ({ userId, isProfile = false }) => {
  const dispatch = useDispatch();
  const posts = useSelector((state) => state.value.posts);
  const token = useSelector((state) => state.value.token);
  const [nextCursor, setNextCursor] = useState(null);
  const [loading, setLoading] = useState(false);

  const getPosts = async () => {
    const response = await axios.get("/posts", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const { posts: data, nextCursor: newCursor } = response.data;
    dispatch(setPosts({ posts: data }));
    setNextCursor(newCursor);
  };

  const getUserPosts = async () => {
    const response = await axios.get(`/posts/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const { posts: data, nextCursor: newCursor } = response.data;
    dispatch(setPosts({ posts: data }));
    setNextCursor(newCursor);
  };

  const loadMore = async () => {
    if (!nextCursor || loading) return;
    setLoading(true);
    const endpoint = isProfile ? `/posts/${userId}` : `/posts`;
    const response = await axios.get(`${endpoint}?cursor=${nextCursor}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const { posts: data, nextCursor: newCursor } = response.data;
    dispatch(appendPosts({ posts: data }));
    setNextCursor(newCursor);
    setLoading(false);
  };

  useEffect(() => {
    if (isProfile) {
      getUserPosts();
    } else {
      getPosts();
    }
  }, [isProfile, userId, token, dispatch]);

  return (
    <>
      <div className="flex flex-col gap-6">
        {posts.map(
          ({
            _id,
            userid,
            firstname,
            lastname,
            description,
            location,
            picturepath,
            userpicturepath,
            likes,
            comments,
          }) => (
            <PostWidget
              key={_id}
              postId={_id}
              postUserId={userid}
              name={`${firstname} ${lastname}`}
              description={description}
              location={location}
              picturePath={picturepath}
              userPicturePath={userpicturepath}
              likes={likes}
              comments={comments}
            />
          )
        )}
      </div>
      {nextCursor && (
        <div className="flex justify-center mt-6 p-4">
          <button 
            onClick={loadMore} 
            disabled={loading}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full font-medium transition-colors duration-300 disabled:opacity-50"
          >
            {loading ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </>
  );
};

export default PostsWidget;

