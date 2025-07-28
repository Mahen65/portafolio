import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const Verify: React.FC = () => {
  const [content, setContent] = useState<any>(null);
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get('id');

    // In a real application, you would use this ID to fetch verification data
    // from a secure backend endpoint. For this example, we'll just fetch the
    // main content to display.
    
    const fetchContent = async () => {
      try {
        const response = await fetch('/content.json');
        const data = await response.json();
        setContent(data);
      } catch (error) {
        console.error('Failed to fetch content:', error);
      }
    };

    fetchContent();
  }, [location]);

  if (!content) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container">
      <h1>CV Verification</h1>
      <p>This page confirms the authenticity of the CV.</p>
      <h2>{content.name}</h2>
      <p>{content.bio}</p>
      <h3>Experience</h3>
      {content.experience.map((exp: any, index: number) => (
        <div key={index}>
          <h4>{exp.title} at {exp.company}</h4>
          <p>{exp.description}</p>
        </div>
      ))}
      <h3>Projects</h3>
      {content.projects.map((project: any, index: number) => (
        <div key={index}>
          <h4>{project.title}</h4>
          <p>{project.description}</p>
        </div>
      ))}
    </div>
  );
};

export default Verify;
