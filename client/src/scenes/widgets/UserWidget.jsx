import {
  UserCog,
  Pencil,
  MapPin,
  Briefcase
} from "lucide-react";
import UserImage from "components/UserImage";
import FlexBetween from "components/FlexBetween";
import WidgetWrapper from "components/WidgetWrapper";
import axios from "axios";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const UserWidget = ({ userId, picturepath }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const token = useSelector((state) => state.value.token);

  const getUser = async () => {
    try {
      const response = await axios.get(`/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      var user2 = response.data;

      try {
        const responseFriends = await axios.get(`/users/${userId}/friends`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        user2 = { ...user2, friends: responseFriends.data };
        setUser(user2);
      } catch (err) {
        console.log(err);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getUser();
  }, []);

  if (!user) {
    return null;
  }

  const {
    firstname,
    lastname,
    location,
    occupation,
    viewedprofile,
    impressions,
    friends,
  } = user;

  return (
    <WidgetWrapper>
      {/* First Row */}
      <FlexBetween
        gap="0.5rem"
        className="pb-6 border-b border-neutral-200 dark:border-neutral-700 cursor-pointer transition-colors duration-300"
        onClick={() => navigate(`/profile/${userId}`)}
      >
        <FlexBetween gap="1.5rem">
          <UserImage image={picturepath} />
          <div>
            <h4 className="text-2xl font-medium text-neutral-800 dark:text-gray-100 hover:text-blue-500 transition-colors duration-300">
              {firstname} {lastname}
            </h4>
            <p className="text-neutral-500 dark:text-neutral-400 mt-1">{friends.length} friends</p>
          </div>
        </FlexBetween>
        <UserCog className="w-7 h-7 text-neutral-700 dark:text-gray-300" />
      </FlexBetween>

      {/* Second Row */}
      <div className="py-6 border-b border-neutral-200 dark:border-neutral-700 transition-colors duration-300">
        <div className="flex items-center gap-4 mb-4 text-neutral-500 dark:text-neutral-400">
          <MapPin className="w-7 h-7" />
          <p className="text-lg">{location}</p>
        </div>
        <div className="flex items-center gap-4 text-neutral-500 dark:text-neutral-400">
          <Briefcase className="w-7 h-7" />
          <p className="text-lg">{occupation}</p>
        </div>
      </div>

      {/* Third row */}
      <div className="py-6 border-b border-neutral-200 dark:border-neutral-700 transition-colors duration-300">
        <FlexBetween className="mb-3">
          <p className="text-neutral-500 dark:text-neutral-400 text-lg">Who's viewed your profile</p>
          <p className="text-neutral-700 dark:text-gray-200 font-medium text-lg">{viewedprofile}</p>
        </FlexBetween>
        <FlexBetween>
          <p className="text-neutral-500 dark:text-neutral-400 text-lg">Impressions of your post</p>
          <p className="text-neutral-700 dark:text-gray-200 font-medium text-lg">{impressions}</p>
        </FlexBetween>
      </div>

      {/* Fourth row */}
      <div className="pt-6">
        <p className="text-lg text-neutral-700 dark:text-gray-200 font-medium mb-6">
          Social Profiles
        </p>

        <FlexBetween gap="1rem" className="mb-4">
          <FlexBetween gap="1.5rem">
            <img src="../assets/twitter.png" alt="twitter" className="w-8 h-8" />
            <div>
              <p className="text-neutral-700 dark:text-gray-200 font-medium text-lg">Twitter</p>
              <p className="text-neutral-500 dark:text-neutral-400 text-base">Social Network</p>
            </div>
          </FlexBetween>
          <Pencil className="w-6 h-6 text-neutral-500 dark:text-neutral-400 cursor-pointer hover:text-blue-500 transition" />
        </FlexBetween>

        <FlexBetween gap="1rem">
          <FlexBetween gap="1.5rem">
            <img src="../assets/linkedin.png" alt="linkedin" className="w-8 h-8" />
            <div>
              <p className="text-neutral-700 dark:text-gray-200 font-medium text-lg">Linkedin</p>
              <p className="text-neutral-500 dark:text-neutral-400 text-base">Network Platform</p>
            </div>
          </FlexBetween>
          <Pencil className="w-6 h-6 text-neutral-500 dark:text-neutral-400 cursor-pointer hover:text-blue-500 transition" />
        </FlexBetween>
      </div>
    </WidgetWrapper>
  );
};

export default UserWidget;
