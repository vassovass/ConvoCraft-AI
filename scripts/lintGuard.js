// scripts/lintGuard.js
const { execSync } = require('child_process');

try {
  execSync('npm run lint --fix', { stdio: 'inherit' });
  console.log('LintGuard: lint pass');
} catch (err) {
  console.error('LintGuard: lint errors found');
  process.exit(1);
} 