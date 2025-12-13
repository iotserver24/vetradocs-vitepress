#!/usr/bin/env node
/**
 * Vetradocs Build Index Script
 * 
 * This script scans your VitePress markdown files and creates
 * an Orama search index for the AI chat.
 * 
 * Usage: npx vetradocs-build [options]
 * Options:
 *   --docs <path>   Path to your docs directory (default: ./docs)
 *   --output <path> Output path for the index (default: ./docs/public/search-index.json)
 */

import { create, insert } from '@orama/orama';
import { persist } from '@orama/plugin-data-persistence';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Parse command line arguments
const args = process.argv.slice(2);
let docsDir = './docs';
let outputPath = './docs/public/search-index.json';

for (let i = 0; i < args.length; i++) {
    if (args[i] === '--docs' && args[i + 1]) {
        docsDir = args[++i];
    } else if (args[i] === '--output' && args[i + 1]) {
        outputPath = args[++i];
    }
}

const CONTENT_DIR = path.resolve(process.cwd(), docsDir);
const OUTPUT_FILE = path.resolve(process.cwd(), outputPath);
const OUTPUT_DIR = path.dirname(OUTPUT_FILE);

// Recursively get all markdown files
function getFiles(dir) {
    if (!fs.existsSync(dir)) {
        console.error(`❌ Directory not found: ${dir}`);
        process.exit(1);
    }

    const dirents = fs.readdirSync(dir, { withFileTypes: true });
    const files = dirents.map((dirent) => {
        const res = path.resolve(dir, dirent.name);
        return dirent.isDirectory() ? getFiles(res) : res;
    });
    return Array.prototype.concat(...files);
}

// Extract frontmatter title from markdown
function extractTitle(content, filePath) {
    const titleMatch = content.match(/^#\s+(.*)$/m) || content.match(/^title:\s*["']?(.*)["']?$/m);
    if (titleMatch) return titleMatch[1].trim();
    return path.basename(filePath, path.extname(filePath));
}

// Strip frontmatter and code blocks for cleaner content
function cleanContent(content) {
    // Remove frontmatter
    content = content.replace(/^---[\s\S]*?---\n?/, '');
    // Remove code blocks (keep for context but could be noisy)
    // content = content.replace(/```[\s\S]*?```/g, '');
    return content.trim();
}

async function build() {
    console.log('🏗️  Vetradocs: Building Orama Search Index...');
    console.log(`   📂 Scanning: ${CONTENT_DIR}`);

    // Create the Orama Database Schema
    const db = await create({
        schema: {
            title: 'string',
            url: 'string',
            content: 'string',
        },
    });

    // Get all markdown files
    const files = getFiles(CONTENT_DIR).filter(f => f.endsWith('.md'));

    if (files.length === 0) {
        console.warn('⚠️  No markdown files found in the docs directory.');
    }

    let indexed = 0;
    for (const file of files) {
        const content = fs.readFileSync(file, 'utf-8');
        const title = extractTitle(content, file);
        const cleanedContent = cleanContent(content);

        // Construct URL from path
        const relativePath = path.relative(CONTENT_DIR, file)
            .replace(/\\/g, '/')
            .replace(/\.md$/, '')
            .replace(/index$/, '');

        const url = '/' + relativePath;

        await insert(db, {
            title: title,
            url: url,
            content: cleanedContent,
        });
        indexed++;
    }

    // Ensure output directory exists
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    // Save the index
    const index = await persist(db, 'json');
    fs.writeFileSync(OUTPUT_FILE, index);

    console.log(`✅ Indexed ${indexed} documents.`);
    console.log(`✅ Index saved to: ${OUTPUT_FILE}`);
}

build().catch(err => {
    console.error('❌ Build failed:', err);
    process.exit(1);
});
