import React from 'react';

const Skills: React.FC = () => {
  return (
    <section id="skills" className="container">
      <h2>Core Competencies</h2>
      <div className="skills-grid">
        <div className="skill-card">
          <h3>Backend Development</h3>
          <p>.NET Core, ASP.NET, C#, FastAPI, Python, Node.js</p>
        </div>
        <div className="skill-card">
          <h3>Frontend Development</h3>
          <p>React, JavaScript, HTML5, CSS3, TypeScript</p>
        </div>
        <div className="skill-card">
          <h3>Databases</h3>
          <p>SQL Server, PostgreSQL, MongoDB, Redis</p>
        </div>
        <div className="skill-card">
          <h3>Cloud & DevOps</h3>
          <p>Azure, Docker, Kubernetes, CI/CD, Git</p>
        </div>
      </div>
    </section>
  );
};

export default Skills;
