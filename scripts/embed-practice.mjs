import fs from 'node:fs';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const bank = JSON.parse(fs.readFileSync(root + 'practice/reviewed-options.json', 'utf8'));
const norm = text => text.trim().replace(/\s+/g, ' ');
const keys = new Set();
for (const row of bank) {
  assert.equal(row.tricky.length, 2, row.question);
  assert.equal(typeof row.obvious, 'string', row.question);
  const key = JSON.stringify([norm(row.question), norm(row.answer)]);
  assert(!keys.has(key), `Duplicate reviewed question: ${row.question}`);
  keys.add(key);
  assert.equal(new Set([row.answer, ...row.tricky, row.obvious].map(norm)).size, 4, row.question);
}
const path = root + 'index.html';
let html = fs.readFileSync(path, 'utf8');
const start = '// BEGIN REVIEWED PRACTICE OPTIONS';
const end = '// END REVIEWED PRACTICE OPTIONS';
assert(html.includes(start) && html.includes(end), 'Missing practice data markers');
const content = `${start}\nconst REVIEWED_OPTIONS=${JSON.stringify(bank)};\n${end}`;
html = html.slice(0, html.indexOf(start)) + content + html.slice(html.indexOf(end) + end.length);
fs.writeFileSync(path, html);
console.log(`Embedded ${bank.length} reviewed question option sets.`);
