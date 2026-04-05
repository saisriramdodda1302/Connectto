import axios from "axios";
import { UserPlus, UserMinus } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setFriends } from "state";
import FlexBetween from "./FlexBetween";
import UserImage from "./UserImage";

const Friend = ({ friendId, name, subtitle, userPicturePath, type }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { _id } = useSelector((state) => state.value.user);
  const token = useSelector((state) => state.value.token);
  const friends = useSelector((state) => state.value.user.friends);

  const isFriend = friends.find((friend) => friend._id === friendId);

  const patchFriend = async () => {
    try {
      const response = await axios.patch(
        `/users/${_id}/${friendId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      dispatch(setFriends({ friends: response.data }));
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <FlexBetween className="transition-colors duration-300">
      <FlexBetween gap="1rem">
        <UserImage image={userPicturePath} size="55px" />
        <div
          onClick={() => {
            navigate(`/profile/${friendId}`);
            navigate(0);
          }}
        >
          <h5 className="font-medium text-neutral-700 dark:text-gray-100 hover:text-blue-500 dark:hover:text-blue-400 cursor-pointer text-lg transition-colors duration-300">
            {name}
          </h5>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm">
            {subtitle}
          </p>
        </div>
      </FlexBetween>
      {_id != friendId && type != "profile" && (
        <button
          onClick={() => patchFriend()}
          className="bg-blue-100 dark:bg-blue-900/30 p-2 text-blue-700 dark:text-blue-400 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800/40 transition-colors duration-300 inline-flex items-center justify-center p-[0.6rem]"
        >
          {isFriend ? (
            <UserMinus className="w-5 h-5" />
          ) : (
            <UserPlus className="w-5 h-5" />
          )}
        </button>
      )}
    </FlexBetween>
  );
};

export default Friend;