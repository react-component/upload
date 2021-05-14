import warning from 'rc-util/lib/warning';
import type { RcFile } from './interface';

function endsWith(str: string, suffix: string) {
  return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

export default (file: RcFile, acceptedFiles: string | string[]) => {
  if (file && acceptedFiles) {
    const acceptedFilesArray = Array.isArray(acceptedFiles)
      ? acceptedFiles
      : acceptedFiles.split(',');
    const fileName = file.name || '';
    const mimeType = file.type || '';
    const baseMimeType = mimeType.replace(/\/.*$/, '');

    return acceptedFilesArray.some(type => {
      const validType = type.trim();
      // This is something like */*,*  allow all files
      if (/^\*(\/\*)?$/.test(type)) {
        return true;
      }

      // like .jpg, .png
      if (validType.charAt(0) === '.') {
        return endsWith(fileName.toLowerCase(), validType.toLowerCase());
      }

      // This is something like a image/* mime type
      if (/\/\*$/.test(validType)) {
        return baseMimeType === validType.replace(/\/.*$/, '');
      }

      // Full match
      if (mimeType === validType) {
        return true;
      }

      // Invalidate type should skip
      if (/^\w+$/.test(validType)) {
        warning(false, `Upload takes an invalidate 'accept' type '${validType}'.Skip for check.`);
        return true;
      }

      return false;
    });
  }
  return true;
};
