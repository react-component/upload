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
  const flattenFileList = [];
  const progressFileList = [];
  files.forEach(file => progressFileList.push(file.webkitGetAsEntry() as any));
  function loopFiles(item: InternalDataTransferItem) {
    const dirReader = item.createReader();

    function sequence() {
      dirReader.readEntries((entries: InternalDataTransferItem[]) => {
        const entryList = Array.prototype.slice.apply(entries);

        progressFileList.push(...entryList);
        // Check if all the file has been viewed
        const isFinished = !entryList.length;
        if (isFinished) {
          return;
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
        }
      });
    } else if (item.isDirectory) {
      loopFiles(item);
    }
  };

  function walkFiles() {
    let wipIndex = 0;
    while (wipIndex < progressFileList.length) {
      _traverseFileTree(progressFileList[wipIndex]);
      wipIndex++;
    }
    callback(flattenFileList);
  }
  walkFiles();
};

export default traverseFileTree;
