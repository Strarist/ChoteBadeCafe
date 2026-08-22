'use strict';

/**
 * Fail if files that look confidential would be committed.
 * Run: pnpm check:secrets
 */

const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');

const ALLOWED_ENV = new Set(['.env.example', '.env.production.example']);

const FORBIDDEN_BASENAMES = new Set([
  '.env',
  'credentials.json',
  'id_rsa',
  'id_ed25519',
  'id_ecdsa',
]);

const FORBIDDEN_EXT = /\.(pem|key|p8|p12|pfx)$/i;

const CONTENT_PATTERNS = [
  { name: 'PEM private key', re: /-----BEGIN [A-Z ]*PRIVATE KEY-----/ },
  { name: 'Razorpay live key', re: /rzp_live_[A-Za-z0-9]+/ },
  { name: 'Razorpay test key', re: /rzp_test_[A-Za-z0-9]+/ },
  { name: 'Stripe live key', re: /sk_live_[A-Za-z0-9]+/ },
  { name: 'AWS access key', re: /AKIA[0-9A-Z]{16}/ },
  // Real PetPooja tokens are opaque; flag suspiciously long non-example secrets in tracked files
  {
    name: 'possible hardcoded DATABASE_URL password',
    re: /DATABASE_URL=postgres(?:ql)?:\/\/[^:\s]+:(?!cafe(?:@|"))[^@\s]{8,}@/i,
  },
];

const MUST_BE_IGNORED = [
  '.env',
  '.env.production',
  '.env.local',
  'apps/backend/.env',
  'apps/customer-app/.env',
  'apps/counter-pos/.env',
  'apps/admin/.env',
];

function git(args) {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
}

function isIgnored(relPath) {
  try {
    execFileSync('git', ['check-ignore', '-q', '--', relPath], { cwd: root });
    return true;
  } catch {
    return false;
  }
}

function pathLooksSecret(relPath) {
  const base = path.basename(relPath);
  if (ALLOWED_ENV.has(base)) return false;
  if (FORBIDDEN_BASENAMES.has(base)) return true;
  if (base.startsWith('.env.')) return true;
  if (FORBIDDEN_EXT.test(base) && !relPath.includes(`${path.sep}node_modules${path.sep}`)) {
    return true;
  }
  if (/service-account.*\.json$/i.test(base)) return true;
  return false;
}

function listCandidateFiles() {
  let out = '';
  try {
    out = git(['ls-files', '-co', '--exclude-standard']);
  } catch {
    // not a git repo / empty
  }
  return out ? out.split(/\r?\n/).filter(Boolean) : [];
}

const errors = [];

for (const rel of MUST_BE_IGNORED) {
  const abs = path.join(root, rel);
  if (fs.existsSync(abs) && !isIgnored(rel)) {
    errors.push(`${rel} exists and is NOT gitignored`);
  }
}

const candidates = listCandidateFiles();
for (const rel of candidates) {
  if (pathLooksSecret(rel)) {
    errors.push(`would be committed: ${rel}`);
    continue;
  }
  const abs = path.join(root, rel);
  let text = '';
  try {
    const stat = fs.statSync(abs);
    if (!stat.isFile() || stat.size > 512_000) continue;
    text = fs.readFileSync(abs, 'utf8');
  } catch {
    continue;
  }
  for (const rule of CONTENT_PATTERNS) {
    if (rule.re.test(text)) {
      errors.push(`${rel} contains ${rule.name}`);
    }
  }
}

if (errors.length) {
  console.error('check-secrets: refuse to ship these files/values:\n');
  for (const err of errors) console.error(`  - ${err}`);
  console.error('\nUse .env.example / .env.production.example only. Real keys stay local.');
  process.exit(1);
}

console.log(`check-secrets: ok (${candidates.length} tracked/visible files scanned).`);
