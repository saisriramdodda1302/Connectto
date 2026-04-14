import { useSelector } from "react-redux";
import Navbar from "scenes/navbar";
import UserWidget from "scenes/widgets/UserWidget";
import MyPostWidget from "scenes/widgets/MyPostWidget";
import PostsWidget from "scenes/widgets/PostsWidget";
import FriendListWidget from "scenes/widgets/FriendListWidget";

const HomePage = () => {
  const { _id, picturepath } = useSelector((state) => state.value.user);

  return (
    <div>
      <Navbar />
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8 justify-center">
        {/* left part */}
        <div className="w-full lg:w-1/4 lg:max-w-sm">
          <UserWidget userId={_id} picturePath={picturepath} />
        </div>
        
        {/* middle part */}
        <div className="w-full lg:w-1/2 max-w-2xl mx-auto lg:mx-0">
          <MyPostWidget picturePath={picturepath} />
          <PostsWidget userId={_id} />
        </div>
        
        {/* rightside part only visible on big screens.*/}
        <div className="hidden lg:block lg:w-1/4 lg:max-w-sm">
          <FriendListWidget userId={_id} />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
