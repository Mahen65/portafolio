import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Footer from '../components/Footer';

interface Project {
  title: string;
  description: string;
  technologies: string[];
}

interface SocialLink {
  name: string;
  url: string;
}

interface Content {
  projects: Project[];
  socialLinks: SocialLink[];
}

const ProjectView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [content, setContent] = useState<Content | null>(null);

  useEffect(() => {
    if (id) {
      fetch('/content.json')
        .then(response => response.json())
        .then(data => {
          setContent(data);
         
          const projectData = data.projects[parseInt(id, 10)];
          setProject(projectData);
        });
     
    }
  
  }, [id]);

  if (!project || !content) {
    return <div>Loading...</div>;
  }
  // console.log('Id:', id);
  // console.log('Project technologies:', project.technologies);
  // console.log('content:', content);
  return (
    <>
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-4">{project.title}</h1>
        <p className="text-lg mb-4">{project.description}</p>
        <div className="flex flex-wrap">
         
          {project.technologies && project.technologies.map((tech, index) => {
            console.log('Rendering technology:', tech);
            return (
            <span
              key={index}
              style={{
                backgroundColor: '#dbeafe',
                color: '#1e40af',
                fontSize: '0.75rem',
                fontWeight: '600',
                marginRight: '0.5rem',
                marginBottom: '0.5rem',
                padding: '0.25rem 0.625rem',
                borderRadius: '9999px',
              }}
            >
              {tech}
            </span>
            );
          })}
        </div>
      </main>
      <Footer content={content} />
    </>
  );
};

export default ProjectView;
