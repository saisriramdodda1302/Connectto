import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './lib/auth';
import Shell from './components/Shell';
import AuthForm from './pages/AuthForm';
import Feed from './pages/Feed';
import Profile from './pages/Profile';
import Search from './pages/Search';
import Messages from './pages/Messages';

function Private({ children }) {
  const { user } = useAuth();
  if (user === undefined) return null;
  return user ? children : <Navigate to="/login" replace />;
}

function Guest({ children }) {
  const { user } = useAuth();
  if (user === undefined) return null;
  return user ? <Navigate to="/" replace /> : children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Guest><AuthForm mode="login" /></Guest>} />
      <Route path="/register" element={<Guest><AuthForm mode="register" /></Guest>} />
      <Route element={<Private><Shell /></Private>}>
        <Route index element={<Feed />} />
        <Route path="people/:id" element={<Profile />} />
        <Route path="search" element={<Search />} />
        <Route path="messages" element={<Messages />} />
        <Route path="messages/:id" element={<Messages />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
