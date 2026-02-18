
import fs from 'fs';
const content = fs.readFileSync('src/data/maths/mentalMathQuestions.ts', 'utf8');
const regex = /id:\s*['"]([^'"]+)['"]/g;
let match;
const ids = [];
while ((match = regex.exec(content)) !== null) {
    ids.push(match[1]);
}
const duplicates = ids.filter((item, index) => ids.indexOf(item) !== index);
console.log('Duplicate IDs:', [...new Set(duplicates)]);
