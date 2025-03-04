
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ESLintPlugin = require('eslint-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src/index.html',
  devServer: {
    static: {
      directory: path.join(__dirname, 'src'),
    },
    port: 8080,
    allowedHosts: 'all',
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: 'index.html'
    }),
    new ESLintPlugin()
  ]
};
