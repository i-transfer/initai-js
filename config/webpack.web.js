const path = require('path')
const objectAssign = require('object-assign-deep')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const HtmlWebpackIncludeAssetsPlugin = require('html-webpack-include-assets-plugin')

const base = require('./webpack.base')

const TITLE = 'Init.ai JS -- Dev'

const webConfig = objectAssign(base, {
  output: {
    path: path.resolve(__dirname, '../dist/web'),
    filename: '[name].js',
    library: 'InitAI',
    libraryTarget: 'umd',
  },
})

webConfig.plugins.push(
  new HtmlWebpackPlugin({
    template: path.resolve(__dirname, '../dev/index.html'),
    title: TITLE,
  }),
  new HtmlWebpackIncludeAssetsPlugin({
    assets: [
      'dev/index.js',
      'node_modules/normalize.css/normalize.css',
      'dev/style.css',
    ],
    append: true,
  })
)

module.exports = webConfig
