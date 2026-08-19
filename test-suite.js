// SafetyNet Automated Test Suite
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { translations } from './src/services/i18n.js';
import { askGemini } from './src/services/gemini.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let passed = 0;
let failed = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${testName}`);
    failed++;
  }
}

console.log('🧪 Running SafetyNet Automated Verification Suite...\n');

// 1. Check Core Files
console.log('📁 1. Verifying Core Architecture Files:');
const requiredFiles = [
  'index.html',
  'package.json',
  'vite.config.js',
  'src/main.js',
  'src/style.css',
  'src/services/storage.js',
  'src/services/sound.js',
  'src/services/location.js',
  'src/services/gemini.js',
  'src/services/i18n.js',
  'src/components/sos.js',
  'src/components/timer.js',
  'src/components/map.js',
  'src/components/chat.js',
  'src/components/profile.js',
  'public/manifest.json',
  'public/sw.js',
  'Dockerfile',
  'nginx.conf'
];

requiredFiles.forEach(file => {
  const fullPath = path.join(__dirname, file);
  assert(fs.existsSync(fullPath), `File exists: ${file}`);
});

// 2. Test Dual-Language (i18n) Completeness
console.log('\n🌐 2. Testing Bilingual (EN / HI) Coverage:');
const enKeys = Object.keys(translations.en);
const hiKeys = Object.keys(translations.hi);
assert(enKeys.length > 30, `English dictionary loaded with ${enKeys.length} keys`);
assert(hiKeys.length > 30, `Hindi dictionary loaded with ${hiKeys.length} keys`);

let missingKeys = [];
enKeys.forEach(k => {
  if (!translations.hi[k]) missingKeys.push(k);
});
assert(missingKeys.length === 0, `All English keys have corresponding Hindi translations (missing: ${missingKeys.length})`);

// 3. Test AI Safety Knowledge Engine
console.log('\n🤖 3. Testing AI Offline Safety Engine:');
async function testAiEngine() {
  const queryFollowed = await askGemini('someone is following me');
  assert(queryFollowed.text.includes('Followed') || queryFollowed.text.includes('survival') || queryFollowed.text.includes('Public Place'), 'Handles stalking/followed query correctly');

  const queryCpr = await askGemini('cpr instructions');
  assert(queryCpr.text.includes('CPR') && queryCpr.text.includes('100-120 beats'), 'Handles CPR first aid query with proper rhythm guidance');

  const queryBleeding = await askGemini('severe bleeding');
  assert(queryBleeding.text.includes('Bleeding') && queryBleeding.text.includes('Pressure'), 'Handles severe bleeding first aid protocol');
}

// 4. Test Bundle Size & Production Artifacts
console.log('\n⚡ 4. Testing Build Output Size Constraints:');
const distHtml = path.join(__dirname, 'dist/index.html');
if (fs.existsSync(distHtml)) {
  const distStat = fs.statSync(distHtml);
  assert(distStat.size < 50000, `Production HTML is compact (${(distStat.size / 1024).toFixed(2)} KB)`);
}

testAiEngine().then(() => {
  console.log(`\n========================================`);
  console.log(`🏁 Test Results: ${passed} Passed, ${failed} Failed`);
  console.log(`========================================\n`);
  if (failed > 0) process.exit(1);
});