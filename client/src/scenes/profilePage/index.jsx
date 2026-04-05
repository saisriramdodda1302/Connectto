import axios from "axios";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Navbar from "scenes/navbar";
import UserWidget from "scenes/widgets/UserWidget";
import FriendListWidget from "scenes/widgets/FriendListWidget";
import MyPostWidget from "scenes/widgets/MyPostWidget";
import PostsWidget from "scenes/widgets/PostsWidget";
import { useSelector } from "react-redux";

const ProfilePage = () => {
    const { userId } = useParams();
    const [user, setUser] = useState(null);
    const token = useSelector((state) => state.value.token);

    const getUser = async () => {
        try {
            const response = await axios.get(`/users/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUser(response.data);
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        getUser();
    }, [userId, token]);

    if (!user) return null;

    return (
        <div>
            <Navbar />
            <div className="w-full px-[6%] py-8 block lg:flex gap-8 justify-center">
                <div className="lg:w-[26%] w-full">
                    <UserWidget userId={user._id} picturePath={user.picturepath} />
                    <div className="my-8" />
                    <FriendListWidget userId={user._id} type="profile" />
                </div>
                <div className="lg:w-[42%] w-full mt-8 lg:mt-0">
                    <MyPostWidget picturePath={user.picturepath} />
                    <PostsWidget userId={user._id} isProfile />
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;