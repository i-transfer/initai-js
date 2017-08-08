const path = require('path')
const objectAssign = require('object-assign-deep')

const base = require('./webpack.base')

const nodeConfig = objectAssign(base, {
  output: {
    library: 'InitAI',
    libraryTarget: 'commonjs2',
    path: path.join(__dirname, '../dist/node'),
    filename: 'initai.js',
  },
  target: 'node',
})

delete nodeConfig.devtool

module.exports = nodeConfig
