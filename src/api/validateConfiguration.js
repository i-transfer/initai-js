/* @flow */
import { isEmpty, isObject, isString } from 'lodash'
import { DOCS_URL } from '../util/constants'

const createInvalidation = (message: string) => ({
  valid: false,
  message: `${message}

  See: ${DOCS_URL}`,
})

const validateConfiguration = (
  config: APIClientConfig
): { valid: boolean, message?: string } => {
  if (!isObject(config)) {
    return createInvalidation('A valid configuration object is required.')
  }

  const { token } = config
  if (!isString(token) || isEmpty(token)) {
    return createInvalidation('A valid `token` string is required.')
  }

  return { valid: true }
}

export default validateConfiguration
