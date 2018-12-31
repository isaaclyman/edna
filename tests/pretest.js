const { execSync } = require('child_process')

process.env['NODE_ENV'] = 'test';

execSync('npx babel tests/test_util.js --out-file compiled/test_util.js')

process.exit()