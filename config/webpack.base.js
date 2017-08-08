const path = require('path')
const webpack = require('webpack')

const { configureEnvironmentsForPlugin } = require('./env')

const environments = new webpack.DefinePlugin(configureEnvironmentsForPlugin())

const config = {
  cache: true,

  entry: { initai: path.resolve(__dirname, '../src/index.js') },

  devtool: 'eval-source-map',

  module: {
    rules: [
      // Suppress:
      // WARNING in ./node_modules/encoding/lib/iconv-loader.js
      // 9:12-34 Critical dependency: the request of a dependency is an expression
      // via: https://github.com/webpack/webpack/issues/3078
      {
        test: path.resolve(__dirname, '../node_modules/encoding/lib/iconv-loader.js'),
        use: 'null-loader'
      },
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

  plugins: [environments],
}

// Overwrite devtool/source maps for production
if (process.env.NODE_ENV === 'production') {
  config.cache = false
  config.devtool = 'source-map'
}

module.exports = config
