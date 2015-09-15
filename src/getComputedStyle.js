let getComputedStyleX;

function _getComputedStyle(elem, name, cs) {
  let computedStyle = cs;
  let val = '';
  const d = elem.ownerDocument;
  if ((computedStyle = (computedStyle || d.defaultView.getComputedStyle(elem, null)))) {
    val = computedStyle.getPropertyValue(name) || computedStyle[name];
  }

  return val;
}

function _getComputedStyleIE(elem, name) {
  const ret = elem.currentStyle && elem.currentStyle[name];
  return ret === '' ? 'auto' : ret;
}

if (typeof window !== 'undefined') {
  getComputedStyleX = window.getComputedStyle ? _getComputedStyle : _getComputedStyleIE;
}

export default getComputedStyleX;
