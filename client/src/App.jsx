import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import HomePage from "./scenes/homePage";
import LoginPage from "./scenes/loginPage";
import ProfilePage from "./scenes/profilePage";
import { useSelector } from "react-redux";

function App() {
  const isAuth = Boolean(useSelector((state) => state.value.token));
  const mode = useSelector((state) => state.value.mode);

  return (
    <div className={`app min-h-screen text-[#333333] dark:text-gray-100 bg-[#f6f6f6] dark:bg-neutral-900 transition-colors duration-300 ${mode === "dark" ? "dark" : ""}`}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={!isAuth?<LoginPage /> : <Navigate to="/home"/>} />
          {/* <Route path="/" element={<HomePage/>} /> */}
          <Route path="/home" element={isAuth?<HomePage />:<Navigate to="/" />} />
          <Route path="/profile/:userId" element={isAuth?<ProfilePage />:<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
