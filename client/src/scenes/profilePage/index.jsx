import axios from "axios";
import {useState,useEffect} from "react"
import { useParams } from "react-router-dom";
import { Box, useMediaQuery } from "@mui/material";
import Navbar from "scenes/navbar";
import UserWidget from "scenes/widgets/UserWidget";
import FriendListWidget from "scenes/widgets/FriendListWidget";
import MyPostWidget from "scenes/widgets/MyPostWidget";
import PostsWidget from "scenes/widgets/PostsWidget";
import { useSelector } from "react-redux";

const ProfilePage = ()=>{
    const {userId} = useParams();
    const [user,setUser] = useState(null);
    const token = useSelector((state)=>state.value.token);
    const isNonMobileScreens = useMediaQuery("(min-width:1000px)");


    const getUser = async()=>{
        const response = await axios.get(`/users/${userId}`,{
            headers: {Authorization: `Bearer ${token}`},
        });
        setUser(response.data);
    }



    useEffect(()=>{
        getUser();
    },[]);
    if(user==null) return;

    return (
        <Box>
            <Navbar />
            <Box
            width="100%"
            padding="2rem 6%"
            display={isNonMobileScreens ? "flex" : "block"}
            gap="2rem"
            justifyContent="center"
            >
                <Box flexBasis={isNonMobileScreens ? "26%" : undefined}>
                    <UserWidget userId={user._id} picturePath={user.picturepath} />
                    <Box m="2rem 0" />
                    <FriendListWidget userId={user._id} type="profile"/>
                </Box>
                <Box
                    flexBasis={isNonMobileScreens ? "42%" : undefined}
                    mt={isNonMobileScreens ? undefined : "2rem"}
                >
                    <MyPostWidget picturepath={user.picturepath} />
                    <PostsWidget userId ={user._id} isProfile/>
                </Box>
            </Box>
        </Box>
    );
}
export default ProfilePage;