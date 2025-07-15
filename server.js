import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

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
    const backupPath = path.join(__dirname, 'public', `content_${timestamp}.json`);
    const livePath = path.join(__dirname, 'public', 'content.json');

    // 1. Create a backup of the current content
    await fs.copyFile(livePath, backupPath);

    // 2. Write the new content to the live file
    await fs.writeFile(livePath, JSON.stringify(req.body, null, 2));

    res.status(200).send({ message: 'Content saved successfully!' });
  } catch (error) {
    console.error('Failed to save content:', error);
    res.status(500).send({ message: 'Failed to save content.' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
