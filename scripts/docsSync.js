// scripts/docsSync.js
const { execSync } = require('child_process');

try {
  execSync('npm run docs:lint', { stdio: 'inherit' });
  console.log('DocsSync: documentation lint passed');
} catch (err) {
  console.error('DocsSync: documentation lint failed');
  process.exit(1);
} 