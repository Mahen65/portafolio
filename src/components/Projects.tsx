import React from 'react';

interface Project {
  title: string;
  description: string;
}

interface ProjectsProps {
  content: {
    projects: Project[];
  };
}

const Projects: React.FC<ProjectsProps> = ({ content }) => {
  return (
    <section id="projects" className="container">
      <h2>Featured Projects</h2>
      <div className="projects-grid">
        {content.projects.map((project, index) => (
          <div key={index} className="project-card">
            <h3>{project.title}</h3>
            <p>{project.description}</p>
            <a href="#">View Project</a>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Projects;
