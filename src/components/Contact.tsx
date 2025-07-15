import React from 'react';

interface SocialLink {
  name: string;
  url: string;
}

interface ContactProps {
  content: {
    socialLinks: SocialLink[];
  };
}

const Contact: React.FC<ContactProps> = ({ content }) => {
  return (
    <section id="contact" className="container">
      <h2>Contact Me</h2>
      <p>I'm always open to discussing new projects, creative ideas, or opportunities to be part of an ambitious vision. Feel free to get in touch.</p>
      <div className="social-links">
        {content.socialLinks.map((link, index) => (
          <a key={index} href={link.url} target="_blank" rel="noopener noreferrer" className="cta-button">
            {link.name}
          </a>
        ))}
      </div>
    </section>
  );
};

export default Contact;
