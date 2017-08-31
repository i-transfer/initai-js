import createMonitorClient, { MonitorClient } from './'

import { v4 } from 'uuid'

const getFakeSuggestion = () => ({
  content: { text: 'Some message content' },
  content_type: 'text',
  metadata: {},
  nlp_metadata: {},
  suggestion_type: 'message',
  suggestion_id: v4(),
  data: {},
})

const getFakeSuggestionsPayload = () => ({
  conversation_id: v4(),
  suggestions: new Array(5).join('_').split('').map(getFakeSuggestion),
})

// TODO: Ensure this conforms to the `APIClientInterface`
const getFakeAPIClient = token => ({
  getBaseUrl() {
    return 'https://fake.co'
  },

  getAuthHeaders() {
    return {
      authorization: `Bearer ${token}`,
    }
  },

  fetchSuggestions() {
    return Promise.resolve(getFakeSuggestionsPayload())
  },
})

const noop = () => {}

describe('createMonitorClient', () => {
  it('resolves Promise with a MonitorClient instance', () => {
    const userId = v4()
    const apiClient = getFakeAPIClient()

    // Don't attempt to setup pusher
    jest
      .spyOn(MonitorClient.prototype, 'configurePusherClient')
      .mockImplementation(noop)
    jest
      .spyOn(MonitorClient.prototype, 'subscribeToChannel')
      .mockImplementation(noop)

    expect(createMonitorClient({ apiClient, userId })).resolves.toBeInstanceOf(
      MonitorClient
    )
  })

  describe('invalid config', () => {
    it('rejects Promise on invalid config', () => {
      expect(createMonitorClient()).rejects.toEqual({
        message: expect.any(String),
      })
    })

    it('rejects on missing userId', () => {
      expect(createMonitorClient({})).rejects.toEqual({
        message: expect.any(String),
      })
    })

    it('rejects on missing APIClient', () => {
      expect(createMonitorClient({ userId: v4() })).rejects.toEqual({
        message: expect.any(String),
      })
    })
  })
})

