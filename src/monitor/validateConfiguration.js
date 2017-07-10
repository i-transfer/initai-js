/* @flow */
import { isEmpty, isObject, isString } from 'lodash'

import { DOCS_URL } from '../util/constants'

const createInvalidation = (message: string) => ({
  valid: false,
  message: `${message}

  See: ${DOCS_URL}`,
})

const validateConfiguration = (
  config: MonitorConfig
): { valid: boolean, message?: string } => {
  if (!isObject(config)) {
    return createInvalidation('A valid configuration object is required.')
  }

  const { apiClient, userId } = config
  if (!isString(userId) || isEmpty(userId)) {
    return createInvalidation('A valid `userId` string is required.')
  }

  if (!apiClient || !apiClient.getBaseUrl || !apiClient.getAuthHeaders) {
    return createInvalidation('A valid `apiClient` is required.')
  }

  return { valid: true }
}

export default validateConfiguration
