import fs from 'fs';
const source = JSON.parse(fs.readFileSync('./assets/scenes/sparkle.json', 'utf-8'));
let gradientsFound = 0;
function findGradient(node) {
  if (!node || typeof node !== 'object') return;
  if (Array.isArray(node)) { node.forEach(findGradient); return; }
  if (node.ty === 'gf' || node.ty === 'gs') {
    gradientsFound++;
    console.log('Original Gradient:', node.g.k.k);
  }
  for (const key of Object.keys(node)) findGradient(node[key]);
}
findGradient(source);
