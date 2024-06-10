import type { RcFile } from './interface';

interface InternalDataTransferItem extends DataTransferItem {
  isFile: boolean;
  file: (cd: (file: RcFile & { webkitRelativePath?: string }) => void) => void;
  createReader: () => any;
  fullPath: string;
  isDirectory: boolean;
  name: string;
  path: string;
}

const traverseFileTree = (files: InternalDataTransferItem[], callback, isAccepted) => {
  let restFile = files.length;
  const flattenFileList = [];
  function loopFiles(item: InternalDataTransferItem, callback) {
    const dirReader = item.createReader();
    let fileList = [];

    function sequence() {
      dirReader.readEntries((entries: InternalDataTransferItem[]) => {
        const entryList = Array.prototype.slice.apply(entries);
        fileList = fileList.concat(entryList);

        // Check if all the file has been viewed
        const isFinished = !entryList.length;

        if (isFinished) {
          restFile = restFile - 1 + fileList.length;
          callback(fileList);
        } else {
          sequence();
        }
      });
    }

    sequence();
  }
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const _traverseFileTree = (item: InternalDataTransferItem, path?: string) => {
    if (!item) {
      restFile = restFile - 1;
      return;
    }
    // eslint-disable-next-line no-param-reassign
    item.path = path || '';
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
            (file as any).webkitRelativePath = item.fullPath.replace(/^\//, '');
            Object.defineProperties(file, {
              webkitRelativePath: {
                writable: false,
              },
            });
          }
          flattenFileList.push(file);
          restFile = restFile - 1;
          if (restFile === 0) {
            callback(flattenFileList);
          }
        }
      });
    } else if (item.isDirectory) {
      loopFiles(item, (entries: InternalDataTransferItem[]) => {
        entries.forEach(entryItem => {
          _traverseFileTree(entryItem, `${path}${item.name}/`);
        });
      });
    }
  };
  files.forEach(file => {
    _traverseFileTree(file.webkitGetAsEntry() as any);
  });
};

export default traverseFileTree;
