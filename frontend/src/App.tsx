import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout/AppLayout';

const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex items-center justify-center h-96">
    <h1 className="text-2xl font-semibold text-slate-800">{title}</h1>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<PlaceholderPage title="Home Feed" />} />
          <Route path="discover" element={<PlaceholderPage title="Discover & Search" />} />
          <Route path="jobs" element={<PlaceholderPage title="Job Board" />} />
          <Route path="portfolio" element={<PlaceholderPage title="Portfolio Grid" />} />
          <Route path="professionals" element={<PlaceholderPage title="Professional Network" />} />
          <Route path="profile" element={<PlaceholderPage title="User Profile" />} />
          <Route path="settings" element={<PlaceholderPage title="Settings" />} />
          <Route path="create" element={<PlaceholderPage title="Create Post" />} />
          <Route path="*" element={<PlaceholderPage title="404 - Not Found" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;