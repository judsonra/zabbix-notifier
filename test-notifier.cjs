// Compatibility entry point. Tests are maintained in tests/notifier.test.ts.
const { spawnSync } = require('node:child_process');
const result = spawnSync('npm', ['test'], { stdio: 'inherit', cwd: __dirname });
process.exit(result.status ?? 1);
