import React from 'react';

interface ExperienceItem {
  title: string;
  company: string;
  description: string;
}

interface ExperienceProps {
  content: {
    experience: ExperienceItem[];
  };
}

const Experience: React.FC<ExperienceProps> = ({ content }) => {
  return (
    <section id="experience" className="container">
      <h2>Work Experience</h2>
      {content.experience.map((item, index) => (
        <div key={index} className="experience-item">
          <h3>{item.title}</h3>
          <p className="company">{item.company}</p>
          <p>{item.description}</p>
        </div>
      ))}
    </section>
  );
};

export default Experience;
