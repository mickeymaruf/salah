const expoConfig = require('eslint-config-expo/flat');

module.exports = [
  ...expoConfig,
  { ignores: ['dist/*', '.expo/*'] },
  { files: ['scripts/**'], languageOptions: { globals: { Buffer: 'readonly', __dirname: 'readonly' } } },
];
