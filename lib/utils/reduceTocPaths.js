module.exports = toclist => {
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
