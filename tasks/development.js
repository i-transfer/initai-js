const chalk = require('chalk')
const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')
const openBrowser = require('react-dev-utils/openBrowser')

const config = require('../webpack.config')
const {PORT = 4433, HOST = 'localhost', HTTPS = false} = process.env
const PROTOCOL = HTTPS ? 'https' : 'http'
const URL = `${PROTOCOL}://${HOST}:${PORT}`
const LOG_PREFIX = chalk.gray.bold('|')
const log = (...args) => console.log.apply(console, [LOG_PREFIX].concat(args))

const configureCompiler = config => {
  // Write `hmr` (Hot Module Replacement) client to entry
  config.entry.hmr = require.resolve('react-dev-utils/webpackHotDevClient')

  return webpack(config)
}

const getDevServerConfig = () => ({
  host: HOST,
  hot: true,
  https: PROTOCOL === HTTPS,
  overlay: false,
  port: PORT,
  stats: 'minimal',
})

const server = new WebpackDevServer(
  configureCompiler(config),
  getDevServerConfig()
)

server.listen(PORT, (err) => {
  if (err) {
    return console.log(chalk.red.bold('[ERROR]:'), err)
  }

  log(chalk.cyan('Launching'), chalk.yellow.underline(URL))
  openBrowser(URL)
})
