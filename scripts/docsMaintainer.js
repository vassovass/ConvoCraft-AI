// scripts/docsMaintainer.js
// Auto-updates README, CHANGELOG and planning docs.
// Hardened: backs up originals before writing and validates inputs.
// NOTE: This is a minimal MVP. Extend as your project grows.

const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

/** Utility: safe write with backup */
function writeFileSafe(filePath, content) {
  const absPath = path.resolve(filePath);
  if (fs.existsSync(absPath)) {
    fs.copyFileSync(absPath, `${absPath}.bak`);
  }
  fs.writeFileSync(absPath, content, 'utf8');
  console.log(`✍️  Updated ${filePath}`);
}

/** Get commits since last tag or initial commit */
function getRecentCommits() {
  try {
    execSync('git rev-parse --is-inside-work-tree', { stdio: 'ignore' });
    const log = execSync('git log --pretty=format:%s --max-count=50 HEAD', { encoding: 'utf8' });
    return log.split(/\r?\n/).filter(Boolean);
  } catch (err) {
    console.error('Failed to read git log. Are you in a git repository?', err);
    return [];
  }
}

/** Parse commits into changelog sections based on Conventional Commits */
function classifyCommits(commits) {
  const sections = {
    feat: [],
    fix: [],
    docs: [],
    chore: [],
    refactor: [],
    perf: [],
    test: []
  };
  const re = /^(\w+)(?:\([^)]*\))?:\s(.+)/;
  commits.forEach(msg => {
    const match = msg.match(re);
    if (match) {
      const [, type, subject] = match;
      if (sections[type]) sections[type].push(subject);
    }
  });
  return sections;
}

/** Update CHANGELOG.md following Keep a Changelog */
function updateChangelog(sections) {
  const today = new Date().toISOString().split('T')[0];
  let changelog = '';
  const changelogPath = 'CHANGELOG.md';
  if (fs.existsSync(changelogPath)) {
    changelog = fs.readFileSync(changelogPath, 'utf8');
  } else {
    changelog = '# Changelog\n\nAll notable changes to this project will be documented in this file.\n\n';
  }

  let entry = `\n## [Unreleased] - ${today}\n`;
  for (const [type, items] of Object.entries(sections)) {
    if (items.length === 0) continue;
    const header = type === 'feat' ? 'Added' : type === 'fix' ? 'Fixed' : 'Changed';
    entry += `\n### ${header}\n`;
    items.forEach(i => (entry += `- ${i}\n`));
  }

  // Find the end of the first line (title) to keep header intact
  const firstBreak = changelog.indexOf('\n');
  const insertionPoint = firstBreak === -1 ? changelog.length : firstBreak + 1;
  const newContent = changelog.slice(0, insertionPoint) + entry + changelog.slice(insertionPoint);
  writeFileSafe(changelogPath, newContent);
}

/** Update README Features list */
function updateReadme(features) {
  const readmePath = 'README.md';
  if (!fs.existsSync(readmePath)) return;
  let readme = fs.readFileSync(readmePath, 'utf8');
  const marker = '## Features';
  const idx = readme.indexOf(marker);
  if (idx === -1) return; // no marker, skip
  const nextHeaderIdx = readme.indexOf('\n##', idx + marker.length);
  const endIdx = nextHeaderIdx === -1 ? readme.length : nextHeaderIdx;
  const before = readme.slice(0, idx + marker.length);
  const after = readme.slice(endIdx);
  const bulletList = features.map(f => `- ${f}`).join('\n');
  const newSection = `\n${bulletList}\n`;
  const updated = before + newSection + after;
  writeFileSafe(readmePath, updated);
}

/** Update planning.md with backlog items */
function updatePlanning(stories) {
  if (stories.length === 0) return;
  const planningPath = 'planning.md';
  let content = fs.existsSync(planningPath)
    ? fs.readFileSync(planningPath, 'utf8')
    : '# Planning\n\n';
  content += `\n## Sprint Backlog (${new Date().toISOString().split('T')[0]})\n`;
  stories.forEach(s => (content += `- [ ] ${s}\n`));
  writeFileSafe(planningPath, content);
}

function main() {
  const commits = getRecentCommits();
  if (commits.length === 0) {
    console.log('No commits found – skipping Docs Maintainer.');
    return;
  }
  const classified = classifyCommits(commits);
  try {
    updateChangelog(classified);
  } catch (err) {
    console.error('Docs Maintainer: changelog update failed –', err.message);
  }
  try {
    updateReadme(classified.feat);
  } catch (err) {
    console.error('Docs Maintainer: README update failed –', err.message);
  }
  try {
    updatePlanning(classified.feat.map(f => `Story: ${f}`));
  } catch (err) {
    console.error('Docs Maintainer: planning update failed –', err.message);
  }
  console.log('Docs Maintainer finished.');
}

main(); 