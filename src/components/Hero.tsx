import React, { memo } from 'react';

interface HeroProps {
  content: {
    bio: string;
    subtitle: string;
  };
  backgroundVideo: string;
}

const Hero: React.FC<HeroProps> = ({ content, backgroundVideo }) => {
  return (
    <header className="hero">
      <video autoPlay loop muted playsInline className="hero-bg">
        <source src={`/videos/${backgroundVideo}`} type="video/mp4" />
      </video>
      <div className="container">
        <h1>Asiri Somarathne</h1>
        <p className="subtitle">{content.subtitle}</p>
        <p className="bio">{content.bio}</p>
        <a href="#about" className="cta-button">Learn More</a>
        <a href="/api/download-cv" className="cta-button" download>Download CV</a>
      </div>
    </header>
  );
};

export default memo(Hero);
