import fetchMock from 'fetch-mock'

import createAPIClient, { APIClient } from './'
import * as logger from '../util/logger'

import { v4 } from 'uuid'

describe('createAPIClient', () => {
  it('returns an APIClient', () => {
    const token = v4()

    expect(createAPIClient({ token })).toBeInstanceOf(APIClient)
  })

  describe('invalid config', () => {
    it('throws an Error on missing config', () => {
      const run = () => createAPIClient()

      expect(run).toThrow()
    })

    it('throws on missing token', () => {
      const run = () => createAPIClient({ foo: 'bar' })

      expect(run).toThrow()
    })

    it('throws on empty or invalid token', () => {
      const tokens = ['', undefined, null, false, () => {}, 22]

      tokens.forEach(token => {
        const run = () => createAPIClient({ token })

        expect(run).toThrow()
      })
    })
  })
})

describe('APIClient', () => {
  let logErrorSpy

  beforeEach(() => {
    logErrorSpy = jest.spyOn(logger, 'logError').mockImplementation(() => {})
  })

  afterEach(() => {
    logErrorSpy.mockReset()
    logErrorSpy.mockRestore()
    fetchMock.restore()
  })

  describe('constructor', () => {
    it('assigns props', () => {
      const fakeToken = v4()
      const apiClient = new APIClient({ token: fakeToken })

      expect(apiClient.token).toEqual(fakeToken)
      expect(apiClient.baseUrl).toEqual(process.env.API_BASE_URL)
    })
  })

  describe('getAuthHeaders', () => {
    it('returns headers object', () => {
      const fakeToken = v4()
      const apiClient = new APIClient({ token: fakeToken })

      expect(apiClient.getAuthHeaders()).toEqual({
        authorization: `Bearer ${fakeToken}`,
      })
    })
  })

  describe('sendMessage', () => {
    it('applies conversationId', () => {
      const fakeToken = v4()
      const apiClient = new APIClient({ token: fakeToken })
      const fakeUserId = v4()
      const fakeConversationId = v4()
      const url = `${apiClient.getBaseUrl()}/v1/users/${fakeUserId}/conversations/${fakeConversationId}/messages`

      const messageSuccessBody = {
        content: 'Test message',
        content_type: 'text',
        created_at: '2017-06-21T15:01:09.612765Z',
        direction: 'in',
        id: 'e5f7608d-3117-4d26-6194-cc8540227f87',
        sender_role: 'end-user',
        sender_type: 'human',
        source_type: 'ip',
        updated_at: '2017-06-21T15:01:09.612765Z',
      }

      const fakeMesageRequest = {
        content: 'Test message',
        contentType: 'text',
        conversationId: fakeConversationId,
        userId: fakeUserId,
      }

      fetchMock.mock(url, {
        method: 'POST',
        body: messageSuccessBody,
      })

      const result = apiClient.sendMessage(fakeMesageRequest)
      const lastCallConfig = fetchMock.lastCall(url)[1]

      expect(lastCallConfig.headers).toEqual({
        authorization: `Bearer ${fakeToken}`,
      })

      expect(lastCallConfig.body).toEqual(
        JSON.stringify({
          content_type: 'text',
          content: 'Test message',
          sender_role: 'end-user',
        })
      )

      return expect(result).resolves.toEqual(messageSuccessBody)
    })

    it('sends a text message', () => {
      const fakeToken = v4()
      const apiClient = new APIClient({ token: fakeToken })
      const fakeUserId = v4()
      const url = `${apiClient.getBaseUrl()}/v1/users/${fakeUserId}/conversations/current/messages`

      const messageSuccessBody = {
        content: 'Test message',
        content_type: 'text',
        created_at: '2017-06-21T15:01:09.612765Z',
        direction: 'in',
        id: 'e5f7608d-3117-4d26-6194-cc8540227f87',
        sender_role: 'end-user',
        sender_type: 'human',
        source_type: 'ip',
        updated_at: '2017-06-21T15:01:09.612765Z',
      }

      const fakeMesageRequest = {
        content: 'Test message',
        contentType: 'text',
        userId: fakeUserId,
      }

      fetchMock.mock(url, {
        method: 'POST',
        body: messageSuccessBody,
      })

      const result = apiClient.sendMessage(fakeMesageRequest)
      const lastCallConfig = fetchMock.lastCall(url)[1]

      expect(lastCallConfig.headers).toEqual({
        authorization: `Bearer ${fakeToken}`,
      })

      expect(lastCallConfig.body).toEqual(
        JSON.stringify({
          content_type: 'text',
          content: 'Test message',
          sender_role: 'end-user',
        })
      )

      return expect(result).resolves.toEqual(messageSuccessBody)
    })

    it('defaults to sending a text message', () => {
      const fakeToken = v4()
      const apiClient = new APIClient({ token: fakeToken })
      const fakeUserId = v4()
      const url = `${apiClient.getBaseUrl()}/v1/users/${fakeUserId}/conversations/current/messages`

      const messageSuccessBody = {
        content: 'Test message',
        content_type: 'text',
        created_at: '2017-06-21T15:01:09.612765Z',
        direction: 'in',
        id: 'e5f7608d-3117-4d26-6194-cc8540227f87',
        sender_role: 'end-user',
        sender_type: 'human',
        source_type: 'ip',
        updated_at: '2017-06-21T15:01:09.612765Z',
      }

      const fakeMesageRequest = {
        content: 'Test message',
        userId: fakeUserId,
      }

      fetchMock.mock(url, {
        method: 'POST',
        body: messageSuccessBody,
      })

      const result = apiClient.sendMessage(fakeMesageRequest)
      const lastCallConfig = fetchMock.lastCall(url)[1]

      expect(lastCallConfig.headers).toEqual({
        authorization: `Bearer ${fakeToken}`,
      })

      expect(lastCallConfig.body).toEqual(
        JSON.stringify({
          content_type: 'text',
          content: 'Test message',
          sender_role: 'end-user',
        })
      )

      return expect(result).resolves.toEqual(messageSuccessBody)
    })

    it('sends an image message', () => {
      const fakeToken = v4()
      const apiClient = new APIClient({ token: fakeToken })
      const fakeUserId = v4()
      const url = `${apiClient.getBaseUrl()}/v1/users/${fakeUserId}/conversations/current/messages`

      const messageSuccessBody = {
        content:
          '{"alternative_text":"Holy cow!","image_url":"http://some.img","mime_type":"imag/png"}',
        content_type: 'image',
        created_at: '2017-06-21T15:06:08.71557Z',
        direction: 'in',
        id: '0d9dcf10-3adb-4c66-5173-fde5728418d0',
        sender_role: 'app',
        sender_type: 'human',
        source_type: 'ip',
        updated_at: '2017-06-21T15:06:08.71557Z',
      }

      const fakeMesageRequest = {
        userId: fakeUserId,
        content: {
          alternativeText: 'Holy cow!',
          imageUrl: 'http://some.img',
          mimeType: 'image/png',
        },
        contentType: 'image',
      }

      fetchMock.mock(url, {
        method: 'POST',
        body: messageSuccessBody,
      })

      const result = apiClient.sendMessage(fakeMesageRequest)
      const lastCallConfig = fetchMock.lastCall(url)[1]

      expect(lastCallConfig.headers).toEqual({
        authorization: `Bearer ${fakeToken}`,
      })

      expect(lastCallConfig.body).toEqual(
        JSON.stringify({
          content_type: 'image',
          content: {
            alternative_text: 'Holy cow!',
            image_url: 'http://some.img',
            mime_type: 'image/png',
          },
          sender_role: 'end-user',
        })
      )

      return expect(result).resolves.toEqual(messageSuccessBody)
    })

    it('sends a postback message', () => {
      const fakeToken = v4()
      const apiClient = new APIClient({ token: fakeToken })
      const fakeUserId = v4()
      const url = `${apiClient.getBaseUrl()}/v1/users/${fakeUserId}/conversations/current/messages`

      const messageSuccessBody = {
        id: 'c485e9dc-c50d-4f82-438f-88afea3f2f2c',
        direction: 'in',
        sender_type: 'human',
        sender_role: 'app',
        content_type: 'postback',
        content:
          '{"version":"1","payload":{"text":"Order accepted","payload":"{\\"data\\":{\\"order_number\\":123,\\"status\\":\\"accepted\\"},\\"version\\":\\"1\\",\\"stream\\":\\"handleCompletedOrder\\"}"}}',
        source_type: 'ip',
        created_at: '2017-06-21T15:20:14.009683Z',
        updated_at: '2017-06-21T15:20:14.009683Z',
      }

      const fakeMesageRequest = {
        userId: fakeUserId,
        content: {
          text: 'Order accepted',
          data: { orderNumber: 123, status: 'accepted' },
          stream: 'handleCompletedOrder',
        },
        contentType: 'postback-action',
      }

      fetchMock.mock(url, {
        method: 'POST',
        body: messageSuccessBody,
      })

      const result = apiClient.sendMessage(fakeMesageRequest)
      const lastCallConfig = fetchMock.lastCall(url)[1]

      expect(lastCallConfig.headers).toEqual({
        authorization: `Bearer ${fakeToken}`,
      })

      expect(lastCallConfig.body).toEqual(
        JSON.stringify({
          content_type: 'postback-action',
          content: {
            text: 'Order accepted',
            data: { orderNumber: 123, status: 'accepted' },
            stream: 'handleCompletedOrder',
          },
          sender_role: 'end-user',
        })
      )

      return expect(result).resolves.toEqual(messageSuccessBody)
    })

    it('respects sender role', () => {
      const roles = ['app', 'agent']
      const fakeToken = v4()
      const apiClient = new APIClient({ token: fakeToken })
      const fakeUserId = v4()
      const url = `${apiClient.getBaseUrl()}/v1/users/${fakeUserId}/conversations/current/messages`

      fetchMock.mock(url, {
        method: 'POST',
        body: {},
      })

      roles.forEach(role => {
        const fakeMesageRequest = {
          content: 'Test message',
          contentType: 'text',
          userId: fakeUserId,
          senderRole: role,
        }

        apiClient.sendMessage(fakeMesageRequest)

        const lastCallConfig = fetchMock.lastCall(url)[1]

        return expect(lastCallConfig.body).toEqual(
          JSON.stringify({
            content_type: 'text',
            content: 'Test message',
            sender_role: role,
          })
        )
      })
    })

    describe('rejections', () => {
      describe('invalid configuration', () => {
        it('rejects if user id is missing', () => {
          const client = new APIClient({ token: v4() })
          const rejection = client.sendMessage({})

          expect(logErrorSpy).toHaveBeenCalledWith({
            message:
              'Invalid sendMessage configuration\n\nA valid userId string is required',
          })

          return expect(rejection).rejects.toEqual({
            message: 'Could not send message',
            type: 'Validation failure',
          })
        })

        const textMessageConfigurations = [
          {
            contentType: 'text',
            content: 12,
            userId: v4(),
          },
          {
            contentType: 'text',
            content: null,
            userId: v4(),
          },
          {
            contentType: 'text',
            content: '',
            userId: v4(),
          },
          {
            contentType: 'text',
            content: [],
            userId: v4(),
          },
          {
            contentType: 'text',
            content: {},
            userId: v4(),
          },
          {
            contentType: 'text',
            content: () => {},
            userId: v4(),
          },
          {
            contentType: 'text',
            content: true,
            userId: v4(),
          },
          {
            contentType: 'text',
            userId: v4(),
          },
        ]

        textMessageConfigurations.forEach(config => {
          it(`rejects if text message is misconfigured: ${JSON.stringify(
            config.content
          )}`, () => {
            const client = new APIClient({ token: v4() })
            const rejection = client.sendMessage(config)

            expect(logErrorSpy).toHaveBeenCalledWith({
              message:
                'Invalid sendMessage configuration\n\nMessage type of "text" requires a valid String for "content"',
            })

            return expect(rejection).rejects.toEqual({
              message: 'Could not send message',
              type: 'Validation failure',
            })
          })
        })

        const imageMessgeConfigurations = [
          {
            contentType: 'image',
            content: 'foo',
            userId: v4(),
          },
          {
            contentType: 'image',
            content: {},
            userId: v4(),
          },
          {
            contentType: 'image',
            content: null,
            userId: v4(),
          },
          {
            contentType: 'image',
            userId: v4(),
          },
          {
            contentType: 'image',
            content: [],
            userId: v4(),
          },
          {
            contentType: 'image',
            content: false,
            userId: v4(),
          },
          {
            contentType: 'image',
            content: () => {},
            userId: v4(),
          },
          {
            contentType: 'image',
            content: {
              alternativeText: '',
              imageURL: null,
              mimeType: '',
            },
            userId: v4(),
          },
          {
            contentType: 'image',
            content: {
              alternativeText: '',
              imageURL: 'https://foo.img',
              mimeType: 'image/png',
            },
            userId: v4(),
          },
          {
            contentType: 'image',
            content: {
              imageURL: 'https://foo.img',
              mimeType: '',
            },
            userId: v4(),
          },
          {
            contentType: 'image',
            content: {
              imageURL: 'https://foo.img',
            },
            userId: v4(),
          },
        ]

        imageMessgeConfigurations.forEach(config => {
          it(`rejects if image message is misconfigured: ${JSON.stringify(
            config.content
          )}`, () => {
            const client = new APIClient({ token: v4() })
            const rejection = client.sendMessage(config)

            expect(logErrorSpy).toHaveBeenCalledWith({
              message:
                'Invalid sendMessage configuration\n\nMessage type of "image" requires a valid "content" Object\n\n• content.imageURL must be a valid String\n• content.alternativeText must be a valid String\n• content.mimeType must be a valid String',
            })

            return expect(rejection).rejects.toEqual({
              message: 'Could not send message',
              type: 'Validation failure',
            })
          })
        })

        const postbackMessageConfigurations = [
          {
            contentType: 'postback-action',
            userId: v4(),
          },
          {
            contentType: 'postback-action',
            content: '',
            userId: v4(),
          },
          {
            contentType: 'postback-action',
            content: () => {},
            userId: v4(),
          },
          {
            contentType: 'postback-action',
            content: [],
            userId: v4(),
          },
          {
            contentType: 'postback-action',
            content: null,
            userId: v4(),
          },
          {
            contentType: 'postback-action',
            content: 22,
            userId: v4(),
          },
          {
            contentType: 'postback-action',
            content: { data: 22 },
            userId: v4(),
          },
          {
            contentType: 'postback-action',
            content: { data: false },
            userId: v4(),
          },
          {
            contentType: 'postback-action',
            content: { data: 'dd', stream: null },
            userId: v4(),
          },
        ]

        postbackMessageConfigurations.forEach(config => {
          it(`rejects if postback message is misconfigured: ${JSON.stringify(
            config.content
          )}`, () => {
            const client = new APIClient({ token: v4() })
            const rejection = client.sendMessage(config)

            expect(logErrorSpy).toHaveBeenCalledWith({
              message:
                'Invalid sendMessage configuration\n\nMessage type of "postback-action" requires a valid "content" Object\n\n• content.text must be a valid String\n• content.data must be a valid String or Object\n• content.stream must be a valid String',
            })

            return expect(rejection).rejects.toEqual({
              message: 'Could not send message',
              type: 'Validation failure',
            })
          })
        })
      })

      describe('failed response', () => {
        it('rejects if API request fails', () => {
          const fakeToken = v4()
          const apiClient = new APIClient({ token: fakeToken })
          const fakeUserId = v4()
          const url = `${apiClient.getBaseUrl()}/v1/users/${fakeUserId}/conversations/current/messages`

          const fakeMesageRequest = {
            content: 'Test message',
            contentType: 'text',
            userId: fakeUserId,
          }

          fetchMock.mock(url, {
            method: 'POST',
            status: 401,
          })

          return expect(
            apiClient.sendMessage(fakeMesageRequest)
          ).rejects.toEqual({
            message: 'Your message could not be sent at this time',
            status: 401,
            statusText: 'Unauthorized',
          })
        })
      })
    })
  })

  describe('fetchMessages', () => {
    describe('rejections', () => {
      const invalidUserIds = [
        {
          value: '',
          description: 'empty string',
        },
        {
          value: 22,
          description: 'number',
        },
        {
          value: [],
          description: 'array',
        },
        {
          value: {},
          description: 'object',
        },
        {
          value: false,
          description: 'boolean',
        },
        {
          value: () => {},
          description: 'function',
        },
        {
          value: null,
          description: 'null',
        },
      ]

      invalidUserIds.forEach(({ value, description }) => {
        it(`rejects if userId is ${description}`, () => {
          const client = new APIClient({ token: v4() })
          const rejection = client.fetchMessages(value)

          expect(logErrorSpy).toHaveBeenCalledWith({
            message:
              'Invalid fetchMessages argument\n\nA valid userId String is required',
          })

          return expect(rejection).rejects.toEqual({
            message: 'Could not fetch messages',
            type: 'Validation failure',
          })
        })
      })
    })

    it('returns empty messages list', () => {
      const fakeToken = v4()
      const apiClient = new APIClient({ token: fakeToken })
      const fakeUserId = v4()
      const url = `${apiClient.getBaseUrl()}/v1/users/${fakeUserId}/conversations/current/messages`

      const fetchMessagesSuccessBody = {
        messages: [],
        pagination: {
          next_page_before_id: 'a1192157-0021-479c-572c-1f1f21122895',
          page_size: 100,
          remaining_page_count: 2,
          current_page_url: `${apiClient.getBaseUrl()}/v1/users/${fakeUserId}/conversations/current/messages?page_before_id=&page_size=100`,
          first_page_url: `${apiClient.getBaseUrl()}/v1/users/${fakeUserId}/conversations/current/messages?&page_size=100`,
          next_page_url: `${apiClient.getBaseUrl()}/v1/users/${fakeUserId}/conversations/current/messages?page_before_id=someId&page_size=100`,
        },
      }

      fetchMock.mock(url, {
        body: fetchMessagesSuccessBody,
      })

      const result = apiClient.fetchMessages(fakeUserId)
      const lastCallConfig = fetchMock.lastCall(url)[1]

      expect(lastCallConfig.headers).toEqual({
        authorization: `Bearer ${fakeToken}`,
      })

      return expect(result).resolves.toEqual(fetchMessagesSuccessBody)
    })

    it('returns messages', () => {
      const fakeToken = v4()
      const apiClient = new APIClient({ token: fakeToken })
      const fakeUserId = v4()
      const url = `${apiClient.getBaseUrl()}/v1/users/${fakeUserId}/conversations/current/messages`

      const createFakeMessage = id => ({
        id,
        direction: 'in',
        sender_role: 'end-user',
        content_type: 'text',
        content: 'A message',
        created_at: new Date(),
        updated_at: new Date(),
      })

      const fetchMessagesSuccessBody = {
        messages: JSON.stringify([
          createFakeMessage(v4()),
          createFakeMessage(v4()),
        ]),
        pagination: {
          next_page_before_id: 'a1192157-0021-479c-572c-1f1f21122895',
          page_size: 100,
          remaining_page_count: 2,
          current_page_url: `${apiClient.getBaseUrl()}/v1/users/${fakeUserId}/conversations/current/messages?page_before_id=&page_size=100`,
          first_page_url: `${apiClient.getBaseUrl()}/v1/users/${fakeUserId}/conversations/current/messages?&page_size=100`,
          next_page_url: `${apiClient.getBaseUrl()}/v1/users/${fakeUserId}/conversations/current/messages?page_before_id=someId&page_size=100`,
        },
      }

      fetchMock.mock(url, {
        body: fetchMessagesSuccessBody,
      })

      const result = apiClient.fetchMessages(fakeUserId)
      const lastCallConfig = fetchMock.lastCall(url)[1]

      expect(lastCallConfig.headers).toEqual({
        authorization: `Bearer ${fakeToken}`,
      })

      return expect(result).resolves.toEqual(fetchMessagesSuccessBody)
    })
  })

  describe('triggerInboundEvent', () => {
    it('triggers an event', () => {
      const fakeToken = v4()
      const apiClient = new APIClient({ token: fakeToken })
      const fakeUserId = v4()
      const url = `${apiClient.getBaseUrl()}/api/v1/webhook/event`

      const eventSuccessBody = {
        body: 'Event accepted.',
        error: null,
      }

      const fakeEventRequest = {
        userId: fakeUserId,
        eventType: 'FakeEvent',
        data: {
          fake: 'data',
        },
      }

      fetchMock.mock(url, {
        method: 'POST',
        body: eventSuccessBody,
      })

      const result = apiClient.triggerInboundEvent(fakeEventRequest)
      const lastCallConfig = fetchMock.lastCall(url)[1]

      expect(lastCallConfig.headers).toEqual({
        authorization: `Bearer ${fakeToken}`,
      })

      expect(lastCallConfig.body).toEqual(
        JSON.stringify({
          app_user_id: fakeUserId,
          event_type: 'FakeEvent',
          data: {
            fake: 'data',
          },
        })
      )

      return expect(result).resolves.toEqual(eventSuccessBody)
    })

    describe('rejections', () => {
      const invalidConfigurations = [
        {},
        {
          userId: null,
        },
        false,
        null,
        undefined,
        22,
        [],
        () => {},
        {
          userId: v4(),
        },
        {
          userId: v4(),
          eventType: null,
        },
        {
          userId: v4(),
          eventType: 22,
        },
        {
          userId: v4(),
          eventType: () => {},
        },
        {
          userId: v4(),
          eventType: [],
        },
      ]

      invalidConfigurations.forEach(config => {
        it(`rejects if config is ${JSON.stringify(config)}`, () => {
          const client = new APIClient({ token: v4() })
          const rejection = client.triggerInboundEvent(config)

          expect(logErrorSpy).toHaveBeenCalledWith({
            message:
              'Invalid triggerInboundEvent configuration\n\nA valid eventConfig Object is required\n\n• eventConfig.userId must be a valid String\n• eventConfig.eventType must be a valid String\n• eventConfig.data must be a valid Object (if present)',
          })

          return expect(rejection).rejects.toEqual({
            message: 'Could not trigger inbound event',
            type: 'Validation failure',
          })
        })
      })

      describe('failed response', () => {
        it('rejects if API request fails', () => {
          const fakeToken = v4()
          const apiClient = new APIClient({ token: fakeToken })
          const fakeUserId = v4()
          const url = `${apiClient.getBaseUrl()}/api/v1/webhook/event`

          const fakeEventRequest = {
            userId: fakeUserId,
            eventType: 'FakeEvent',
            data: {
              fake: 'data',
            },
          }

          fetchMock.mock(url, {
            method: 'POST',
            status: 400,
          })

          return expect(
            apiClient.triggerInboundEvent(fakeEventRequest)
          ).rejects.toEqual({
            message: 'Your event could not be sent at this time',
            status: 400,
            statusText: 'Bad Request',
          })
        })
      })
    })
  })
})
