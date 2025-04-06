const now = Date.now();

let index = 0;

function uid() {
  return `rc-upload-${now}-${++index}`;
}

export default uid;
