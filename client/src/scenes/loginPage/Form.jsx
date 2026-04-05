import { useState } from "react";
import { Edit } from "lucide-react";
import { message } from "antd";
import axios from "axios";
import { Formik } from "formik";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setLogin } from "state";
import Dropzone from "react-dropzone";
import FlexBetween from "components/FlexBetween";

const registerSchema = yup.object().shape({
  firstName: yup.string().required("required"),
  lastName: yup.string().required("required"),
  email: yup.string().email("invalid email").required("required"),
  password: yup.string().required("required"),
  location: yup.string().required("required"),
  occupation: yup.string().required("required"),
  picture: yup.mixed().required("required"),
});

const loginSchema = yup.object().shape({
  email: yup.string().email("invalid email").required("required"),
  password: yup.string().required("required"),
});

const initialValuesRegister = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  location: "",
  occupation: "",
  picture: "",
};

const initialValuesLogin = {
  email: "",
  password: "",
};

const Form = () => {
  const [pageType, setPageType] = useState("login");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isLogin = pageType === "login";
  const isRegister = pageType === "register";

  const register = async (values, onSubmitProps) => {
    const formData = new FormData();
    for (let value in values) {
      if (value !== "picture") {
        formData.append(value, values[value]);
      }
    }
    formData.append("picture", values.picture);
    formData.append("picturePath", values.picture.name);

    try {
      await axios.post("/auth/register", formData);
      onSubmitProps.resetForm();
      setPageType("login");
    } catch (err) {
      console.log(err);
      message.error("Error creating account");
    }
  };

  const login = async (values, onSubmitProps) => {
    try {
      const response = await axios.post("/auth/login", values);

      try {
        const friends = await axios.get(
          `/users/${response.data.user._id}/friends`,
          {
            headers: { Authorization: `Bearer ${response.data.token}` },
          }
        );

        dispatch(
          setLogin({
            user: { ...response.data.user, friends: friends.data },
            token: response.data.token,
          })
        );

        onSubmitProps.resetForm();
        navigate("/home");
      } catch (err) {
        console.log(err);
      }
    } catch (err) {
      message.error("Incorrect Username or Password");
      console.log(err);
    }
  };

  const handleFormSubmit = async (values, onSubmitProps) => {
    if (isLogin) await login(values, onSubmitProps);
    if (isRegister) await register(values, onSubmitProps);
  };

  const inputClass = (touched, error) => 
    `w-full p-4 border rounded-md outline-none bg-transparent text-neutral-800 dark:text-gray-100 transition-colors duration-300 ${
      touched && error
        ? "border-red-500"
        : "border-neutral-300 dark:border-neutral-600 focus:border-blue-500 dark:focus:border-blue-500"
    }`;

  return (
    <Formik
      onSubmit={handleFormSubmit}
      initialValues={isLogin ? initialValuesLogin : initialValuesRegister}
      validationSchema={isLogin ? loginSchema : registerSchema}
    >
      {({
        values,
        errors,
        touched,
        handleBlur,
        handleChange,
        handleSubmit,
        setFieldValue,
        resetForm,
      }) => (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
            {isRegister && (
              <>
                <div className="sm:col-span-2 flex flex-col gap-1">
                  <input
                    placeholder="First Name"
                    type="text"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.firstName}
                    name="firstName"
                    className={inputClass(touched.firstName, errors.firstName)}
                  />
                  {touched.firstName && errors.firstName && (
                    <span className="text-red-500 text-xs ml-1">{errors.firstName}</span>
                  )}
                </div>

                <div className="sm:col-span-2 flex flex-col gap-1">
                  <input
                    placeholder="Last Name"
                    type="text"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.lastName}
                    name="lastName"
                    className={inputClass(touched.lastName, errors.lastName)}
                  />
                  {touched.lastName && errors.lastName && (
                    <span className="text-red-500 text-xs ml-1">{errors.lastName}</span>
                  )}
                </div>

                <div className="col-span-1 sm:col-span-4 flex flex-col gap-1">
                  <input
                    placeholder="Location"
                    type="text"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.location}
                    name="location"
                    className={inputClass(touched.location, errors.location)}
                  />
                  {touched.location && errors.location && (
                    <span className="text-red-500 text-xs ml-1">{errors.location}</span>
                  )}
                </div>

                <div className="col-span-1 sm:col-span-4 flex flex-col gap-1">
                  <input
                    placeholder="Occupation"
                    type="text"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.occupation}
                    name="occupation"
                    className={inputClass(touched.occupation, errors.occupation)}
                  />
                  {touched.occupation && errors.occupation && (
                    <span className="text-red-500 text-xs ml-1">{errors.occupation}</span>
                  )}
                </div>

                <div className="col-span-1 sm:col-span-4 border border-neutral-300 dark:border-neutral-600 rounded-md p-4 transition-colors duration-300">
                  <Dropzone
                    acceptedFiles=".jpg,.jpeg,.png"
                    multiple={false}
                    onDrop={(acceptedFiles) =>
                      setFieldValue("picture", acceptedFiles[0])
                    }
                  >
                    {({ getRootProps, getInputProps }) => (
                      <div
                        {...getRootProps()}
                        className="border-2 border-dashed border-blue-500 p-4 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors duration-300"
                      >
                        <input {...getInputProps()} />
                        {!values.picture ? (
                          <p className="text-neutral-500 dark:text-neutral-400">Add Picture Here</p>
                        ) : (
                          <FlexBetween>
                            <p className="text-neutral-700 dark:text-gray-200">{values.picture.name}</p>
                            <Edit className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
                          </FlexBetween>
                        )}
                      </div>
                    )}
                  </Dropzone>
                  {touched.picture && errors.picture && (
                    <span className="text-red-500 text-xs ml-1 mt-1 block">{errors.picture}</span>
                  )}
                </div>
              </>
            )}

            <div className="col-span-1 sm:col-span-4 flex flex-col gap-1">
              <input
                placeholder="Email"
                type="email"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.email}
                name="email"
                className={inputClass(touched.email, errors.email)}
              />
              {touched.email && errors.email && (
                <span className="text-red-500 text-xs ml-1">{errors.email}</span>
              )}
            </div>

            <div className="col-span-1 sm:col-span-4 flex flex-col gap-1">
              <input
                placeholder="Password"
                type="password"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.password}
                name="password"
                className={inputClass(touched.password, errors.password)}
              />
              {touched.password && errors.password && (
                <span className="text-red-500 text-xs ml-1">{errors.password}</span>
              )}
            </div>
          </div>

          <div className="flex flex-col items-center mt-6">
            <button
              type="submit"
              className="w-full bg-blue-500 text-white font-medium py-4 rounded-md hover:bg-blue-600 transition"
            >
              {isLogin ? "LOGIN" : "REGISTER"}
            </button>
            <p
              onClick={() => {
                setPageType(isLogin ? "register" : "login");
                resetForm();
              }}
              className="mt-6 underline text-blue-500 hover:text-blue-400 cursor-pointer transition select-none"
            >
              {isLogin
                ? "Don't have an account? Sign Up here."
                : "Already have an account? Login here."}
            </p>
          </div>
        </form>
      )}
    </Formik>
  );
};

export default Form;
