/**
 * 极简测试运行器 — 无依赖，Node.js 直接执行
 * 支持同步和异步测试
 */

let passed = 0;
let failed = 0;
const _pending = [];

function describe(name, fn) {
  console.log(`\n  ${name}`);
  fn();
}

function it(name, fn) {
  try {
    const result = fn();
    if (result && typeof result.then === "function") {
      _pending.push(
        result.then(() => {
          passed++;
          console.log(`    ✓ ${name}`);
        }).catch((err) => {
          failed++;
          console.log(`    ✗ ${name}`);
          console.log(`      ${err.message}`);
        })
      );
    } else {
      passed++;
      console.log(`    ✓ ${name}`);
    }
  } catch (err) {
    failed++;
    console.log(`    ✗ ${name}`);
    console.log(`      ${err.message}`);
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message || "Assertion failed");
}

function assertEqual(actual, expected, label = "") {
  if (actual !== expected) {
    throw new Error(`${label ? label + ": " : ""}Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

function assertDeepEqual(actual, expected, label = "") {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${label ? label + ": " : ""}Deep equality failed\n  Expected: ${JSON.stringify(expected)}\n  Actual:   ${JSON.stringify(actual)}`);
  }
}

function assertThrows(fn, label = "") {
  let threw = false;
  try { fn(); } catch { threw = true; }
  if (!threw) throw new Error(`${label ? label + ": " : ""}Expected function to throw`);
}

function assertType(value, type, label = "") {
  if (typeof value !== type) {
    throw new Error(`${label ? label + ": " : ""}Expected type ${type}, got ${typeof value}`);
  }
}

async function summary() {
  await Promise.all(_pending);
  console.log(`\n  ────────────────────────`);
  console.log(`  ${passed} passed, ${failed} failed`);
  console.log(`  ────────────────────────\n`);
  process.exit(failed > 0 ? 1 : 0);
}

module.exports = { describe, it, assert, assertEqual, assertDeepEqual, assertThrows, assertType, summary };
