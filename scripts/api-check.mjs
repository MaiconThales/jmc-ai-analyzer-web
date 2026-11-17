// Gera os tipos do OpenAPI atual da API e falha se forem diferentes de src/app/core/api/generated/api.d.ts.
import { execSync } from 'node:child_process';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const api = process.env.API_URL ?? 'http://localhost:8080';
const out = join(mkdtempSync(join(tmpdir(), 'api-check-')), 'api.d.ts');
execSync(`npx -y openapi-typescript@7.13.0 ${api}/v3/api-docs -o ${out}`, { stdio: 'inherit' });
const current = readFileSync('src/app/core/api/generated/api.d.ts', 'utf8');
if (readFileSync(out, 'utf8') !== current) {
  console.error('Os tipos da API mudaram. Rode "npm run api:types" e revise o impacto no front.');
  process.exit(1);
}
console.log('Tipos da API em dia.');
