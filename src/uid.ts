const now = +new Date();
let index = 0;

export default function uid() {
  // eslint-disable-next-line no-plusplus
  return `rc-upload-${now}-${++index}`;
}
