/* @flow */
import { decamelizeKeys } from 'humps'
import { isObject } from 'lodash'

import validateConfiguration from './validateConfiguration'
import validateMessageConfig from './validateMessageConfig'
import { logError } from '../util/logger'
import { isValidString } from '../util/validations'
import { ErrorTypes } from '../util/constants'

/**
 * `APIClient` creates a public API that allows browser clients to interact
 * with the Init.ai API.
 */
export class APIClient implements APIClientInterface {
  token: string
  baseUrl: string

  constructor(config: APIClientConfig) {
    // $FlowFixMe: Add typings to process.env
    this.baseUrl = config.baseUrl || process.env.API_BASE_URL
    this.token = config.token
  }

  getBaseUrl() {
    return this.baseUrl
  }

  getAuthHeaders() {
    return {
      authorization: `Bearer ${this.token}`,
    }
  }

  sendMessage(messageConfig: MessageConfig): Promise<SendMessageResult> {
    const error = validateMessageConfig(messageConfig)

    if (error) {
      // TODO: Add config to set log levels
      logError(error)
      return Promise.reject({
        message: 'Could not send message',
        type: ErrorTypes.VALIDATION_FAILURE,
      })
    }

    let { userId, contentType, content, senderRole } = messageConfig

    const url = `${this
      .baseUrl}/v1/users/${userId}/conversations/current/messages`

    if (contentType === 'image') {
      content = decamelizeKeys(content)
    }

    return fetch(url, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        content_type: contentType || 'text',
        content,
        sender_role: senderRole || 'end-user',
      }),
    }).then(response => {
      const { status, statusText } = response

      if (status === 200) {
        return response.json()
      } else {
        // TODO: Decide if we want to send any error data
        return Promise.reject({
          status,
          statusText,
          message: 'Your message could not be sent at this time',
        })
      }
    })
  }

  fetchMessages(userId: string): Promise<FetchMessagesResult> {
    if (!isValidString(userId)) {
      logError({
        message:
          'Invalid fetchMessages argument\n\nA valid userId String is required',
      })
      return Promise.reject({
        message: 'Could not fetch messages',
        type: ErrorTypes.VALIDATION_FAILURE,
      })
    }

    // TODO: Pagination?
    const url = `${this
      .baseUrl}/v1/users/${userId}/conversations/current/messages`

    return fetch(url, {
      headers: this.getAuthHeaders(),
    }).then(response => {
      const { status, statusText } = response

      if (status === 200) {
        return response.json()
      } else {
        return Promise.reject({
          status,
          statusText,
          message: `Could not fetch messages for user ${userId}`,
        })
      }
    })
  }

  fetchSuggestions(userId: string): Promise<SuggestionsResult> {
    if (!isValidString(userId)) {
      logError({
        message:
          'Invalid fetchSuggestions argument\n\nA valid userId String is required',
      })
      return Promise.reject({
        message: 'Could not fetch suggestions',
        type: ErrorTypes.VALIDATION_FAILURE,
      })
    }

    const url = `${this
      .baseUrl}/v1/users/${userId}/conversations/current/suggestions/current`

    return fetch(url, {
      headers: this.getAuthHeaders(),
    }).then(response => {
      const { status, statusText } = response

      if (status === 200) {
        return response.json()
      } else {
        // TODO: Decide if we want to send any error data
        return Promise.reject({
          status,
          statusText,
          message: `Could not fetch suggestions for user ${userId}`,
        })
      }
    })
  }

  triggerInboundEvent(eventConfig: InboundEvent): Promise<TriggerEventResult> {
    if (
      !eventConfig ||
      !isObject(eventConfig) ||
      !isValidString(eventConfig.userId) ||
      !isValidString(eventConfig.eventType) ||
      (eventConfig.data && !isObject(eventConfig.data))
    ) {
      logError({
        message:
          'Invalid triggerInboundEvent configuration\n\nA valid eventConfig Object is required\n\n• eventConfig.userId must be a valid String\n• eventConfig.eventType must be a valid String\n• eventConfig.data must be a valid Object (if present)',
      })

      return Promise.reject({
        message: 'Could not trigger inbound event',
        type: ErrorTypes.VALIDATION_FAILURE,
      })
    }

    const { userId, eventType, data } = eventConfig
    const url = `${this.baseUrl}/api/v1/webhook/event`

    return fetch(url, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        app_user_id: userId,
        event_type: eventType,
        data: data,
      }),
    }).then(response => {
      const { status, statusText } = response

      if (status === 200) {
        return response.json()
      } else {
        // TODO: Decide if we want to send any error data
        return Promise.reject({
          status,
          statusText,
          message: 'Your event could not be sent at this time',
        })
      }
    })
  }
}

const createAPIClient = (config: APIClientConfig): APIClient => {
  const { valid, message } = validateConfiguration(config)

  if (valid) {
    return new APIClient(config)
  } else {
    throw new Error(message)
  }
}

export default createAPIClient
