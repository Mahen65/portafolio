import React, { useState, useEffect } from 'react';
import Hero from '../components/Hero';
import About from '../components/About';
import Skills from '../components/Skills';
import Projects from '../components/Projects';
import Experience from '../components/Experience';
import Contact from '../components/Contact';
import Footer from '../components/Footer';

interface Content {
  bio: string;
  about: string;
  backgroundVideo: string;
  socialLinks: { name: string; url: string; }[];
  projects: { title: string; description: string; }[];
  experience: { title: string; company: string; description: string; }[];
}

const Portfolio: React.FC = () => {
  const [content, setContent] = useState<Content | null>(null);

  useEffect(() => {
    fetch('/content.json')
      .then(response => response.json())
      .then(data => setContent(data))
      .catch(error => console.error("Failed to load content:", error));
  }, []);

  if (!content) {
    return <div>Loading...</div>;
  }

  return (
    <>
     <Hero content={content} backgroundVideo={content.backgroundVideo} />
      <main>
        <About content={content} />
        <Skills />
        <Projects content={content} />
        <Experience content={content} />
        <Contact content={content} />
      </main>
      <Footer content={content} />
    </>
  );
};

export default Portfolio;
