import React from 'react';

interface AboutProps {
  content: {
    about: string;
  };
}

const About: React.FC<AboutProps> = ({ content }) => {
  return (
    <section id="about" className="container">
      <h2>About Me</h2>
      <p>{content.about}</p>
    </section>
  );
};

export default About;
