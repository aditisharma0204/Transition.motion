const fs = require('fs');
const json = JSON.parse(fs.readFileSync('assets/scenes/sparkle.json', 'utf8'));
let count = 0;
function traverse(node) {
  if (!node || typeof node !== 'object') return;
  if (Array.isArray(node)) { node.forEach(traverse); return; }
  if (node.ty === 'gf') {
    count++;
  }
  if (node.ty === 'fl') {
    console.log('Found solid fill');
  }
  Object.values(node).forEach(traverse);
}
traverse(json);
console.log('Gradient fills:', count);
