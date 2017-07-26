/* @flow */
import { isEmpty, isString } from 'lodash'
import query from 'querystring'

import Pusher from 'pusher-js'

import validateConfiguration from './validateConfiguration'

/**
 * MonitorClient creates a public API that allows clients to subscribe to
 * realtime events in Init.ai conversations.
 *
 * A `MonitorClient` is provided with an `APIClient` which is capapble of
 * negotiating a socket presence with the Init.ai API.
 */
export class MonitorClient {
  bus: Map<string, Function[]>
  userId: string
  pusherAppKey: string
  pusherClient: PusherClient
  pusherChannel: PusherChannel
  apiClient: APIClientInterface

  constructor(config: MonitorConfig) {
    this.apiClient = config.apiClient
    this.userId = config.userId
    // $FlowFixMe: Add typings to process.env
    this.pusherAppKey = config.pusherAppKey || process.env.PUSHER_APP_KEY

    this.configurePusherClient()
    this.subscribeToChannel()

    this.bus = new Map()
  }

  configurePusherClient() {
    this.pusherClient = new Pusher(this.pusherAppKey, {
      authorizer: channel => {
        return {
          authorize: (socketId, callback) => {
            const url = `${this.apiClient.getBaseUrl()}/v1/users/${this
              .userId}/auth_pusher_channel`
            const headers = Object.assign({}, this.apiClient.getAuthHeaders(), {
              'content-type': 'application/x-www-form-urlencoded',
            })

            fetch(url, {
              method: 'POST',
              headers,
              body: query.stringify({
                socket_id: socketId,
                channel_name: channel.name,
              }),
            }).then(response => {
              if (response.status === 200) {
                response.json().then(payload => {
                  callback(false, payload)
                })
              } else {
                callback(true, {
                  status: response.status,
                  statusText: response.statusText,
                  message: 'Could not authenticate channel subscription',
                })
              }
            })
          },
        }
      },
      encrypted: true,
    })
  }

  subscribeToChannel() {
    const channelName = `presence-app_user-${this.userId}`

    this.pusherChannel = this.pusherClient.subscribe(channelName)

    this.pusherChannel.bind('pusher:subscription_error', error => {
      console.error(`[initai-js:error]: ${error.message}`)
    })

    this.pusherChannel.bind('suggestions:new', this.handleNewSuggestions, this)
  }

  handleNewSuggestions() {
    this.apiClient
      .fetchSuggestions(this.userId)
      .then(payload => {
        this.trigger('suggestions:new', payload)
      })
      .catch(error => console.error(`[initai-js:error]: ${error.message}`))
  }

  trigger(eventName: string, payload: any) {
    const events = this.bus.get(eventName)

    if (events && events.length) {
      events.forEach(handler => handler(payload))
    } else {
      console.warn(`[initai-js:warning]: No handlers found for ${eventName}`)
    }
  }

  /**
   * Subscribe to a specific event
   */
  on(eventName: string, handler: Function): void {
    // TODO: Validate event names
    if (!isString(eventName) || isEmpty(eventName)) {
      throw new Error('A valid eventName string must be provided')
    }

    if (!handler) {
      throw new Error('A valid handler function must be provided')
    }

    this.bus.set(eventName, (this.bus.get(eventName) || []).concat(handler))
  }

  /**
   * Unsubscribe from events
   *
   * This allows:
   *
   *   - unsubscribe from _all_ events (no args)
   *   - unsubscribe a single handler from a specific event
   *   - unsubscribe all handlers from a specific event
   */
  off(eventName?: string, handler?: Function): void {
    if (!eventName) {
      this.bus.clear()
    }

    if (eventName && handler) {
      this.bus.set(
        eventName,
        (this.bus.get(eventName) || []).filter(h => h !== handler)
      )
    } else if (eventName) {
      this.bus.delete(eventName)
    }

    if (eventName) {
      const handlers = this.bus.get(eventName)
      if (handlers && handlers.length === 0) {
        this.bus.delete(eventName)
      }
    }
  }

  destroy() {
    if (this.pusherChannel) {
      this.pusherChannel.unbind()
    }

    if (this.pusherClient) {
      this.pusherClient.disconnect()
    }

    this.bus.clear()
  }
}

/**
 * `createMonitorClient` allows for asynchronous instantiation of a `MonitorClient`.
 */
const createMonitorClient = (config: MonitorConfig): Promise<MonitorClient> =>
  new Promise((resolve, reject) => {
    const { valid, message } = validateConfiguration(config)

    if (valid) {
      resolve(new MonitorClient(config))
    } else {
      reject({ message })
    }
  })

export default createMonitorClient
