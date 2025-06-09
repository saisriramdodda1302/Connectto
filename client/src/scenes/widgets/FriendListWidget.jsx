import axios from "axios";
import { Box, Typography, useTheme } from "@mui/material";
import Friend from "components/Friend";
import WidgetWrapper from "components/WidgetWrapper";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setFriends } from "state";

const FriendListWidget = ({userId,type="home"})=>{

    const friends = useSelector((state)=>state.value.user.friends);
    const token = useSelector((state)=>state.value.token);

    const dispatch = useDispatch();
    const { palette } = useTheme();

    const getFriends = async()=>{
        try{
            const response = await axios.get(`/users/${userId}/friends`,{
                headers: {Authorization:`Bearer ${token}`},
            });
            dispatch(setFriends({friends:response.data}));

            console.log(response.data);
        }
        catch(err){
            console.log(err);
        }

    }

    useEffect(()=>{
        getFriends();
    },[]);

    return (
        <WidgetWrapper>
          <Typography
            color={palette.neutral.dark}
            variant="h5"
            fontWeight="500"
            sx={{ mb: "1.5rem" }}
          >
            Friend List
          </Typography>
          <Box display="flex" flexDirection="column" gap="1.5rem">
            {friends.map((friend) => (
              <Friend
                key={friend._id}
                friendId={friend._id}
                name={`${friend.firstname} ${friend.lastname}`}
                subtitle={friend.occupation}
                userPicturePath={friend.picturepath}
                type={type}
              />
            ))}
          </Box>
        </WidgetWrapper>
      );

}

export default FriendListWidget;