const {
  API_BASE_URL = 'https://api.init.ai',
  PUSHER_APP_KEY = '843e8669f81757d7abc3',
} = process.env

const VERSION = require('../package.json').version

function getEnvironmentsMap() {
  return { API_BASE_URL, PUSHER_APP_KEY, VERSION }
}

// This is the Object that will be returned to the DefinePlugin
function configureEnvironmentsForPlugin() {
  const env = getEnvironmentsMap()

  return Object.keys(env).reduce(
    (envMap, envVar) => {
      envMap['process.env'][envVar] = JSON.stringify(env[envVar])
      return envMap
    },
    { 'process.env': {} }
  )
}

module.exports = { configureEnvironmentsForPlugin, getEnvironmentsMap }
