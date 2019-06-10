const { resolve } = require('path');
const { realpathSync } = require('fs');

function resolveOwn(relativePath) {
  return resolve(__dirname, relativePath);
}

module.exports = cwd => {
  const appDirectory = realpathSync(cwd);

  function resolveApp(...relativePath) {
    return resolve(appDirectory, ...relativePath);
  }

  return {
    appPackageJson: resolveApp('package.json'),
    resolveApp,
    resolveOwn,
    appDirectory
  };
};
