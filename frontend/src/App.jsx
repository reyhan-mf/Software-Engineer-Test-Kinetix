import { Routes, Route } from 'react-router-dom';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';

// Placeholder untuk halaman yang belum dibuat
const PostDetailPage = () => <div>Post Detail — Coming Soon</div>;
const CreatePostPage = () => <div>Create Post — Coming Soon</div>;
const EditPostPage = () => <div>Edit Post — Coming Soon</div>;
const ProfilePage = () => <div>Profile — Coming Soon</div>;

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/posts/:id" element={<PostDetailPage />} />
      <Route path="/create" element={<CreatePostPage />} />
      <Route path="/edit/:id" element={<EditPostPage />} />
      <Route path="/profile" element={<ProfilePage />} />
    </Routes>
  );
}

export default App;
