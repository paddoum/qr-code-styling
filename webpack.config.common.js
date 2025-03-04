const path = require('path');
const FileManagerPlugin = require('filemanager-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');

const rootPath = path.resolve(__dirname, "./");
const srcPath = path.resolve(rootPath, "src");
const libPath = path.resolve(rootPath, "lib");
const tmpPath = path.resolve(rootPath, "tmp");

module.exports = {
  entry: srcPath + "/index.ts",
  output: {
    path: tmpPath,
    filename: "qr-code-styling.js",
    globalObject: "this",
    library: "QRCodeStyling",
    libraryTarget: "umd",
    libraryExport: "default"
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.html$/,
        use: [
          {
            loader: 'html-loader',
            options: { minimize: false }
          }
        ]
      }
    ]
  },
  plugins: [
    new ESLintPlugin({
      extensions: ['js']
    }),
    new FileManagerPlugin({
      events: {
        onEnd: {
          copy: [{ source: tmpPath + "/**/*", destination: libPath }],
          delete: [tmpPath]
        }
      }
    })
  ],
  resolve: {
    extensions: ['.js', '.json']
  }
};