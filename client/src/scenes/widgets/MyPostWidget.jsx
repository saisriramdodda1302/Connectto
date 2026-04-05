import {
  Pencil,
  Trash,
  Paperclip,
  Image as ImageIcon,
  Mic,
  MoreHorizontal,
  Film
} from "lucide-react";
import Dropzone from "react-dropzone";
import FlexBetween from "components/FlexBetween";
import UserImage from "components/UserImage";
import WidgetWrapper from "components/WidgetWrapper";
import { useState, useEffect } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setPosts } from "state";

const MyPostWidget = ({ picturePath }) => {
  const dispatch = useDispatch();
  const [isImage, setIsImage] = useState(false);
  const [image, setImage] = useState(null);
  const [post, setPost] = useState("");
  const { _id } = useSelector((state) => state.value.user);
  const token = useSelector((state) => state.value.token);
  
  // Basic media query equivalent
  const [isNonMobileScreens, setIsNonMobileScreens] = useState(window.innerWidth >= 1000);
  useEffect(() => {
    const handleResize = () => setIsNonMobileScreens(window.innerWidth >= 1000);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handlePost = async () => {
    const formData = new FormData();
    formData.append("userId", _id);
    formData.append("description", post);
    if (image) {
      formData.append("picture", image);
      formData.append("picturepath", image.name);
    }

    const response = await axios.post('/posts/',formData,
      {
        headers:{Authorization: `Bearer ${token}`}
      }
    );

    const posts = response.data;

    dispatch(setPosts({posts}));
    setImage(null);
    setPost("");
  };

  return (
    <WidgetWrapper className="transition-colors duration-300">
      <FlexBetween gap="1.5rem">
        <UserImage image={picturePath} />
        <input
          placeholder="What's on your mind..."
          onChange={(e) => setPost(e.target.value)}
          value={post}
          className="w-full bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-gray-100 rounded-full px-6 py-4 outline-none focus:bg-neutral-200 dark:focus:bg-neutral-700 transition-colors duration-300"
        />
      </FlexBetween>
      {isImage && (
        <div className="border border-neutral-300 dark:border-neutral-700 rounded-lg mt-6 p-4 transition-colors duration-300">
          <Dropzone
            acceptedFiles=".jpg,.jpeg,.png"
            multiple={false}
            onDrop={(acceptedFiles) => setImage(acceptedFiles[0])}
          >
            {({ getRootProps, getInputProps }) => (
              <FlexBetween>
                <div
                  {...getRootProps()}
                  className="border-2 border-dashed border-blue-500 p-4 w-full cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors duration-300"
                >
                  <input {...getInputProps()} />
                  {!image ? (
                    <p className="text-neutral-500 dark:text-neutral-400">Add Image Here</p>
                  ) : (
                    <FlexBetween>
                      <p className="text-neutral-700 dark:text-gray-200">{image.name}</p>
                      <Pencil className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
                    </FlexBetween>
                  )}
                </div>
                {image && (
                  <button
                    onClick={() => setImage(null)}
                    className="w-[15%] flex justify-center text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 transition"
                  >
                    <Trash className="w-6 h-6" />
                  </button>
                )}
              </FlexBetween>
            )}
          </Dropzone>
        </div>
      )}

      <hr className="my-6 border-neutral-200 dark:border-neutral-700 transition-colors duration-300" />

      <FlexBetween>
        <FlexBetween gap="0.25rem" onClick={() => setIsImage(!isImage)} className="cursor-pointer hover:text-blue-500 text-neutral-500 dark:text-neutral-400 transition-colors duration-300">
          <ImageIcon className="w-7 h-7" />
          <p className="text-lg">Image</p>
        </FlexBetween>

        {isNonMobileScreens ? (
          <>
            <FlexBetween gap="0.25rem" className="text-neutral-500 dark:text-neutral-400">
              <Film className="w-7 h-7" />
              <p className="text-lg">Clip</p>
            </FlexBetween>

            <FlexBetween gap="0.25rem" className="text-neutral-500 dark:text-neutral-400">
              <Paperclip className="w-7 h-7" />
              <p className="text-lg">Attachment</p>
            </FlexBetween>

            <FlexBetween gap="0.25rem" className="text-neutral-500 dark:text-neutral-400">
              <Mic className="w-7 h-7" />
              <p className="text-lg">Audio</p>
            </FlexBetween>
          </>
        ) : (
          <FlexBetween gap="0.25rem" className="text-neutral-500 dark:text-neutral-400">
            <MoreHorizontal className="w-7 h-7" />
          </FlexBetween>
        )}

        <button
          disabled={!post}
          onClick={handlePost}
          className="disabled:opacity-50 disabled:cursor-not-allowed bg-blue-500 text-white rounded-full px-8 py-2.5 font-medium hover:bg-blue-600 transition"
        >
          POST
        </button>
      </FlexBetween>
    </WidgetWrapper>
  );
};

export default MyPostWidget;
