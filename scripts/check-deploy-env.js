'use strict';

const fs = require('node:fs');
const path = require('node:path');

const envPath = path.resolve(__dirname, '..', '.env.production');
const examplePath = path.resolve(__dirname, '..', '.env.production.example');

function fail(message) {
  console.error(`deploy-check: ${message}`);
  process.exit(1);
}

if (!fs.existsSync(envPath)) {
  fail(`Missing .env.production. Copy ${path.basename(examplePath)} and fill secrets.`);
}

const raw = fs.readFileSync(envPath, 'utf8');
const env = {};
for (const line of raw.split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eq = trimmed.indexOf('=');
  if (eq === -1) continue;
  env[trimmed.slice(0, eq)] = trimmed.slice(eq + 1);
}

const required = [
  'SITE_ADDRESS',
  'POSTGRES_PASSWORD',
  'REDIS_PASSWORD',
  'STAFF_SESSION_SECRET',
  'CORS_ORIGINS',
  'PETPOOJA_WEBHOOK_SECRET',
];

for (const key of required) {
  if (!env[key] || /replace-with|change-me|example\.com/i.test(env[key])) {
    fail(`${key} is missing or still a placeholder.`);
  }
}

if (env.STAFF_SESSION_SECRET.length < 32) {
  fail('STAFF_SESSION_SECRET must be at least 32 characters.');
}

if (env.POSTGRES_PASSWORD.length < 16 || env.REDIS_PASSWORD.length < 16) {
  fail('POSTGRES_PASSWORD and REDIS_PASSWORD must be at least 16 characters.');
}

if (env.ALLOW_FAKE_PAYMENTS === '1') {
  fail('ALLOW_FAKE_PAYMENTS=1 is not allowed in .env.production.');
}

const site = env.SITE_ADDRESS;
const cors = env.CORS_ORIGINS.split(',').map((s) => s.trim());
if (site !== ':80' && !cors.some((origin) => origin.includes(site))) {
  fail(`CORS_ORIGINS must include the public host (${site}).`);
}

if (env.PAYMENT_ADAPTER === 'live') {
  for (const key of ['RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET', 'RAZORPAY_WEBHOOK_SECRET']) {
    if (!env[key]) fail(`${key} is required when PAYMENT_ADAPTER=live.`);
  }
}

if (env.PETPOOJA_ADAPTER === 'live') {
  for (const key of [
    'PETPOOJA_APP_KEY',
    'PETPOOJA_APP_SECRET',
    'PETPOOJA_ACCESS_TOKEN',
    'PETPOOJA_REST_ID',
  ]) {
    if (!env[key]) fail(`${key} is required when PETPOOJA_ADAPTER=live.`);
  }
}

console.log('deploy-check: .env.production looks ready.');
console.log(`  site     ${site}`);
console.log(`  cors     ${env.CORS_ORIGINS}`);
console.log(`  payment  ${env.PAYMENT_ADAPTER ?? 'fake'}`);
console.log(`  petpooja ${env.PETPOOJA_ADAPTER ?? 'fake'}`);
console.log(`  notify   ${env.NOTIFICATION_ADAPTER ?? 'fake'}`);
