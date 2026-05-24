const fs = require('fs');

const svg192 = `<svg xmlns='http://www.w3.org/2000/svg' width='192' height='192' viewBox='0 0 192 192'>
  <rect width='192' height='192' rx='40' fill='#7c3aed'/>
  <text x='96' y='130' font-family='Georgia, serif' font-size='100' font-weight='bold' fill='white' text-anchor='middle'>N</text>
</svg>`;

const svg512 = `<svg xmlns='http://www.w3.org/2000/svg' width='512' height='512' viewBox='0 0 512 512'>
  <rect width='512' height='512' rx='100' fill='#7c3aed'/>
  <text x='256' y='350' font-family='Georgia, serif' font-size='280' font-weight='bold' fill='white' text-anchor='middle'>N</text>
</svg>`;

fs.mkdirSync('public/icons', { recursive: true });

fs.writeFileSync('public/icons/icon-192.svg', svg192);
fs.writeFileSync('public/icons/icon-512.svg', svg512);

console.log('Icons created!');