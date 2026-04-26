#!/usr/bin/env node
/**
 * Post-build script to fix Next.js static export for Hostinger/LiteSpeed
 * 
 * LiteSpeed blocks underscore-prefixed directories, so we rename:
 * - _next/ -> next/
 * - Update all references in HTML and JS files from /_next/ to /next/
 */

const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '../out');

console.log('🔧 Fixing build output for LiteSpeed compatibility...');

// Rename _next directory to next
const nextDir = path.join(outDir, '_next');
const newNextDir = path.join(outDir, 'next');

if (fs.existsSync(nextDir)) {
  if (fs.existsSync(newNextDir)) {
    fs.rmSync(newNextDir, { recursive: true, force: true });
  }
  fs.renameSync(nextDir, newNextDir);
  console.log('✓ Renamed _next/ to next/');
} else {
  console.log('⚠ _next/ directory not found');
}

// Recursively find all files matching extensions
function findFiles(dir, extensions) {
  let results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(findFiles(fullPath, extensions));
    } else if (extensions.some(ext => entry.name.endsWith(ext))) {
      results.push(fullPath);
    }
  }
  return results;
}

// Update references in HTML files (all, including nested)
const htmlFiles = findFiles(outDir, ['.html']);
let updatedCount = 0;

htmlFiles.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;
  content = content.replace(/\/_next\//g, '/next/');
  if (content !== original) {
    fs.writeFileSync(filePath, content);
    updatedCount++;
    console.log(`✓ Updated references in ${path.relative(outDir, filePath)}`);
  }
});

// Update references in JS chunks that contain /_next/ paths
const jsFiles = findFiles(outDir, ['.js']);
jsFiles.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;
  content = content.replace(/\/_next\//g, '/next/');
  if (content !== original) {
    fs.writeFileSync(filePath, content);
    updatedCount++;
    console.log(`✓ Updated references in ${path.relative(outDir, filePath)}`);
  }
});

console.log(`✨ Build fix complete — updated ${updatedCount} files`);
