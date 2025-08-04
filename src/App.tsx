import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Portfolio from './pages/Portfolio';
import Admin from './pages/Admin';
import Verify from './pages/Verify';
import ProjectView from './pages/ProjectView';

interface Content {
  bio: string;
  about: string;
  backgroundVideo: string;
  socialLinks: { name: string; url: string }[];
  projects: { title: string; description: string; technologies: string[] }[];
  experience: { title: string; company: string; description: string }[];
}

function App() {
  const [content, setContent] = useState<Content | null>(null);

  useEffect(() => {
    fetch('/api/get-content')
      .then((response) => response.json())
      .then((data) => setContent(data))
      .catch((error) => console.error('Failed to load content:', error));
  }, []);

  const handleContentUpdate = (newContent: Content) => {
    setContent(newContent);
  };

  if (!content) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Portfolio content={content} />} />
        <Route
          path="/admin"
          element={<Admin content={content} onContentUpdate={handleContentUpdate} />}
        />
        <Route path="/verify-cv" element={<Verify />} />
        <Route path="/project/:id" element={<ProjectView />} />
      </Routes>
    </Router>
  );
}

export default App;
