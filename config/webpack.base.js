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
