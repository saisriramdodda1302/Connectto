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
      <div className="w-full px-[6%] py-8 block lg:flex gap-4 justify-between">
        {/* left part */}
        <div className="lg:w-[26%] w-full">
          <UserWidget userId={_id} picturePath={picturepath} />
        </div>
        
        {/* middle part */}
        <div className="lg:w-[42%] w-full mt-8 lg:mt-0">
          <MyPostWidget picturePath={picturepath} />
          <PostsWidget userId={_id} />
        </div>
        
        {/* rightside part only visible on big screens.*/}
        <div className="hidden lg:block lg:w-[26%] w-full">
          <FriendListWidget userId={_id} />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
