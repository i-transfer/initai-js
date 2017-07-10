/**
 * Development testing environment!!!!!!!!
 */

const LS_PREFIX = '__initai__'

// Config container
const storeValueOnChange = element => {
  const changeEvents = ['keyup', 'paste', 'cut', 'change']

  changeEvents.forEach(evt => {
    element.addEventListener(evt, event => {
      requestIdleCallback(() => {
        localStorage.setItem(`${LS_PREFIX}${element.id}`, event.target.value)
      })
    })
  })
}
const ConfigApp = () => {
  const root = document.querySelector('#configContainer')
  const fieldIds = ['jwt', 'userId']

  fieldIds.forEach(id => {
    const node = root.querySelector(`#${id}`)

    // Populate initial value
    node.value = localStorage.getItem(`${LS_PREFIX}${id}`) || ''

    // Add listenter to store value on change
    storeValueOnChange(node)
  })
}
const getConfigItem = id => {
  const value = document.querySelector(`#${id}`).value

  if (value) {
    return value
  }

  throw new Error(`No value found for #${id}`)
}
const getJWT = () => getConfigItem('jwt')
const getUserId = () => getConfigItem('userId')

ConfigApp()

// Custom logger
const log = (...args) =>
  console.log.apply(
    console,
    ['%c|_DEV_|', 'color: rgb(76, 113, 239); font-weight: bold;'].concat(args)
  )
const OUTPUT_LOGGER = document.querySelector('#outputLogger')
const writeLog = log => {
  const entry = document.createElement('div')
  entry.className = 'logEntry'

  entry.innerHTML = log

  OUTPUT_LOGGER.appendChild(entry)
}
const handleError = err => log('[Error]:', err)

// API Client testing
const APIClientApp = (apiClient, suggestedMessagesApp) => {
  const root = document.querySelector('#apiClientContainer')
  const suggestedMessagesOutlet = document.querySelector(
    '#suggestedMessagesOutlet'
  )

  const composeMessage = (type, userId, senderRole) => {
    switch (type) {
      case 'text':
        return {
          contentType: 'text',
          content: `Messsage from initai-js dev env: ${Date.now()}`,
          userId,
          senderRole,
        }
        break
      case 'image':
        return {
          content: {
            alternativeText: 'Holy cow!',
            imageUrl:
              'https://s3.amazonaws.com/kdd-public-images/cubfanbudman.jpg',
            mimeType: 'image/png',
          },
          contentType: 'image',
          userId,
          senderRole,
        }
        break
      case 'postback-action':
        return {
          content: {
            text: 'Order accepted',
            data: { orderNumber: 123, status: 'accepted' },
            stream: 'handleCompletedOrder',
          },
          contentType: 'postback-action',
          userId,
          senderRole,
        }
        break
    }
  }

  root.addEventListener('click', event => {
    const type = root.querySelector('#messageType').value
    const userId = getUserId()

    const errorHandler = err => log('ERROR', err)

    switch (event.target.id) {
      case 'sendMessage-agent':
        apiClient
          .sendMessage(composeMessage(type, userId, 'agent'))
          .then(result => log('RESULT', result))
          .catch(errorHandler)
        break
      case 'sendMessage-end-user':
        apiClient
          .sendMessage(composeMessage(type, userId, 'end-user'))
          .then(result => log('RESULT', result))
          .catch(errorHandler)
        break
      case 'sendMessage-app':
        apiClient
          .sendMessage(composeMessage(type, userId, 'app'))
          .then(result => log('RESULT', result))
          .catch(errorHandler)
        break
      case 'sendEvent':
        log('TODO: trigger event via Inbound Events API')
        break
      case 'fetchMessages':
        apiClient
          .fetchMessages(userId)
          .then(result => log('MESSAGES:', result))
          .catch(errorHandler)
      case 'fetchSuggestions':
        suggestedMessagesApp.updateSuggestedMessages()
    }
  })
}

// Monitor Client testing
const MonitorClientApp = (monitor, suggestedMessagesApp) => {
  const root = document.querySelector('#monitorClientContainer')

  monitor.on('suggestions:new', eventData => {
    log('suggestions:new', eventData)

    suggestedMessagesApp.pushSuggestedMessages(eventData)
  })
}

const createSuggestedMessagesApp = apiClient => ({
  root: document.querySelector('#suggestedMessagesContainer'),

  render(suggestions) {
    if (suggestions && suggestions.length > 0) {
      const frag = document.createDocumentFragment()

      suggestions.forEach(suggestion => {
        const div = document.createElement('div')
        div.className = 'suggestedMessage'

        div.innerHTML = JSON.stringify(suggestion, null, 2)

        frag.appendChild(div)
      })

      requestIdleCallback(() => {
        this.root.innerHTML = ''
        this.root.appendChild(frag)
      })
    } else {
      this.root.innerHTML = 'No suggested messages'
    }
  },

  pushSuggestedMessages({ suggestions }) {
    this.render(suggestions)
  },

  updateSuggestedMessages() {
    this.root.innerHTML = 'fetching...'

    requestIdleCallback(() => {
      apiClient
        .fetchSuggestions(getUserId())
        .then(({ suggestions }) => this.render(suggestions))
        .catch(err => log('ERR', err))
    })
  },
})

// Run monitor and client apps
const Run = apiClient => monitorClient => {
  const suggestedMessagesApp = createSuggestedMessagesApp(apiClient)
  suggestedMessagesApp.updateSuggestedMessages()

  APIClientApp(apiClient, suggestedMessagesApp)
  MonitorClientApp(monitorClient, suggestedMessagesApp)
}

// Bootstrap API and Monitor clients
const apiClient = InitAI.createAPIClient({ token: getJWT() })

InitAI.createMonitorClient({ apiClient, userId: getUserId() })
  .then(Run(apiClient))
  .catch(e => console.error('::', e))
