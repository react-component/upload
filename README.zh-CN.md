<div align="center">
  <h1>@rc-component/upload</h1>
  <p><sub><a href="https://ant.design"><img alt="Ant Design" height="14" src="https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg" style="vertical-align: -0.125em;" /></a> Ant Design 生态的一部分。</sub></p>
  <p>📤 React 文件上传基础组件，支持拖拽、请求定制和上传列表。</p>

  <p>
    <a href="https://npmjs.org/package/@rc-component/upload"><img alt="NPM version" src="https://img.shields.io/npm/v/@rc-component/upload.svg?style=flat-square"></a>
    <a href="https://npmjs.org/package/@rc-component/upload"><img alt="npm downloads" src="https://img.shields.io/npm/dm/@rc-component/upload.svg?style=flat-square"></a>
    <a href="https://github.com/react-component/upload/actions/workflows/react-component-ci.yml"><img alt="build status" src="https://github.com/react-component/upload/actions/workflows/react-component-ci.yml/badge.svg"></a>
    <a href="https://app.codecov.io/gh/react-component/upload"><img alt="Codecov" src="https://img.shields.io/codecov/c/github/react-component/upload/master.svg?style=flat-square"></a>
    <a href="https://bundlephobia.com/package/@rc-component/upload"><img alt="bundle size" src="https://img.shields.io/bundlephobia/minzip/@rc-component/upload?style=flat-square"></a>
    <a href="https://github.com/umijs/dumi"><img alt="dumi" src="https://img.shields.io/badge/docs%20by-dumi-blue?style=flat-square"></a>
  </p>
</div>

<p align="center"><a href="./README.md">English</a> | 简体中文</p>


## 特性

- 支持带进度、请求头、凭证和自定义请求覆盖的 Ajax 上传。
- 支持目录上传、拖拽、粘贴、异步 action 和上传前处理流程。
- 通过组件实例暴露 `abort(file)`，用于中止进行中的请求。
- 为隐藏 input 提供语义化 `classNames` 和 `styles` 插槽。

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

在线预览：https://upload.react-component.vercel.app/

## 示例

运行本地 dumi 站点：

```bash
npm install
npm start
```

然后打开 `http://localhost:8000`。

## API

### Upload

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `accept` | string \| AcceptConfig | - | input accept 配置。 |
| `action` | string \| `(file) => string \| PromiseLike<string>` | - | 上传地址或异步解析函数。 |
| `beforeUpload` | `(file, fileList) => BeforeUploadFileType \| Promise<void \| BeforeUploadFileType> \| void` | - | 上传前校验或转换文件。返回 false 可阻止上传。 |
| `className` | string | - | 根 className。 |
| `classNames` | `{ input?: string }` | - | 语义化类名。 |
| `component` | React.ComponentType<any> \| string | `'span'` | 根组件。 |
| `customRequest` | CustomUploadRequestOption | - | 覆盖默认请求行为。 |
| `data` | object \| `(file) => object` | `{}` | 额外上传数据。 |
| `directory` | boolean | false | 启用目录上传。 |
| `disabled` | boolean | false | 禁用上传触发器。 |
| `hasControlInside` | boolean | false | 子节点是否已包含控制元素。 |
| `headers` | Record<string, string> | `{}` | 请求头。 |
| `id` | string | - | Input id。 |
| `method` | `'POST' \| 'PUT' \| 'PATCH' \| 'post' \| 'put' \| 'patch'` | `'post'` | 请求方法。 |
| `multiple` | boolean | false | 允许多文件选择。 |
| `name` | string | `'file'` | 文件字段名。 |
| `onBatchStart` | `(fileList) => void` | - | 批量开始时调用。 |
| `onError` | `(error, response, file) => void` | - | 上传错误回调。 |
| `onProgress` | `(event, file) => void` | - | 上传进度回调。 |
| `onStart` | `(file) => void` | - | 上传开始回调。 |
| `onSuccess` | `(response, file, xhr) => void` | - | 上传成功回调。 |
| `openFileDialogOnClick` | boolean | true | 点击根节点时打开文件选择框。 |
| `pastable` | boolean | false | 启用粘贴上传。 |
| `prefixCls` | string | `'rc-upload'` | 前缀 className。 |
| `style` | React.CSSProperties | - | 根样式。 |
| `styles` | `{ input?: React.CSSProperties }` | - | 语义化样式。 |
| `withCredentials` | boolean | false | 随 Ajax 上传发送凭证。 |

### 方法

| 名称    | 类型                      | 说明             |
| ------- | ------------------------- | ----------------------- |
| `abort` | `(file: RcFile) => void` | 中止进行中的上传。 |

## 本地开发

```bash
npm install
npm start
npm test
npm run tsc
npm run compile
npm run build
```

dumi 站点默认运行在 `http://localhost:8000`。

## 发布

```bash
npm run prepublishOnly
```

包构建完成后，发布流程由 `@rc-component/np` 通过 `rc-np` 命令处理。

## 许可证

@rc-component/upload 基于 [MIT](./LICENSE) 许可证发布。
