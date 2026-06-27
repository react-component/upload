<div align="center">
  <h1>@rc-component/upload</h1>
  <p><sub>Ant Design 生态的一部分。</sub></p>
  <p>📤 React 文件上传基础组件，支持拖拽、请求定制和上传列表。</p>

  <p>
    <a href="https://www.npmjs.com/package/@rc-component/upload"><img src="https://img.shields.io/npm/v/@rc-component/upload.svg?style=flat-square" alt="npm version" /></a>
    <a href="https://www.npmjs.com/package/@rc-component/upload"><img src="https://img.shields.io/npm/dm/@rc-component/upload.svg?style=flat-square" alt="npm downloads" /></a>
    <a href="https://github.com/react-component/upload/actions"><img src="https://github.com/react-component/upload/actions/workflows/react-component-ci.yml/badge.svg" alt="CI" /></a>
    <a href="https://codecov.io/gh/react-component/upload"><img src="https://img.shields.io/codecov/c/github/react-component/upload/master.svg?style=flat-square" alt="Codecov" /></a>
    <a href="https://bundlephobia.com/package/@rc-component/upload"><img src="https://badgen.net/bundlephobia/minzip/@rc-component/upload" alt="bundle size" /></a>
    <a href="https://github.com/umijs/dumi"><img src="https://img.shields.io/badge/docs%20by-dumi-blue?style=flat-square" alt="dumi" /></a>
  </p>
</div>

<p align="center"><a href="./README.md">English</a> | 简体中文</p>


## 特性

- 支持 Ajax uploads with progress, headers, credentials, and custom request overrides.
- 支持 directory, drag, paste, async action, and before-upload flows.
- 暴露 `abort(file)` through the component instance for active requests.
- 提供 semantic `classNames` and `styles` slots for the hidden input.

## 安装

```bash
npm install @rc-component/upload
```

## 使用

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

## API

### Upload

| 名称 | 类型 | 默认值 | 说明 |
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

| 名称    | 类型                      | 说明             |
| ------- | ------------------------- | ----------------------- |
| `abort` | `(file?: RcFile) => void` | Abort an active upload. |

## 本地开发

```bash
npm install
npm start
npm test
npm run tsc
npm run compile
npm run build
```

## 发布

```bash
npm run prepublishOnly
```

The release flow is handled by `@rc-component/np` through the `rc-np` command after the package build.

## 许可证

@rc-component/upload is released under the [MIT](./LICENSE) license.
