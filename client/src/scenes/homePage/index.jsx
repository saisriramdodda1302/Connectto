import { Box, useMediaQuery } from "@mui/material";
import { useSelector } from "react-redux";
import Navbar from "scenes/navbar";
import UserWidget from "scenes/widgets/UserWidget";//like User profile
import MyPostWidget from "scenes/widgets/MyPostWidget";//Post creation box 
import PostsWidget from "scenes/widgets/PostsWidget";//Renders all posts, including user + friends (based on backend API)
import FriendListWidget from "scenes/widgets/FriendListWidget";
import Friend from "components/Friend";

const HomePage = () => {
  const isNonMobileScreens = useMediaQuery("(min-width:1000px)");
  const { _id, picturepath } = useSelector((state) => state.value.user);//redux 

  return (
    <Box>
      <Navbar />
      <Box
        width="100%"
        padding="2rem 6%"
        display={isNonMobileScreens ? "flex" : "block"}
        gap="0.5rem"
        justifyContent="space-between"
      >
        {/* left part */}
        <Box flexBasis={isNonMobileScreens ? "26%" : undefined}>
          <UserWidget userId={_id} picturePath={picturepath} />
        </Box>
        {/* middle part */}
        <Box
          flexBasis={isNonMobileScreens ? "42%" : undefined}
          mt={isNonMobileScreens ? undefined : "2rem"}
        >
          <MyPostWidget picturepath={picturepath} />
          <PostsWidget userId ={_id}/>
        </Box>
        {/* rightside part only visible on big screens.*/}
        {isNonMobileScreens && <Box flexBasis="26%">
        <FriendListWidget userId={_id}/>
        </Box>}
      </Box>
    </Box>
  );
};
export default HomePage;
