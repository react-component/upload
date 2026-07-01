<div align="center">
  <h1>@rc-component/upload</h1>
  <p><sub><a href="https://ant.design"><img alt="Ant Design" height="14" src="https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg" style="vertical-align: -0.125em;" /></a> Part of the Ant Design ecosystem.</sub></p>
  <p>📤 Low-level React upload primitive for Ajax, drag, paste, directory, and custom requests.</p>

  <p>
    <a href="https://npmjs.org/package/@rc-component/upload"><img alt="NPM version" src="https://img.shields.io/npm/v/@rc-component/upload.svg?style=flat-square"></a>
    <a href="https://npmjs.org/package/@rc-component/upload"><img alt="npm downloads" src="https://img.shields.io/npm/dm/@rc-component/upload.svg?style=flat-square"></a>
    <a href="https://github.com/react-component/upload/actions/workflows/react-component-ci.yml"><img alt="build status" src="https://github.com/react-component/upload/actions/workflows/react-component-ci.yml/badge.svg"></a>
    <a href="https://app.codecov.io/gh/react-component/upload"><img alt="Codecov" src="https://img.shields.io/codecov/c/github/react-component/upload/master.svg?style=flat-square"></a>
    <a href="https://bundlephobia.com/package/@rc-component/upload"><img alt="bundle size" src="https://img.shields.io/bundlephobia/minzip/@rc-component/upload?style=flat-square"></a>
    <a href="https://github.com/umijs/dumi"><img alt="dumi" src="https://img.shields.io/badge/docs%20by-dumi-blue?style=flat-square"></a>
  </p>
</div>

<p align="center">English | <a href="./README.zh-CN.md">简体中文</a></p>


## Highlights

- Supports Ajax uploads with progress, headers, credentials, and custom request overrides.
- Supports directory, drag, paste, async action, and before-upload flows.
- Exposes `abort(file)` through the component instance for active requests.
- Provides semantic `classNames` and `styles` slots for the hidden input.

## Install

```bash
npm install @rc-component/upload
```

## Usage

```tsx pure
import Upload from '@rc-component/upload';

export default () => (
  <Upload
    action="/upload"
    onStart={file => {
      console.log('start', file.name);
    }}
    onSuccess={(response, file) => {
      console.log('success', file.name, response);
    }}
  >
    <button type="button">Upload</button>
  </Upload>
);
```

Online preview: https://upload.react-component.vercel.app/

## Examples

Run the local dumi site:

```bash
ut install
npm start
```

Then open `http://localhost:8000`.

## API

### Upload

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| `accept` | string \| AcceptConfig | - | Input accept config. |
| `action` | string \| `(file) => string \| PromiseLike<string>` | - | Upload URL or async resolver. |
| `beforeUpload` | `(file, fileList) => BeforeUploadFileType \| Promise<void \| BeforeUploadFileType> \| void` | - | Validate or transform before upload. Return false to stop upload. |
| `className` | string | - | Root class name. |
| `classNames` | `{ input?: string }` | - | Semantic class names. |
| `component` | React.ComponentType<any> \| string | `'span'` | Root component. |
| `customRequest` | CustomUploadRequestOption | - | Override default request behavior. |
| `data` | object \| `(file) => object` | `{}` | Extra upload data. |
| `directory` | boolean | false | Enable directory upload. |
| `disabled` | boolean | false | Disable upload trigger. |
| `hasControlInside` | boolean | false | Whether child already contains a control element. |
| `headers` | Record<string, string> | `{}` | Request headers. |
| `id` | string | - | Input id. |
| `method` | `'POST' \| 'PUT' \| 'PATCH' \| 'post' \| 'put' \| 'patch'` | `'post'` | Request method. |
| `multiple` | boolean | false | Allow multiple file selection. |
| `name` | string | `'file'` | File field name. |
| `onBatchStart` | `(fileList) => void` | - | Called when a batch starts. |
| `onError` | `(error, response, file) => void` | - | Upload error callback. |
| `onProgress` | `(event, file) => void` | - | Upload progress callback. |
| `onStart` | `(file) => void` | - | Upload start callback. |
| `onSuccess` | `(response, file, xhr) => void` | - | Upload success callback. |
| `openFileDialogOnClick` | boolean | true | Open file dialog when root is clicked. |
| `pastable` | boolean | false | Enable paste upload. |
| `prefixCls` | string | `'rc-upload'` | Prefix class name. |
| `style` | React.CSSProperties | - | Root style. |
| `styles` | `{ input?: React.CSSProperties }` | - | Semantic styles. |
| `withCredentials` | boolean | false | Send credentials with Ajax upload. |

### Methods

| Name    | Type                      | Description             |
| ------- | ------------------------- | ----------------------- |
| `abort` | `(file: RcFile) => void` | Abort an active upload. |

## Development

```bash
ut install
npm start
npm test
npm run tsc
npm run compile
npm run build
```

The dumi site runs at `http://localhost:8000` by default.

## Release

```bash
npm run prepublishOnly
```

The release flow is handled by `@rc-component/np` through the `rc-np` command after the package build.

## License

@rc-component/upload is released under the [MIT](./LICENSE) license.
