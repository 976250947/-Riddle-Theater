const fs = require('fs');
const target = process.argv[2];
const source = fs.readFileSync(target, 'utf8');
const startLine = Number(process.argv[3] || 1);
const endLine = Number(process.argv[4] || Number.MAX_SAFE_INTEGER);

let state = 'code';
let escaped = false;
let brace = 0;
let line = 1;
const balances = new Map();

for (let index = 0; index < source.length; index += 1) {
  const char = source[index];
  const next = source[index + 1];

  if (char === '\n') {
    balances.set(line, brace);
    line += 1;
    if (state === 'linecomment') {
      state = 'code';
    }
    continue;
  }

  if (state === 'linecomment') {
    continue;
  }

  if (state === 'blockcomment') {
    if (char === '*' && next === '/') {
      state = 'code';
      index += 1;
    }
    continue;
  }

  if (state === 'single') {
    if (escaped) {
      escaped = false;
    } else if (char === '\\') {
      escaped = true;
    } else if (char === "'") {
      state = 'code';
    }
    continue;
  }

  if (state === 'double') {
    if (escaped) {
      escaped = false;
    } else if (char === '\\') {
      escaped = true;
    } else if (char === '"') {
      state = 'code';
    }
    continue;
  }

  if (state === 'template') {
    if (escaped) {
      escaped = false;
    } else if (char === '\\') {
      escaped = true;
    } else if (char === '`') {
      state = 'code';
    }
    continue;
  }

  if (char === '/' && next === '/') {
    state = 'linecomment';
    index += 1;
    continue;
  }

  if (char === '/' && next === '*') {
    state = 'blockcomment';
    index += 1;
    continue;
  }

  if (char === "'") {
    state = 'single';
    continue;
  }

  if (char === '"') {
    state = 'double';
    continue;
  }

  if (char === '`') {
    state = 'template';
    continue;
  }

  if (char === '{') {
    brace += 1;
  } else if (char === '}') {
    brace -= 1;
  }
}

console.log('final brace balance:', brace);
for (let currentLine = startLine; currentLine <= Math.min(endLine, line); currentLine += 1) {
  if (balances.has(currentLine)) {
    console.log(`${currentLine}: ${balances.get(currentLine)}`);
  }
}
