import fs from 'fs';
import path from 'path';

const owner = 'DrianAlif';
const token = process.env.GITHUB_TOKEN || '';

async function listFilesRecursive(baseDir, currentDir = '') {
  const fullPath = path.join(baseDir, currentDir);
  const entries = await fs.promises.readdir(fullPath, { withFileTypes: true });
  let files = [];

  for (const entry of entries) {
    const relPath = currentDir ? `${currentDir}/${entry.name}` : entry.name;
    
    if (
      entry.name === 'node_modules' ||
      entry.name === '.git' ||
      entry.name === '.wrangler' ||
      entry.name === 'dist' ||
      entry.name === '.DS_Store' ||
      entry.name === 'mingit.zip' ||
      entry.name === 'scripts'
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

async function githubApi(endpoint, method = 'GET', body = null, retries = 3) {
  const url = `https://api.github.com/repos/${owner}/${repo}${endpoint}`;
  const headers = {
    'Authorization': `token ${token}`,
    'User-Agent': 'Form-App-Deployer',
    'Accept': 'application/vnd.github.v3+json',
    'Content-Type': 'application/json'
  };

  for (let attempt = 1; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : null,
        signal: controller.signal
      });
      clearTimeout(timeout);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`GitHub API ${method} ${endpoint} failed (${response.status}): ${errorText}`);
      }

      return await response.json();
    } catch (err) {
      clearTimeout(timeout);
      if (attempt === retries) throw err;
      await new Promise((res) => setTimeout(res, 1000 * attempt));
    }
  }
}

async function main() {
  try {
    if (!token) {
      console.error('ERROR: GITHUB_TOKEN environment variable is missing.');
      return;
    }

    console.log(`Starting push to https://github.com/${owner}/${repo}...`);

    // 1. Scan files
    const files = await listFilesRecursive(dir);
    console.log(`Found ${files.length} project files to upload.`);

    // 2. Upload blobs in concurrent batches
    const treeItems = [];
    const concurrency = 6;
    for (let i = 0; i < files.length; i += concurrency) {
      const batch = files.slice(i, i + concurrency);
      await Promise.all(batch.map(async (filepath) => {
        const fullPath = path.join(dir, filepath);
        const content = await fs.promises.readFile(fullPath);
        const isBinary = /\.(png|jpg|jpeg|gif|ico|pdf|zip)$/i.test(filepath);

        let blobData;
        if (isBinary) {
          blobData = await githubApi('/git/blobs', 'POST', {
            content: content.toString('base64'),
            encoding: 'base64'
          });
        } else {
          blobData = await githubApi('/git/blobs', 'POST', {
            content: content.toString('utf-8'),
            encoding: 'utf-8'
          });
        }

        treeItems.push({
          path: filepath.replace(/\\/g, '/'),
          mode: '100644',
          type: 'blob',
          sha: blobData.sha
        });
      }));

      process.stdout.write(`Uploaded (${Math.min(i + concurrency, files.length)}/${files.length}) blobs...\r`);
    }
    console.log(`\nAll ${files.length} blobs uploaded successfully.`);

    // 3. Create Tree
    console.log('Creating Git tree...');
    const treeData = await githubApi('/git/trees', 'POST', {
      tree: treeItems
    });
    console.log(`Tree created: ${treeData.sha}`);

    // 4. Check for parent commit on main
    let parentCommitSha = null;
    try {
      const refData = await githubApi('/git/ref/heads/main');
      parentCommitSha = refData.object.sha;
      console.log(`Found existing parent commit: ${parentCommitSha}`);
    } catch (e) {
      console.log('Ref main not found, creating new ref.');
    }

    // 5. Create Commit
    console.log('Creating Git commit...');
    const commitData = await githubApi('/git/commits', 'POST', {
      message: 'feat: mobile responsiveness, dual-pane layout, PDF upload support, and master PDF styling',
      tree: treeData.sha,
      parents: parentCommitSha ? [parentCommitSha] : []
    });
    console.log(`Commit created: ${commitData.sha}`);

    // 6. Update branch main reference
    console.log('Updating branch main reference...');
    await githubApi('/git/refs/heads/main', 'PATCH', {
      sha: commitData.sha,
      force: true
    });

    console.log(`\n🎉 SUCCESS! All files have been pushed to https://github.com/${owner}/${repo} on branch main!`);
  } catch (err) {
    console.error('\nPush failed:', err.message);
  }
}

main();
