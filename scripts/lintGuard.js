// scripts/lintGuard.js
import { execSync } from 'child_process';

try {
  execSync('npm run lint --fix', { stdio: 'inherit', timeout: 60000 }); // 60-second timeout
  console.log('LintGuard: lint pass');
} catch (err) {
  console.error('LintGuard: lint errors found');
  process.exit(1);
} 