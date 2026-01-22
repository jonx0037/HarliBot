const fs = require('fs');
const path = require('path');

// SVG template for the HarliBot icon - navy blue background with white H
const createIconSVG = (size) => `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <!-- Navy blue background -->
  <rect width="${size}" height="${size}" fill="#1e3a5f"/>
  
  <!-- White H letter - positioned centrally -->
  <text 
    x="50%" 
    y="50%" 
    dominant-baseline="central" 
    text-anchor="middle" 
    font-family="Arial, Helvetica, sans-serif" 
    font-weight="bold" 
    font-size="${Math.floor(size * 0.6)}" 
    fill="white"
  >H</text>
</svg>`;

// For PWA icons, we'll create SVG files first
// These can be converted to PNG using any online converter or ImageMagick

const publicDir = path.join(__dirname, '..', 'frontend', 'public');

// Create SVG files
fs.writeFileSync(path.join(publicDir, 'icon-192.svg'), createIconSVG(192));
fs.writeFileSync(path.join(publicDir, 'icon-512.svg'), createIconSVG(512));

console.log('✓ Created icon-192.svg and icon-512.svg in frontend/public/');
console.log('');
console.log('To convert to PNG, you can use one of these methods:');
console.log('1. Online: https://svgtopng.com/');
console.log('2. ImageMagick: convert icon-192.svg icon-192.png');
console.log('3. Inkscape: inkscape icon-192.svg -o icon-192.png');
