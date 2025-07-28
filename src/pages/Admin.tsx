import React, { useState, useEffect } from 'react';

const Admin: React.FC = () => {
  const [content, setContent] = useState<any>({});
  const [videos, setVideos] = useState<string[]>([]);

  useEffect(() => {
    // Fetch existing content
    fetch('/content.json')
      .then(response => response.json())
      .then(data => setContent(data));

    // Fetch video list
    fetch('/api/videos')
      .then(response => response.json())
      .then(data => setVideos(data));
  }, []);

  const handleProjectChange = (index: number, field: string, value: string) => {
    const newProjects = [...content.projects];
    newProjects[index][field] = value;
    setContent({ ...content, projects: newProjects });
  };

  const addProject = () => {
    setContent({
      ...content,
      projects: [...content.projects, { title: '', description: '' }],
    });
  };

  const removeProject = (index: number) => {
    const newProjects = [...content.projects];
    newProjects.splice(index, 1);
    setContent({ ...content, projects: newProjects });
  };

  const handleSocialLinkChange = (index: number, field: string, value: string) => {
    const newSocialLinks = [...content.socialLinks];
    newSocialLinks[index][field] = value;
    setContent({ ...content, socialLinks: newSocialLinks });
  };

  const addSocialLink = () => {
    setContent({
      ...content,
      socialLinks: [...content.socialLinks, { name: '', url: '' }],
    });
  };

  const removeSocialLink = (index: number) => {
    const newSocialLinks = [...content.socialLinks];
    newSocialLinks.splice(index, 1);
    setContent({ ...content, socialLinks: newSocialLinks });
  };

  const handleSave = async () => {
    try {
      const response = await fetch('/api/save-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(content),
      });

      if (response.ok) {
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
            value={content.bio || ''}
            onChange={(e) => setContent({ ...content, bio: e.target.value })}
            style={{ whiteSpace: 'pre-wrap' }}
          />
        </div>
        <div className="form-group">
          <label>About Me</label>
          <textarea
            rows={7}
            value={content.about || ''}
            onChange={(e) => setContent({ ...content, about: e.target.value })}
            style={{ whiteSpace: 'pre-wrap' }}
          />
        </div>
        <fieldset>
          <legend>Background Video</legend>
          <div className="form-group">
            <label>Select a background video:</label>
            <select
              value={content.backgroundVideo || ''}
              onChange={(e) => setContent({ ...content, backgroundVideo: e.target.value })}
            >
              {videos.map(video => (
                <option key={video} value={video}>{video}</option>
              ))}
            </select>
          </div>
        </fieldset>
        <fieldset>
          <legend>Social Links</legend>
          {content.socialLinks?.map((link: any, index: number) => (
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
          {content.projects?.map((project: any, index: number) => (
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
          Save and Download Content
        </button>
      </main>
    </div>
  );
};

export default Admin;