describe('MonitorClient', () => {
  describe('constructor', () => {
    it('assigns props and configures pusher', () => {
      const configurePusherClientSpy = jest
        .spyOn(MonitorClient.prototype, 'configurePusherClient')
        .mockImplementation(noop)
      const subscribeToChannelSpy = jest
        .spyOn(MonitorClient.prototype, 'subscribeToChannel')
        .mockImplementation(noop)

      const fakeUserId = v4()
      const fakeAPIClient = getFakeAPIClient()

      const monitorClient = new MonitorClient({
        userId: fakeUserId,
        apiClient: fakeAPIClient,
      })

      expect(monitorClient.userId).toEqual(fakeUserId)
      expect(monitorClient.apiClient).toEqual(fakeAPIClient)
      expect(monitorClient.bus).toEqual(new Map())
      expect(configurePusherClientSpy).toHaveBeenCalled()
      expect(subscribeToChannelSpy).toHaveBeenCalled()

      configurePusherClientSpy.mockReset()
      configurePusherClientSpy.mockRestore()

      subscribeToChannelSpy.mockReset()
      subscribeToChannelSpy.mockRestore()
    })
  })

  describe('subscribeToChannel', () => {
    it('assigns a `pusherChannel` on the instance', () => {
      const mockPusherChannel = { bind: jest.fn() }
      const subscribeSpy = jest.fn(() => mockPusherChannel)
      const mockPusherClient = { subscribe: subscribeSpy }
      const fakeUserId = v4()
      const handleNewSuggestionsStub = jest.fn()

      // Compose fake state representing the instance
      const instanceContext = {
        handleNewSuggestions: handleNewSuggestionsStub,
        pusherClient: mockPusherClient,
        userId: fakeUserId,
      }

      MonitorClient.prototype.subscribeToChannel.call(instanceContext)

      expect(subscribeSpy).toHaveBeenCalledWith(
        `presence-app_user-${fakeUserId}`
      )
      expect(mockPusherChannel.bind).toHaveBeenCalledWith(
        'suggestions:new',
        handleNewSuggestionsStub,
        instanceContext
      )
    })
  })

  describe('handleNewSuggestions', () => {
    it('triggers `suggestions:new`', done => {
      const fakeAPIClient = getFakeAPIClient()
      const fakeSuggestionsPayload = {
        conversation_id: v4(),
        remote_conversation_id: null,
      }

      const fakeContext = {
        apiClient: fakeAPIClient,
        userId: v4(),
        trigger: jest.fn(),
      }

      MonitorClient.prototype.handleNewSuggestions.call(
        fakeContext,
        fakeSuggestionsPayload
      )

      setImmediate(() => {
        try {
          expect(fakeContext.trigger).toHaveBeenCalledWith(
            'suggestions:new',
            fakeSuggestionsPayload
          )
          done()
        } catch (err) {
          done.fail(err)
        }
      })
    })
  })

  describe('trigger', () => {
    it('triggers a single handler', () => {
      const handlerOne = jest.fn()
      const instanceContext = {
        bus: new Map([['event1', [handlerOne]]]),
      }
      const fakePayload = { foo: 'bar' }

      MonitorClient.prototype.trigger.call(
        instanceContext,
        'event1',
        fakePayload
      )

      expect(handlerOne).toHaveBeenCalledWith(fakePayload)
    })

    it('triggers a multiple handlers', () => {
      const handlerZero = jest.fn()
      const handlerOne = jest.fn()
      const handlerTwo = jest.fn()
      const handlerThree = jest.fn()
      const instanceContext = {
        bus: new Map([
          ['event1', [handlerOne, handlerTwo, handlerThree]],
          ['event2', [handlerZero]],
        ]),
      }
      const fakePayload = { foo: 'bar' }

      MonitorClient.prototype.trigger.call(
        instanceContext,
        'event1',
        fakePayload
      )

      expect(handlerZero).not.toHaveBeenCalled()
      expect(handlerOne).toHaveBeenCalledWith(fakePayload)
      expect(handlerTwo).toHaveBeenCalledWith(fakePayload)
      expect(handlerThree).toHaveBeenCalledWith(fakePayload)
    })
  })

  describe('on', () => {
    it('writes new event entry on bus', () => {
      const handler = jest.fn()
      const instanceContext = {
        bus: new Map(),
      }

      MonitorClient.prototype.on.call(instanceContext, 'eventName', handler)

      expect(instanceContext.bus).toEqual(new Map([['eventName', [handler]]]))
    })

    it('appends new handler', () => {
      const handlerOne = jest.fn()
      const handlerTwo = jest.fn()
      const instanceContext = {
        bus: new Map([['eventName', [handlerTwo]]]),
      }

      MonitorClient.prototype.on.call(instanceContext, 'eventName', handlerOne)

      expect(instanceContext.bus).toEqual(
        new Map([['eventName', [handlerTwo, handlerOne]]])
      )
    })

    it('throws if invalid eventName is provided', () => {
      ;['', true, 22, {}, () => {}].forEach(typeVal => {
        const run = () => {
          MonitorClient.prototype.on.call({}, typeVal)
        }

        expect(run).toThrowError('A valid eventName string must be provided')
      })
    })

    it('throws is if no handler is provided', () => {
      const run = () => {
        MonitorClient.prototype.on.call({}, 'eventName')
      }

      expect(run).toThrowError('A valid handler function must be provided')
    })
  })

  describe('off', () => {
    it('empties entire bus', () => {
      const instanceContext = {
        bus: new Map([
          ['event1', [jest.fn()]],
          ['event2', [jest.fn(), jest.fn(), jest.fn()]],
          ['event3', [jest.fn(), jest.fn()]],
        ]),
      }

      MonitorClient.prototype.off.call(instanceContext)

      expect(instanceContext.bus).toEqual(new Map())
    })

    it('removes specified handler', () => {
      const h1 = jest.fn()
      const h2 = jest.fn()
      const h3 = jest.fn()
      const h4 = jest.fn()
      const h5 = jest.fn()
      const h6 = jest.fn()
      const instanceContext = {
        bus: new Map([
          ['event1', [h1]],
          ['event2', [h2, h3, h4]],
          ['event3', [h5, h6]],
        ]),
      }

      MonitorClient.prototype.off.call(instanceContext, 'event2', h3)

      expect(instanceContext.bus).toEqual(
        new Map([['event1', [h1]], ['event2', [h2, h4]], ['event3', [h5, h6]]])
      )
    })

    it('ejects event from bus if handler is omitted', () => {
      const h1 = jest.fn()
      const h2 = jest.fn()
      const h3 = jest.fn()
      const h4 = jest.fn()
      const h5 = jest.fn()
      const h6 = jest.fn()
      const instanceContext = {
        bus: new Map([
          ['event1', [h1]],
          ['event2', [h2, h3, h4]],
          ['event3', [h5, h6]],
        ]),
      }

      MonitorClient.prototype.off.call(instanceContext, 'event2')

      expect(instanceContext.bus).toEqual(
        new Map([['event1', [h1]], ['event3', [h5, h6]]])
      )
    })

    it('ejects event from bus if handlers are emptied', () => {
      const h1 = jest.fn()
      const h2 = jest.fn()
      const h3 = jest.fn()
      const h4 = jest.fn()
      const h5 = jest.fn()
      const h6 = jest.fn()
      const instanceContext = {
        bus: new Map([
          ['event1', [h1]],
          ['event2', [h2, h3, h4]],
          ['event3', [h5, h6]],
        ]),
      }

      MonitorClient.prototype.off.call(instanceContext, 'event1', h1)

      expect(instanceContext.bus).toEqual(
        new Map([['event2', [h2, h3, h4]], ['event3', [h5, h6]]])
      )
    })
  })

  describe('destroy', () => {
    it('destroys pusher and clears event bus', () => {
      const unbindSpy = jest.fn()
      const disconnectSpy = jest.fn()
      const instanceContext = {
        pusherChannel: { unbind: unbindSpy },
        pusherClient: { disconnect: disconnectSpy },
        bus: new Map([
          ['event1', [jest.fn()]],
          ['event2', [jest.fn(), jest.fn(), jest.fn()]],
          ['event3', [jest.fn(), jest.fn()]],
        ]),
      }

      MonitorClient.prototype.destroy.call(instanceContext)

      expect(unbindSpy).toHaveBeenCalled()
      expect(disconnectSpy).toHaveBeenCalled()
      expect(instanceContext.bus).toEqual(new Map())
    })
  })
})
