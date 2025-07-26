// scripts/dependencyInsight.js
const { execSync } = require('child_process');

try {
  const output = execSync('npm audit --json', {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    timeout: 30000 // 30 seconds
  });
  let data = {};
  try {
    data = JSON.parse(output);
  } catch (parseErr) {
    throw new Error('Invalid JSON from npm audit');
  }

  if (!data || typeof data !== 'object' || typeof data.vulnerabilities !== 'object') {
    console.log('DependencyInsight: audit returned no vulnerability object – treating as pass');
    process.exit(0);
  }
  const vulnerabilities = Object.values(data.vulnerabilities);
  const critical = vulnerabilities.filter(v => v.severity === 'critical' || v.severity === 'high');
  if (critical.length) {
    console.error(`DependencyInsight: detected ${critical.length} high/critical vulnerabilities.`);
    process.exit(1);
  }
  console.log('DependencyInsight: no high/critical vulnerabilities');
} catch (err) {
  console.error('DependencyInsight: audit failed – details:', err.message || err);
  process.exit(1);
} 