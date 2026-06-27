import { defineConfig } from 'dumi';
import path from 'path';

const basePath = process.env.GH_PAGES ? '/upload/' : '/';
const publicPath = basePath;

export default defineConfig({
  alias: {
    '@rc-component/upload$': path.resolve(__dirname, 'src'),
    '@rc-component/upload/es': path.resolve(__dirname, 'src'),
  },
  mfsu: false,
  favicons: ['https://avatars0.githubusercontent.com/u/9441414?s=200&v=4'],
  themeConfig: {
    name: 'Upload',
    logo: 'https://avatars0.githubusercontent.com/u/9441414?s=200&v=4',
  },
  outputPath: 'docs-dist',
  base: basePath,
  publicPath,
});
