import git from 'isomorphic-git';
import http from 'isomorphic-git/http/node';
import fs from 'fs';

const dir = 'd:/form';

async function push() {
  try {
    const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
    if (!token) {
      console.log('NOTICE: GITHUB_TOKEN environment variable not detected.');
      return;
    }

    const pushResult = await git.push({
      fs,
      http,
      dir,
      ref: 'main',
      url: `https://github.com/DrianAlif/form-medqlab.git`,
      force: true,
      onAuth: () => ({ username: token, password: '' })
    });

    console.log('Push successfully completed:', pushResult);
  } catch (err) {
    console.error('Push error:', err);
  }
}

push();
