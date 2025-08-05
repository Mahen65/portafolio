import React from 'react';
import Hero from '../components/Hero';
import About from '../components/About';
import Skills from '../components/Skills';
import Projects from '../components/Projects';
import Experience from '../components/Experience';
import Contact from '../components/Contact';
import Footer from '../components/Footer';

interface Content {
  bio: string;
  subtitle: string;
  about: string;
  backgroundVideo: string;
  socialLinks: { name: string; url: string; }[];
  projects: { title: string; description: string; technologies: string[] }[];
  experience: { title: string; company: string; description: string; }[];
}

interface PortfolioProps {
  content: Content;
}

const Portfolio: React.FC<PortfolioProps> = ({ content }) => {
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
