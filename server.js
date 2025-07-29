import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import QRCode from 'qrcode';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3001;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));
app.get('/api/videos', async (req, res) => {
     try {
        const videosPath = path.join(__dirname, 'public', 'videos');
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
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(__dirname, 'data-backups', `content_${timestamp}.json`);
    const livePath = path.join(__dirname, 'public', 'content.json');

    // 1. Create a backup of the current content
    await fs.copyFile(livePath, backupPath);

    // 2. Write the new content to the live file
    await fs.writeFile(livePath, JSON.stringify(req.body, null, 2));

    // 3. Copy the updated content to the dist directory
    const distPath = path.join(__dirname, 'dist', 'content.json');
    await fs.copyFile(livePath, distPath);

    res.status(200).send({ message: 'Content saved successfully!' });
  } catch (error) {
    console.error('Failed to save content:', error);
    res.status(500).send({ message: 'Failed to save content.' });
  }
});

app.get('/api/download-cv', async (req, res) => {
  try {
    const contentPath = path.join(__dirname, 'public', 'content.json');
    const content = JSON.parse(await fs.readFile(contentPath, 'utf-8'));

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
    const qrCodeDataUrl = await QRCode.toDataURL(`http://localhost:3001/verify-cv?id=12345`);
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

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

export default app;
