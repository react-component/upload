function loopFiles(item, callback) {
  const dirReader = item.createReader();
  let fileList = [];

  function sequence() {
    dirReader.readEntries(entries => {
      const entryList = Array.prototype.slice.apply(entries);
      fileList = fileList.concat(entryList);

      // Check if all the file has been viewed
      const isFinished = !entryList.length;

      if (isFinished) {
        callback(fileList);
      } else {
        sequence();
      }
    });
  }

  sequence();
}

const traverseFileTree = (files, callback, isAccepted) => {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const _traverseFileTree = (item, path) => {
    // eslint-disable-next-line no-param-reassign
    path = path || '';
    if (item.isFile) {
      item.file(file => {
        if (isAccepted(file)) {
          // https://github.com/ant-design/ant-design/issues/16426
          if (item.fullPath && !file.webkitRelativePath) {
            Object.defineProperties(file, {
              webkitRelativePath: {
                writable: true,
              },
            });
            // eslint-disable-next-line no-param-reassign
            file.webkitRelativePath = item.fullPath.replace(/^\//, '');
            Object.defineProperties(file, {
              webkitRelativePath: {
                writable: false,
              },
            });
          }
          callback([file]);
        }
      });
    } else if (item.isDirectory) {
      loopFiles(item, entries => {
        entries.forEach(entryItem => {
          _traverseFileTree(entryItem, `${path}${item.name}/`);
        });
      });
    }
  };
  files.forEach(file => {
    _traverseFileTree(file.webkitGetAsEntry());
  });
};

export default traverseFileTree;
