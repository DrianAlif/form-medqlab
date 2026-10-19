import git from 'isomorphic-git';
import http from 'isomorphic-git/http/node';
import fs from 'fs';
import path from 'path';

const dir = 'd:/form';

async function listFilesRecursive(baseDir, currentDir = '') {
  const fullPath = path.join(baseDir, currentDir);
  const entries = await fs.promises.readdir(fullPath, { withFileTypes: true });
  let files = [];

  for (const entry of entries) {
    const relPath = currentDir ? `${currentDir}/${entry.name}` : entry.name;
    
    // Ignore node_modules, .git, .wrangler, dist
    if (
      entry.name === 'node_modules' ||
      entry.name === '.git' ||
      entry.name === '.wrangler' ||
      entry.name === 'dist' ||
      entry.name === '.DS_Store'
    ) {
      continue;
    }

    if (entry.isDirectory()) {
      const subFiles = await listFilesRecursive(baseDir, relPath);
      files = files.concat(subFiles);
    } else {
      files.push(relPath);
    }
  }

  return files;
}

async function run() {
  try {
    console.log('1. Initializing Git repository...');
    await git.init({ fs, dir, defaultBranch: 'main' });

    console.log('2. Scanning and staging project files...');
    const allFiles = await listFilesRecursive(dir);
    console.log(`Found ${allFiles.length} files to track.`);

    for (const file of allFiles) {
      await git.add({ fs, dir, filepath: file });
    }

    console.log('3. Creating commit...');
    const sha = await git.commit({
      fs,
      dir,
      author: {
        name: 'Alif Drian',
        email: 'drianalif@users.noreply.github.com'
      },
      message: 'feat: initial commit for Applimetis PDF generator web app with React, Cloudflare Workers and D1'
    });

    console.log(`Commit created: ${sha}`);
    console.log('Git repository successfully initialized with initial commit on branch main!');
  } catch (err) {
    console.error('Git error:', err);
  }
}

run();
