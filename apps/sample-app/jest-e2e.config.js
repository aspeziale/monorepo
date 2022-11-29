const bjc = require('@aspeziale/jest-config-base');

const { testRegex, ...rest } = bjc

module.exports = {
  ...rest,
  testRegex: testRegex.e2e,
  rootDir: './src',
};
