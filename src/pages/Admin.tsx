import React, { useState, useEffect } from 'react';

interface Content {
  bio: string;
  about: string;
  backgroundVideo: string;
  socialLinks: { name: string; url: string }[];
  projects: { title: string; description: string; technologies: string[] }[];
  experience: { title: string; company: string; description: string }[];
}

interface AdminProps {
  content: Content;
  onContentUpdate: (newContent: Content) => void;
}

const Admin: React.FC<AdminProps> = ({ content, onContentUpdate }) => {
  const [videos, setVideos] = useState<string[]>([]);
  const [localContent, setLocalContent] = useState<Content>(content);

  useEffect(() => {
    // Fetch video list
    fetch('/api/videos')
      .then((response) => response.json())
      .then((data) => setVideos(data));
  }, []);

  useEffect(() => {
    setLocalContent(content);
  }, [content]);

  const handleProjectChange = (index: number, field: string, value: string | string[]) => {
    const newProjects = [...localContent.projects];
    newProjects[index][field] = value;
    setLocalContent({ ...localContent, projects: newProjects });
  };

  const handleTechnologyChange = (projectIndex: number, techIndex: number, value: string) => {
    const newProjects = [...localContent.projects];
    newProjects[projectIndex].technologies[techIndex] = value;
    setLocalContent({ ...localContent, projects: newProjects });
  };

  const addTechnology = (projectIndex: number) => {
    const newProjects = [...localContent.projects];
    newProjects[projectIndex].technologies.push('');
    setLocalContent({ ...localContent, projects: newProjects });
  };

  const removeTechnology = (projectIndex: number, techIndex: number) => {
    const newProjects = [...localContent.projects];
    newProjects[projectIndex].technologies.splice(techIndex, 1);
    setLocalContent({ ...localContent, projects: newProjects });
  };

  const addProject = () => {
    setLocalContent({
      ...localContent,
      projects: [...localContent.projects, { title: '', description: '', technologies: [] }],
    });
  };

  const removeProject = (index: number) => {
    const newProjects = [...localContent.projects];
    newProjects.splice(index, 1);
    setLocalContent({ ...localContent, projects: newProjects });
  };

  const handleSocialLinkChange = (index: number, field: string, value: string) => {
    const newSocialLinks = [...localContent.socialLinks];
    newSocialLinks[index][field] = value;
    setLocalContent({ ...localContent, socialLinks: newSocialLinks });
  };

  const addSocialLink = () => {
    setLocalContent({
      ...localContent,
      socialLinks: [...localContent.socialLinks, { name: '', url: '' }],
    });
  };

  const removeSocialLink = (index: number) => {
    const newSocialLinks = [...localContent.socialLinks];
    newSocialLinks.splice(index, 1);
    setLocalContent({ ...localContent, socialLinks: newSocialLinks });
  };

  const handleSave = async () => {
    try {
      const response = await fetch('/api/save-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(localContent),
      });

      if (response.ok) {
        onContentUpdate(localContent);
        alert('Content saved successfully!');
      } else {
        alert('Failed to save content.');
      }
    } catch (error) {
      console.error('Failed to save content:', error);
      alert('Failed to save content.');
    }
  };

  return (
    <div className="admin-container">
      <header className="admin-header">
        <h1>Portfolio Content Editor</h1>
        <p>Update the content of your portfolio website.</p>
      </header>
      <main className="admin-main">
        <div className="form-group">
          <label>Hero Bio</label>
          <textarea
            rows={5}
            value={localContent.bio || ''}
            onChange={(e) => setLocalContent({ ...localContent, bio: e.target.value })}
            style={{ whiteSpace: 'pre-wrap' }}
          />
        </div>
        <div className="form-group">
          <label>About Me</label>
          <textarea
            rows={7}
            value={localContent.about || ''}
            onChange={(e) => setLocalContent({ ...localContent, about: e.target.value })}
            style={{ whiteSpace: 'pre-wrap' }}
          />
        </div>
        <fieldset>
          <legend>Background Video</legend>
          <div className="form-group">
            <label>Select a background video:</label>
            <select
              value={localContent.backgroundVideo || ''}
              onChange={(e) =>
                setLocalContent({ ...localContent, backgroundVideo: e.target.value })
              }
            >
              {videos.map(video => (
                <option key={video} value={video}>{video}</option>
              ))}
            </select>
          </div>
        </fieldset>
        <fieldset>
          <legend>Social Links</legend>
          {localContent.socialLinks?.map((link: any, index: number) => (
            <div key={index} className="project-group">
              <hr />
              <h4>Link {index + 1}</h4>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={link.name}
                  onChange={(e) => handleSocialLinkChange(index, 'name', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>URL</label>
                <input
                  type="text"
                  value={link.url}
                  onChange={(e) => handleSocialLinkChange(index, 'url', e.target.value)}
                />
              </div>
              <button type="button" className="remove-project" onClick={() => removeSocialLink(index)}>
                Remove Link
              </button>
            </div>
          ))}
          <button type="button" id="add-social-link" className="cta-button" onClick={addSocialLink}>
            Add Link
          </button>
        </fieldset>
        <fieldset>
          <legend>Projects</legend>
          {localContent.projects?.map((project: any, index: number) => (
            <div key={index} className="project-group">
              <hr />
              <h4>Project {index + 1}</h4>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={project.title}
                  onChange={(e) => handleProjectChange(index, 'title', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  rows={3}
                  value={project.description}
                  onChange={(e) => handleProjectChange(index, 'description', e.target.value)}
                  style={{ whiteSpace: 'pre-wrap' }}
                />
              </div>
              <div className="form-group">
                <label>Technologies</label>
                {project.technologies.map((tech: string, techIndex: number) => (
                  <div key={techIndex} className="technology-group">
                    <input
                      type="text"
                      value={tech}
                      onChange={(e) => handleTechnologyChange(index, techIndex, e.target.value)}
                    />
                    <button type="button" onClick={() => removeTechnology(index, techIndex)}>
                      Remove
                    </button>
                  </div>
                ))}
                <button type="button" className="cta-button" onClick={() => addTechnology(index)}>
                  Add Technology
                </button>
              </div>
              <button type="button" className="remove-project" onClick={() => removeProject(index)}>
                Remove Project
              </button>
            </div>
          ))}
          <button type="button" id="add-project" className="cta-button" onClick={addProject}>
            Add Project
          </button>
        </fieldset>
        <button type="button" className="cta-button" onClick={handleSave}>
          Save
        </button>
      </main>
    </div>
  );
};

export default Admin;
