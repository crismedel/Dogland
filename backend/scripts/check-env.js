/**
 * Script para verificar la configuracion de entornos
 * Uso: npm run check:env
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFile(filepath, required = false) {
  const exists = fs.existsSync(path.join(rootDir, filepath));
  const status = exists ? '✓' : (required ? '✗' : '○');
  const color = exists ? 'green' : (required ? 'red' : 'yellow');
  const msg = exists ? 'Encontrado' : (required ? 'FALTANTE (requerido)' : 'No encontrado (opcional)');

  log(`  ${status} ${filepath.padEnd(30)} ${msg}`, color);
  return exists;
}

function parseEnvFile(filepath) {
  try {
    const content = fs.readFileSync(path.join(rootDir, filepath), 'utf8');
    const vars = {};

    content.split('\n').forEach(line => {
      const match = line.match(/^([A-Z_]+)=(.*)$/);
      if (match) {
        vars[match[1]] = match[2];
      }
    });

    return vars;
  } catch (error) {
    return null;
  }
}

function checkEnvVars(filepath, requiredVars) {
  const vars = parseEnvFile(filepath);
  if (!vars) {
    log(`    No se puede analizar ${filepath}`, 'red');
    return false;
  }

  let allPresent = true;
  requiredVars.forEach(varName => {
    const exists = vars[varName] !== undefined && vars[varName] !== '';
    const status = exists ? '✓' : '✗';
    const color = exists ? 'green' : 'red';

    if (exists) {
      const value = vars[varName].length > 20
        ? vars[varName].substring(0, 17) + '...'
        : vars[varName];
      log(`    ${status} ${varName.padEnd(20)} = ${value}`, color);
    } else {
      log(`    ${status} ${varName.padEnd(20)} FALTANTE`, color);
      allPresent = false;
    }
  });

  return allPresent;
}

console.log('\n' + '='.repeat(60));
log('  DOGLAND BACKEND - Verificación de Configuración', 'blue');
console.log('='.repeat(60) + '\n');

// Checkear archivos de entorno
log('Archivos de Entorno:', 'blue');
const hasEnv = checkFile('.env', false);
const hasEnvLocal = checkFile('.env.local', false);
const hasEnvTest = checkFile('.env.test', false);

console.log('');

// Checkear variables requeridas
const requiredVars = ['JWT_SECRET', 'DB_USER', 'DB_HOST', 'DB_NAME', 'DB_PASS', 'DB_PORT'];

if (hasEnv) {
  log('Verificando .env (BD Remota):', 'blue');
  checkEnvVars('.env', requiredVars);
  console.log('');
}

if (hasEnvLocal) {
  log('Verificando .env.local (BD Local Docker):', 'blue');
  const localVars = [...requiredVars, 'POSTGRES_USER', 'POSTGRES_PASSWORD', 'POSTGRES_DB'];
  checkEnvVars('.env.local', localVars);
  console.log('');
}

if (hasEnvTest) {
  log('Verificando .env.test (BD de Tests):', 'blue');
  checkEnvVars('.env.test', requiredVars);
  console.log('');
}

// Checkear docker files
log('Configuración de Docker:', 'blue');
checkFile('docker-compose.yaml', false);
checkFile('db/db_init/01_schema.sql', false);
checkFile('db/db_init/02_seed.sql', false);

console.log('');

// Checkear archivo main config
log('Archivos de Configuración:', 'blue');
checkFile('config/env.js', true);

console.log('');

// Recomendaciones
log('Recomendaciones:', 'yellow');

if (!hasEnv && !hasEnvLocal) {
  log('     No se encontró .env ni .env.local. Crea al menos uno:', 'yellow');
  log('     Para DB remota: crea .env con DB_HOST=<IP>', 'yellow');
  log('     Para DB local: crea .env.local con DB_HOST=localhost', 'yellow');
}

if (!hasEnvTest) {
  log('     No se encontró .env.test. Créalo si planeas ejecutar tests:', 'yellow');
}

if (hasEnv && hasEnvLocal) {
  log('  ✓ Se encontraron .env y .env.local. Usa scripts npm para cambiar:', 'green');
  log('     npm run dev        → Usa .env (remota)', 'green');
  log('     npm run dev:local  → Usa .env.local (Docker)', 'green');
}

console.log('\n' + '='.repeat(60));
log('  Ejecuta "npm run dev" para iniciar la aplicación', 'blue');
console.log('='.repeat(60) + '\n');
