// scripts/commitMessageEnforcer.js
// Usage: node commitMessageEnforcer.js <commitMsgFile>
const fs = require('fs');
const file = process.argv[2];
if (!file || !fs.existsSync(file)) {
  console.error('CommitMessageEnforcer: commit message file not provided.');
  process.exit(1); // block commit if file missing
}

let msg = '';
try {
  msg = fs.readFileSync(file, 'utf8').trim();
} catch (err) {
  console.error('CommitMessageEnforcer: unable to read commit message file –', err.message);
  process.exit(1);
}

const re = /^(feat|fix|docs|style|refactor|perf|test|chore)(\([a-z0-9_\/-]+\))?: .{1,100}$/;

if (re.test(msg)) {
  console.log('CommitMessageEnforcer: message valid');
  process.exit(0);
} else {
  console.error('CommitMessageEnforcer: invalid commit message. Use Conventional Commits format.');
  process.exit(1);
} 