import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import HomePage from "./scenes/homePage";
import LoginPage from "./scenes/loginPage";
import ProfilePage from "./scenes/profilePage";
import ChatPage from "./scenes/chatPage";
import { useSelector } from "react-redux";

function App() {
  const isAuth = Boolean(useSelector((state) => state.value.token));
  const mode = useSelector((state) => state.value.mode);

  // Tailwind's dark: variant keys off `.dark` on <html>
  useEffect(() => {
    document.documentElement.classList.toggle("dark", mode === "dark");
  }, [mode]);

  return (
    <div className="app min-h-screen text-[#333333] dark:text-gray-100 bg-[#f6f6f6] dark:bg-neutral-900 transition-colors duration-300">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={!isAuth?<LoginPage /> : <Navigate to="/home"/>} />
          {/* <Route path="/" element={<HomePage/>} /> */}
          <Route path="/home" element={isAuth?<HomePage />:<Navigate to="/" />} />
          <Route path="/profile/:userId" element={isAuth?<ProfilePage />:<Navigate to="/" />} />
          <Route path="/chat" element={isAuth?<ChatPage />:<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
