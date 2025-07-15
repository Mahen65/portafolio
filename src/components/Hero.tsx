import React from 'react';

interface HeroProps {
  content: {
    bio: string;
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
        <p className="subtitle">Tech Lead | Full-Stack Developer | .NET & Python Specialist</p>
        <p className="bio">{content.bio}</p>
        <a href="#about" className="cta-button">Learn More</a>
      </div>
    </header>
  );
};

export default Hero;
