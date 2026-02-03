#!/usr/bin/env node
/**
 * One-off script: convert template rule .md files under templates/ to .mdc with frontmatter.
 * Run from repo root: node scripts/convert-template-rules-to-mdc.js
 * After running, update src/index.js (SHARED_RULES and TEMPLATES.rules to .mdc) and run tests.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = path.join(__dirname, '..', 'templates');

function extractDescription(content) {
  const firstLine = content.split('\n')[0] || '';
  const match = firstLine.match(/^#\s+(.+)$/);
  const title = match ? match[1].trim() : 'Rule';
  return title.length > 120 ? title.slice(0, 117) + '...' : title;
}

function mdToMdc(content, alwaysApply = false) {
  const description = extractDescription(content);
  const frontmatter = `---
description: ${description.replace(/"/g, '\\"')}
alwaysApply: ${alwaysApply}
---

`;
  return frontmatter + content;
}

// Convert one file: read .md, write .mdc, delete .md
function convertFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const mdcPath = filePath.replace(/\.md$/, '.mdc');
  const isShared = filePath.includes('/_shared/');
  const newContent = mdToMdc(content, isShared);
  fs.writeFileSync(mdcPath, newContent, 'utf8');
  fs.unlinkSync(filePath);
  return mdcPath;
}

// Find all .cursor/rules/*.md under templates (excluding _shared, already done)
const categories = fs.readdirSync(TEMPLATES_DIR).filter((n) => n !== '_shared' && !n.startsWith('.'));
let count = 0;
for (const cat of categories) {
  const catPath = path.join(TEMPLATES_DIR, cat);
  if (!fs.statSync(catPath).isDirectory()) continue;
  const templates = fs.readdirSync(catPath);
  for (const name of templates) {
    const rulesDir = path.join(catPath, name, '.cursor', 'rules');
    if (!fs.existsSync(rulesDir)) continue;
    const files = fs.readdirSync(rulesDir).filter((f) => f.endsWith('.md'));
    for (const f of files) {
      const full = path.join(rulesDir, f);
      convertFile(full);
      count++;
    }
  }
}
console.log(`Converted ${count} template rule files from .md to .mdc.`);
