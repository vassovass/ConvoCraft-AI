# ATTENTION VASSO

This project now contains automated **Cursor rules** & background agents.  A few manual tweaks are still required to finalise everything.

## 1. NPM Scripts
Scripts added automatically to `package.json`:
```json5
{
  "scripts": {
    "lint": "eslint .",
    "test": "echo \"(placeholder) run tests\" && exit 0",
    "docs:lint": "markdownlint '**/*.md'"
  }
}
```
Feel free to replace with whatever tools you actually use (Prettier, Vitest, etc.).

## 2. Commit-msg Hook (for CommitMessageEnforcer)
Git itself does **not** set the `$COMMIT_MSG_FILE` env variable, so the Cursor rule won’t fire automatically.  Install **Husky** and create a `commit-msg` hook that calls the script and passes the commit-message file path:

```sh
npm install --save-dev husky
npx husky install                     # only once per repo
npx husky add .husky/commit-msg 'node scripts/commitMessageEnforcer.js "$1"'
```

The Husky hook file `.husky/commit-msg` has been created automatically.  No further action needed.

## 3. README Marker
Ensure your `README.md` contains a `## Features` heading – Docs Maintainer appends feature bullets under that section.

## 4. Initial CHANGELOG & planning.md  (manual)
Docs Maintainer will create these on the first run; just review the content afterwards.

## 5. Security Audit Frequency
DependencyInsight currently triggers on *package.json* changes and weekly when the project is opened.  Tweak the trigger in `.cursor/rules/dependency-insight.mdc` if you prefer a different cadence.

## 6. Coverage Threshold
Change the `coverage_threshold` value in `.cursor/rules/test-coverage-guardian.mdc` if 80 % isn’t right for your team.

---
All automatable steps are now complete.  Remaining items (reviewing generated docs, tweaking audit cadence or coverage threshold) require human judgement, so they’re left for you. 