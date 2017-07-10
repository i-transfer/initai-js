const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const HtmlWebpackIncludeAssetsPlugin = require('html-webpack-include-assets-plugin')
const webpack = require('webpack')

const {
  configureEnvironmentsForPlugin,
} = require('./config/env')

const TITLE = 'Init.ai JS -- Dev'

const environments = new webpack.DefinePlugin(configureEnvironmentsForPlugin())

const config = {
  cache: true,

  entry: { initai: './src/index.js' },

  output: {
    path: path.resolve(__dirname, './dist'),
    filename: '[name].js',
    library: 'InitAI',
    libraryTarget: 'umd',
  },

  devtool: 'eval-source-map',

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [{ loader: 'babel-loader' }],
      },
      {
        test: /\.html$/,
        loader: 'handlebars-loader',
      },
    ],
  },

  resolve: {
    extensions: ['.js', '.json'],
  },

  plugins: [
    environments,

    new HtmlWebpackPlugin({
      template: 'dev/index.html',
      title: TITLE,
    }),

    new HtmlWebpackIncludeAssetsPlugin({
      assets: ['dev/index.js', 'node_modules/normalize.css/normalize.css', 'dev/style.css'],
      append: true,
    })
  ],
}

// Overwrite devtool/source maps for production
if (process.env.NODE_ENV === 'production') {
  config.cache = false
  config.devtool = 'source-map'
}

module.exports = config
