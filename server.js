import 'dotenv/config';
import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import QRCode from 'qrcode';
import { sql, db } from '@vercel/postgres';

const app = express();

app.use(express.json());

app.get('/api/videos', async (req, res) => {
     try {
        const videosPath = path.join(process.cwd(), 'public', 'videos');
        const files = await fs.readdir(videosPath);
        const videoFiles = files.filter(file => file.endsWith('.mp4'));
        res.json(videoFiles);
     } 
     catch (error) 
     {
       console.error('Failed to get videos:', error);
      res.status(500).send({ message: 'Failed to get videos.' });
     }
   });

app.post('/api/save-content', async (req, res) => {
  const { bio, about, backgroundVideo, socialLinks, experience, projects, subtitle } = req.body;
  const client = await db.connect();

  try {
    await client.query('BEGIN');

    // Using a single transaction to update all content
    // About section
    if (bio !== undefined && about !== undefined && backgroundVideo !== undefined && subtitle !== undefined) {
      await client.query(
        'UPDATE about SET bio = $1, about_text = $2, background_video = $3, subtitle = $4',
        [bio, about, backgroundVideo, subtitle]
      );
    }

    // Social Links
    if (socialLinks) {
      await client.query('DELETE FROM social_links');
      await Promise.all(socialLinks.map(link => {
        return client.query('INSERT INTO social_links (name, url) VALUES ($1, $2)', [link.name, link.url]);
      }));
    }

    // Experience
    if (experience) {
      await client.query('DELETE FROM experience');
      await Promise.all(experience.map(exp => {
        return client.query('INSERT INTO experience (title, company, description) VALUES ($1, $2, $3)', [exp.title, exp.company, exp.description]);
      }));
    }

    // Projects
    if (projects) {
      await client.query('DELETE FROM project_technologies');
      await client.query('DELETE FROM projects');
      for (const project of projects) {
        const projectResult = await client.query(
          'INSERT INTO projects (title, description) VALUES ($1, $2) RETURNING id',
          [project.title, project.description]
        );
        const projectId = projectResult.rows[0].id;

        if (project.technologies && project.technologies.length > 0) {
          for (const techName of project.technologies) {
            let techResult = await client.query('SELECT id FROM technologies WHERE name = $1', [techName]);
            let techId;
            if (techResult.rows.length > 0) {
              techId = techResult.rows[0].id;
            } else {
              const newTechResult = await client.query('INSERT INTO technologies (name) VALUES ($1) RETURNING id', [techName]);
              techId = newTechResult.rows[0].id;
            }
            await client.query('INSERT INTO project_technologies (project_id, technology_id) VALUES ($1, $2)', [projectId, techId]);
          }
        }
      }
    }

    await client.query('COMMIT');
    res.status(200).json({ message: 'Content saved successfully.' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Failed to save content:', error);
    res.status(500).json({ message: 'Failed to save content.', error: error.message });
  } finally {
    client.release();
  }
});

app.get('/api/get-content', async (req, res) => {
    try {
        const aboutPromise = sql`SELECT bio, about_text, background_video, subtitle FROM about LIMIT 1;`;
        const socialLinksPromise = sql`SELECT name, url FROM social_links;`;
        const experiencePromise = sql`SELECT title, company, description FROM experience;`;
        const projectsPromise = sql`
            SELECT p.id, p.title, p.description, COALESCE(json_agg(t.name) FILTER (WHERE t.name IS NOT NULL), '[]') as technologies
            FROM projects p
            LEFT JOIN project_technologies pt ON p.id = pt.project_id
            LEFT JOIN technologies t ON pt.technology_id = t.id
            GROUP BY p.id, p.title, p.description;
        `;

        const [aboutResult, socialLinksResult, experienceResult, projectsResult] = await Promise.all([
            aboutPromise,
            socialLinksPromise,
            experiencePromise,
            projectsPromise
        ]);

        const aboutData = aboutResult.rows[0];

        const content = {
            bio: aboutData.bio,
            about: aboutData.about_text,
            subtitle: aboutData.subtitle,
            backgroundVideo: aboutData.background_video,
            socialLinks: socialLinksResult.rows,
            experience: experienceResult.rows,
            projects: projectsResult.rows.map(p => ({...p, technologies: p.technologies})),
        };
        
        res.status(200).json(content);
    } catch (error) {
        console.error('Failed to get content:', error);
        res.status(500).send({ message: 'Failed to get content.' });
    }
});

app.get('/api/download-cv', async (req, res) => {
  try {
    const aboutPromise = sql`SELECT bio FROM about LIMIT 1;`;
    const experiencePromise = sql`SELECT title, company, description FROM experience;`;
    const projectsPromise = sql`SELECT title, description FROM projects;`;

    const [aboutResult, experienceResult, projectsResult] = await Promise.all([
        aboutPromise,
        experiencePromise,
        projectsPromise
    ]);

    const content = {
        bio: aboutResult.rows[0].bio,
        experience: experienceResult.rows,
        projects: projectsResult.rows,
    };

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([612, 792]);

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Add header
    page.drawRectangle({
      x: 0,
      y: 700,
      width: 612,
      height: 92,
      color: rgb(0.2, 0.4, 0.6),
    });
    page.drawText('MODERN', {
      x: 50,
      y: 750,
      font: boldFont,
      size: 24,
      color: rgb(1, 1, 1),
    });
    page.drawText('CV TEMPLATE', {
      x: 50,
      y: 720,
      font: boldFont,
      size: 24,
      color: rgb(1, 1, 1),
    });

    // Add footer
    page.drawRectangle({
      x: 0,
      y: 0,
      width: 612,
      height: 50,
      color: rgb(0.2, 0.4, 0.6),
    });

    // Left column
    let y = 650;
    page.drawText('PERSONAL', { x: 50, y, font: boldFont, size: 18 });
    y -= 20;
    page.drawText(content.bio, { x: 50, y, font, size: 10, maxWidth: 250, lineHeight: 12 });
    
    y -= 100;
    page.drawText('EXPERIENCE', { x: 50, y, font: boldFont, size: 18 });
    y -= 20;
    content.experience.forEach(exp => {
      page.drawText(`${exp.title} at ${exp.company}`, { x: 50, y, font: boldFont, size: 12 });
      y -= 15;
      page.drawText(exp.description, { x: 50, y, font, size: 10, maxWidth: 250, lineHeight: 12 });
      y -= 60;
    });

    // Right column
    y = 650;
    page.drawText('SKILLS', { x: 350, y, font: boldFont, size: 18 });
    y -= 20;
    // Add skills here from content.json if available

    y -= 100;
    page.drawText('PROJECTS', { x: 350, y, font: boldFont, size: 18 });
    y -= 20;
    content.projects.forEach(project => {
      page.drawText(project.title, { x: 350, y, font: boldFont, size: 12 });
      y -= 15;
      page.drawText(project.description, { x: 350, y, font, size: 10, maxWidth: 200, lineHeight: 12 });
      y -= 60;
    });

    // QR Code
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers.host;
    const qrCodeDataUrl = await QRCode.toDataURL(`${protocol}://${host}/verify-cv?id=12345`);
    const qrCodeImage = await pdfDoc.embedPng(qrCodeDataUrl);
    page.drawImage(qrCodeImage, {
      x: 450,
      y: 60,
      width: 100,
      height: 100,
    });
    page.drawText('Verify this CV', { x: 465, y: 50, font, size: 10 });


    const pdfBytes = await pdfDoc.save();

    res.setHeader('Content-Disposition', 'attachment; filename=cv.pdf');
    res.setHeader('Content-Type', 'application/pdf');
    res.send(Buffer.from(pdfBytes));
  } catch (error) {
    console.error('Failed to generate PDF:', error);
    res.status(500).send({ message: 'Failed to generate PDF.' });
  }
});


export default app;
