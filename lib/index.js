const SDK = require('@yuque/sdk');
const winston = require('winston');
const { resolve } = require('path');
const { writeFile, mkdir, existsSync } = require('fs');
const { ensureDir, ensureFile } = require('fs-extra');
const promisify = require('util.promisify');
const rimraf = require('rimraf');
const chalk = require('chalk');
const { resolveApp } = require('./config/paths')(process.cwd());

const rimrafPromise = promisify(rimraf);
const mkdirPromise = promisify(mkdir);
const writeFilePromise = promisify(writeFile);

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'user-service' },
  transports: [
    //
    // - Write to all logs with level `info` and below to `combined.log`
    // - Write all logs error (and below) to `error.log`.
    //
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.json' })
  ]
});

const checkAndMkdir = async path => {
  if (!existsSync(path)) {
    await mkdirPromise(path);
  }
};

const reduceTocPaths = toclist => {
  const result = JSON.parse(JSON.stringify(toclist));
  result.forEach((item, index) => {
    const parent = result
      .slice(0, index)
      .reverse()
      .find(p => item.depth - p.depth === 1);
    item.path = (parent ? parent.path : '.') + '/' + item.title; // eslint-disable-line
    if (parent) parent.isDir = true;
    item.isDir = item.isDir || false; // eslint-disable-line
  });
  return result;
};

const realSaveRepoDoc = ({ namespace, repoDir, client } = {}) => async tocItem => {
  const { docs } = client;
  const filePath = resolve(repoDir, tocItem.path);
  if (tocItem.isDir) {
    await checkAndMkdir(filePath);
  }
  if (tocItem.slug && tocItem.slug !== '#') {
    try {
      let doc;
      if (tocItem.slug.indexOf('http') === 0) {
        doc = {
          body: `## [${tocItem.title}](${tocItem.slug})`
        };
      } else {
        doc = await docs.get({
          namespace,
          slug: tocItem.slug,
          data: { raw: 1 } // pass `raw=1` will return markdown body
        });
      }
      const error = await writeFilePromise(
        tocItem.isDir ? resolve(filePath, 'README.md') : filePath + '.md',
        doc ? doc.body : ''
      );
      if (!error) console.log(`fetch doc ${filePath}  ---success`);
      else throw error;
    } catch (e) {
      console.error(chalk.bold.red(`fetch doc ${filePath}  ---failed`));
      console.error(e);
    }
  }
};

const saveRepoDoc = ({ groupname, client } = {}) => async repo => {
  const { repos } = client;
  const namespace = `${groupname}/${repo.slug}`;
  const repoDir = resolveApp(`${groupname}/${repo.name}`);
  await checkAndMkdir(repoDir);
  const toc = await repos.getTOC({ namespace });
  const realSaveRepoDocFunc = realSaveRepoDoc({ namespace, repoDir, client });
  reduceTocPaths(toc).forEach(realSaveRepoDocFunc);
};

const rebuiltRootDir = async root => {
  await rimrafPromise(root);
  await checkAndMkdir(root);
};

const syncSource = async ({ token, group: groupname } = {}) => {
  const client = new SDK({ token });
  const { repos } = client;

  await rebuiltRootDir(resolveApp(groupname));
  const repolist = await repos.list({ group: groupname });
  repolist.forEach(saveRepoDoc({ groupname, client }));
};

module.exports = syncSource;
