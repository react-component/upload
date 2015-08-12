# rc-upload
---

upload ui component for react

[![NPM version][npm-image]][npm-url]
[![npm download][download-image]][download-url]

[npm-image]: http://img.shields.io/npm/v/rc-upload.svg?style=flat-square
[npm-url]: http://npmjs.org/package/rc-upload
[download-image]: https://img.shields.io/npm/dm/rc-upload.svg?style=flat-square
[download-url]: https://npmjs.org/package/rc-upload

## Development

```
npm install
npm start
```

## Example

http://localhost:8000/examples/

online example: http://react-component.github.io/upload/examples/simple.html


## Feature

* support ie8,ie8+,chrome,firefox,safari

## install

[![rc-upload](https://nodei.co/npm/rc-upload.png)](https://npmjs.org/package/rc-upload)

## Usage

```js
var Upload = require('rc-upload');
var React = require('react');
React.render(<Upload />, container);
```

## API

### props

|name|type|默认值| 说明|
|-----|---|--------|----|
|name | string | file| file param post to server |
|action| string | | from action url |
|data| object | | other data object to post |
|accept | string | | input accept attribute |
|onStart | function| | start upload file |
|onError| function| | error callback |
| onSuccess | function | | success callback |
| onProgress | function || progress callback, only for modern browsers|

#### onError arguments

1. `err`: request error message
2. `responce`: request responce, not support on iframeUpload
3. `file`: upload file object

### onSuccess arguments

1. `result`: request body
2. `file`: upload file

## License

rc-upload is released under the MIT license.
