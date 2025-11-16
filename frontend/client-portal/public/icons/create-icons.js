const fs = require('fs');
const { createCanvas } = require('canvas');

// Create 192x192 icon
const canvas192 = createCanvas(192, 192);
const ctx192 = canvas192.getContext('2d');

// White background
ctx192.fillStyle = '#ffffff';
ctx192.fillRect(0, 0, 192, 192);

// Blue circle (like Material-UI theme)
ctx192.fillStyle = '#1976d2';
ctx192.beginPath();
ctx192.arc(96, 96, 80, 0, Math.PI * 2);
ctx192.fill();

// White "L" text
ctx192.fillStyle = '#ffffff';
ctx192.font = 'bold 80px Arial';
ctx192.textAlign = 'center';
ctx192.textBaseline = 'middle';
ctx192.fillText('L', 96, 96);

fs.writeFileSync('icon-192x192.png', canvas192.toBuffer('image/png'));
console.log('Created icon-192x192.png');

// Create 512x512 icon
const canvas512 = createCanvas(512, 512);
const ctx512 = canvas512.getContext('2d');

// White background
ctx512.fillStyle = '#ffffff';
ctx512.fillRect(0, 0, 512, 512);

// Blue circle
ctx512.fillStyle = '#1976d2';
ctx512.beginPath();
ctx512.arc(256, 256, 220, 0, Math.PI * 2);
ctx512.fill();

// White "L" text
ctx512.fillStyle = '#ffffff';
ctx512.font = 'bold 220px Arial';
ctx512.textAlign = 'center';
ctx512.textBaseline = 'middle';
ctx512.fillText('L', 256, 256);

fs.writeFileSync('icon-512x512.png', canvas512.toBuffer('image/png'));
console.log('Created icon-512x512.png');
