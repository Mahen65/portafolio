import React from 'react';

interface SocialLink {
  name: string;
  url: string;
}

interface FooterProps {
  content: {
    socialLinks: SocialLink[];
  };
}

const Footer: React.FC<FooterProps> = ({ content }) => {
  return (
    <footer>
      <div className="container">
        <p>&copy; 2025 Asiri Somarathne. All Rights Reserved.</p>
        <div className="social-links">
          {content.socialLinks.map((link, index) => (
            <a key={index} href={link.url} target="_blank" rel="noopener noreferrer">
              {link.name}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
