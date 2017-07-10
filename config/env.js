// TODO: This could probably live in configuration files
const apiBaseUrl = {
  staging: 'https://s-api.init.ai',
  production: 'https://api.init.ai',
}

const pusherAppKey = {
  staging: 'ce5c19b1b1625e9abace',
  production: '2364df9cc5d7b637fb5d',
}

// Destructure API and NODE_ENV for use in fallback/profiles declared above
const { API = 'staging' } = process.env
const {
  API_BASE_URL = apiBaseUrl[API],
  NODE_ENV = 'development',
  PUSHER_APP_KEY = pusherAppKey[API],
} = process.env

const VERSION = require('../package.json').version

function getEnvironmentsMap() {
  return { API_BASE_URL, NODE_ENV, PUSHER_APP_KEY, VERSION }
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
