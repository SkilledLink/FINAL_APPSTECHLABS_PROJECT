import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MessagesPage } from './features/messages';
import { ProfilePage } from './features/profile';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect root to profile for testing */}
        <Route path="/" element={<Navigate to="/profile" replace />} />

        {/* Profile Routes */}
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/:id" element={<ProfilePage />} />

        {/* Messages Route */}
        <Route path="/messages" element={<MessagesPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
