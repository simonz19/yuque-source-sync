#!/usr/bin/env node

const yargParser = require('yargs-parser');
const chalk = require('chalk');

const args = yargParser(process.argv.slice(2));
const { t: token, g: group, r: repo } = args;

if (!token || !group) {
  console.error(chalk.bold.red('token and group is required'));
  process.exit(1);
}

require('../lib/index')({ token, group, repo });
