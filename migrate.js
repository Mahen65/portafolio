import 'dotenv/config';
import { sql } from '@vercel/postgres';
import { promises as fs } from 'fs';
import path from 'path';

async function main() {
  const filePath = path.join(process.cwd(), 'public', 'content.json');
  const jsonData = await fs.readFile(filePath, 'utf8');
  const data = JSON.parse(jsonData);

  console.log('Creating tables...');

  await sql`
    CREATE TABLE IF NOT EXISTS about (
      id SERIAL PRIMARY KEY,
      bio TEXT,
      about_text TEXT,
      background_video VARCHAR(255)
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS social_links (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255),
      url VARCHAR(255)
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS experience (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255),
      company VARCHAR(255),
      description TEXT
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS projects (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255),
      description TEXT
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS technologies (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) UNIQUE
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS project_technologies (
      project_id INTEGER REFERENCES projects(id),
      technology_id INTEGER REFERENCES technologies(id),
      PRIMARY KEY (project_id, technology_id)
    );
  `;

  console.log('Tables created.');
  console.log('Inserting data...');

  // Clear existing data
  await sql`DELETE FROM project_technologies;`;
  await sql`DELETE FROM technologies;`;
  await sql`DELETE FROM projects;`;
  await sql`DELETE FROM experience;`;
  await sql`DELETE FROM social_links;`;
  await sql`DELETE FROM about;`;

  await sql`
    INSERT INTO about (bio, about_text, background_video)
    VALUES (${data.bio}, ${data.about}, ${data.backgroundVideo});
  `;

  for (const link of data.socialLinks) {
    await sql`
      INSERT INTO social_links (name, url)
      VALUES (${link.name}, ${link.url});
    `;
  }

  for (const exp of data.experience) {
    await sql`
      INSERT INTO experience (title, company, description)
      VALUES (${exp.title}, ${exp.company}, ${exp.description});
    `;
  }

  const allTechs = new Set();
  data.projects.forEach(p => {
    p.technologies.forEach(t => allTechs.add(t));
  });

  const techMap = new Map();
  for (const techName of allTechs) {
    const res = await sql`
      INSERT INTO technologies (name)
      VALUES (${techName})
      ON CONFLICT (name) DO NOTHING
      RETURNING id, name;
    `;
    if (res.rows.length > 0) {
        techMap.set(res.rows[0].name, res.rows[0].id);
    } else {
        const existing = await sql`SELECT id, name FROM technologies WHERE name = ${techName};`;
        techMap.set(existing.rows[0].name, existing.rows[0].id);
    }
  }
  
  for (const project of data.projects) {
    const res = await sql`
      INSERT INTO projects (title, description)
      VALUES (${project.title}, ${project.description})
      RETURNING id;
    `;
    const projectId = res.rows[0].id;

    for (const techName of project.technologies) {
      const techId = techMap.get(techName);
      if (techId) {
        await sql`
          INSERT INTO project_technologies (project_id, technology_id)
          VALUES (${projectId}, ${techId});
        `;
      }
    }
  }

  console.log('Data inserted.');
}

main().catch(err => {
  console.error(
    'An error occurred while migrating the database:',
    err
  );
});
