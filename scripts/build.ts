import { build } from 'esbuild';

const shared = {
  bundle: true,
  format: 'iife' as const,
  platform: 'browser' as const,
  target: ['chrome120', 'firefox140'],
  outdir: '.',
  logLevel: 'info' as const,
  legalComments: 'none' as const,
  banner: { js: '// Generated from src/*.ts. Run npm run build; do not edit.' }
};
await build({ ...shared, entryPoints: ['src/background.ts', 'src/popup.ts'] });
await build({ ...shared, entryPoints: ['src/core.ts'], globalName: 'Zabbix' });
