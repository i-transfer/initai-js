// @flow
type Error = {
  message: string,
} | null

import { isObject, isString } from 'lodash'

import { isValidString } from '../util/validations'

import { MessageContentTypes, MessageSenderRoles } from '../util/constants'

const composeError = message => ({
  message: `Invalid sendMessage configuration\n\n${message}`,
})

const validateMessageConfig = (messageConfig: MessageConfig): Error => {
  if (!isObject(messageConfig)) {
    return composeError('A valid message configuration Object is required')
  }

  const { userId, contentType, content, senderRole } = messageConfig

  if (!isValidString(userId)) {
    return composeError('A valid userId string is required')
  }

  if (
    contentType &&
    isString(contentType) &&
    Object.values(MessageContentTypes).indexOf(contentType) === -1
  ) {
    return composeError(
      'A valid contentType is required. Use: "text", "image", or "postback-action"'
    )
  }

  switch (contentType) {
    case MessageContentTypes.TEXT: {
      if (!isValidString(content)) {
        return composeError(
          'Message type of "text" requires a valid String for "content"'
        )
      }

      if (
        isString(senderRole) &&
        Object.values(MessageSenderRoles).indexOf(senderRole) === -1
      ) {
        return composeError(
          'A valid "senderRole" is required. Use: "agent", "app", or "end-user"'
        )
      }

      break
    }
    case MessageContentTypes.IMAGE: {
      if (
        !isObject(content) ||
        // $FlowFixMe
        !isValidString(content.imageUrl) ||
        (content.alternativeText &&
          !isValidString(content.alternativeText || '')) ||
        // $FlowFixMe
        !isValidString(content.mimeType)
      ) {
        return composeError(
          'Message type of "image" requires a valid "content" Object\n\n• content.imageURL must be a valid String\n• content.alternativeText must be a valid String\n• content.mimeType must be a valid String'
        )
      }

      break
    }
    case MessageContentTypes.POSTBACK_ACTION: {
      if (
        !isObject(content) ||
        // $FlowFixMe
        !isValidString(content.text) ||
        (content.data &&
          !(isValidString(content.data) || isObject(content.data))) ||
        // $FlowFixMe
        !isValidString(content.stream)
      ) {
        return composeError(
          'Message type of "postback-action" requires a valid "content" Object\n\n• content.text must be a valid String\n• content.data must be a valid String or Object\n• content.stream must be a valid String'
        )
      }
    }
  }

  return null
}

export default validateMessageConfig
