#!/usr/bin/env node
/**
 * Generate PWA icons from SVG source
 * Run: node scripts/generate-icons.mjs
 */
import sharp from 'sharp';
import { mkdir } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const iconsDir = join(__dirname, '..', 'public', 'icons');

// Z-Scanner brand color
const PRIMARY_COLOR = '#16A34A';

// SVG template for Z-Scanner icon
const createSvg = (size) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <rect width="${size}" height="${size}" fill="${PRIMARY_COLOR}" rx="${Math.round(size * 0.125)}"/>
  <text x="${size / 2}" y="${size * 0.625}" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="${Math.round(size * 0.42)}" font-weight="bold">Z</text>
</svg>`;

const sizes = [
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'favicon.ico', size: 32 },
];

async function generateIcons() {
  await mkdir(iconsDir, { recursive: true });

  for (const { name, size } of sizes) {
    const svg = Buffer.from(createSvg(size));
    const outputPath = join(iconsDir, name);

    if (name.endsWith('.ico')) {
      // For favicon, create PNG first then we'll handle it
      await sharp(svg)
        .resize(size, size)
        .png()
        .toFile(outputPath.replace('.ico', '.png'));
      console.log(`Generated: ${name.replace('.ico', '.png')} (${size}x${size})`);
    } else {
      await sharp(svg)
        .resize(size, size)
        .png()
        .toFile(outputPath);
      console.log(`Generated: ${name} (${size}x${size})`);
    }
  }

  console.log('\nAll icons generated successfully!');
}

generateIcons().catch(console.error);
