import axios from "axios";
import Friend from "components/Friend";
import WidgetWrapper from "components/WidgetWrapper";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setFriends } from "state";

const FriendListWidget = ({ userId, type = "home" }) => {
  const myFriends = useSelector((state) => state.value.user.friends);
  const token = useSelector((state) => state.value.token);
  const dispatch = useDispatch();
  const [profileFriends, setProfileFriends] = useState([]);

  // Home shows my own friends (kept in redux); a profile shows someone else's.
  const isProfile = type === "profile";
  const friends = isProfile ? profileFriends : myFriends;

  const getFriends = async () => {
    try {
      const response = await axios.get(`/users/${userId}/friends`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (isProfile) {
        setProfileFriends(response.data);
      } else {
        dispatch(setFriends({ friends: response.data }));
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getFriends();
  }, [userId, token, dispatch]);

  return (
    <WidgetWrapper>
      <h5 className="text-neutral-800 dark:text-gray-100 text-xl font-medium mb-8 transition-colors duration-300">
        Friend List
      </h5>
      <div className="flex flex-col gap-6">
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
      </div>
    </WidgetWrapper>
  );
};

export default FriendListWidget;