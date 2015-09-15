const now = +(new Date());
let index = 0;

module.exports = function uid() {
  return 'rc-upload-' + now + '-' + (++index);
};
