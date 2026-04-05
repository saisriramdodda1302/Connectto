import axios from "axios";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setPosts } from "state";
import PostWidget from "./PostWidget";

const PostsWidget = ({ userId, isProfile = false }) => {
  const dispatch = useDispatch();
  const posts = useSelector((state) => state.value.posts);
  const token = useSelector((state) => state.value.token);

  const getPosts = async () => {
    const response = await axios.get("/posts", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = response.data;
    dispatch(setPosts({ posts: data }));
  };

  const getUserPosts = async () => {
    const response = await axios.get(`/posts/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = response.data;
    dispatch(setPosts({ posts: data }));
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
          />
        )
      )}
    </>
  );
};

export default PostsWidget;
