# Init.ai JS

[![CircleCI](https://circleci.com/gh/init-ai/initai-js/tree/master.svg?style=svg)](https://circleci.com/gh/init-ai/initai-js/tree/master)
[![NPM version](https://img.shields.io/npm/v/initai-js.svg)](https://www.npmjs.com/package/initai-js)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](#badge)

A JavaScript library for building rich experiences on top of the [Init.ai](https://init.ai) platform.

This library is in an early phase of development, but is suitable for production use. Please feel free to file any [issues](https://github.com/initai/initai-js/issues) or submit a [pull request](#contributing).

<details>
<summary><strong>Table of Contents</strong></summary>

* [Quickstart](#quickstart)
  + [Install via npm/yarn](#install-via-npmyarn)
  + [API Client only](#api-client-only)
  + [Configure a "monitor"](#configure-a-monitor)
* [Using initai-js](#using-initai-js)
  + [Installation](#installation)
  + [Browser support](#browser-support)
  + [API Client](#api-client)
    + [Initialization](#api-client-initialization)
    + [Methods](#api-client-methods)
  + [Monitor Client](#monitor-client)
    + [Initialization](#monitor-client-initialization)
    + [Methods](#monitor-client-methods)
    + [Events](#monitor-client-events)
* [Developing](#developing)
  + [Install dependencies](#install-dependencies)
  + [Run in watch mode](#run-in-watch-mode)
  + [Building](#building)
  + [Testing](#testing)
  + [Running as a linked module](#running-as-a-linked-module)
* [Contributing](#contributing)
</details>

--------------------------------------------------------------------------------

## Quickstart

### Install via npm/yarn

```bash
yarn add initai-js
```

### API Client only:

```js
import { createAPIClient } from 'initai-js'

const apiClient = createAPIClient({ token: 'my-token' })

apiClient.sendMessage({ content: 'Hello!', userId: '123' })
```

### Configure a "monitor":

```js
import { createAPIClient, createMonitorClient } from 'initai-js'

const apiClient = createAPIClient({ token: 'my-token' })

createMonitorClient({ apiClient, userId: '123' }).then(monitorClient => {
  monitorClient.on('suggestestions:new', ({ payload }) => console.log(payload.messages))
})
```

## Using initai-js

* [Installation](#installation)
* [Browser support](#browser-support)
* [API Client](#api-client)
  * [Initialization](#api-client-initialization)
  * [Methods](#api-client-methods)
* [Monitor Client](#monitor-client)
  * [Initialization](#monitor-client-initialization)
  * [Methods](#monitor-client-methods)
  * [Events](#monitor-client-events)

## Installation

### Using a package manager/loader

You can install `initai-js` using npm or yarn for use in a project using Webpack, browserify, rollup, etc.

```bash
yarn add initai-js
```

Import the library into your project:

```js
import { createAPIClient } from 'initai-js'

const apiClient = createAPIClient({ token: 'my-token' })

apiClient.sendMessage({ content: 'Hey!', userId: '123' })
```

### Using a script tag

`initai-js` is not currently distributed via a CDN, however, if you are not using a package manager and would like to, you can [build your own](#building) file to include in your project.

```html
<html>
  <body>
    <h1>My app</h1>
    <script src="path/to/initai.min.js"></script>
    <script>
      const apiClient = InitAI.createAPIClient({ token: 'my-token' })
      apiClient.sendMessage({ content: 'Hey!', userId: '123' })
    </script>
  </body>
</html>
```

Using this method, the `InitAI` namespace is exposed as a global Object.

## Browser support

This library is developed for use in modern browsers. Currently, we support:

* The latest two versions of Chrome
* The latest two versions of Firefox
* Safari 10+
* Microsoft Edge (latest)

While the library will likely work for more browsers and mobile devices, it is not currently tested for those scenarios.

## API Client

The API Client is used to communicate with the Init.ai [Remote API](https://docs.init.ai/reference) from a browser.

<a id="api-client-initialization"></a>
### Initialization

A client instance requires a configuration object that includes a `token` where the value is that of an [API Token](https://docs.init.ai/docs/tokens-and-authentication) which you can get from the Init.ai console.

![Init.ai token](https://user-images.githubusercontent.com/1217116/27979472-f4977346-633b-11e7-9183-3fac719deb7a.png)

#### Example

```js
import { createAPIClient } from 'initai-js'

const apiClient = createAPIClient({ token: 'API_TOKEN' })

apiClient.sendMessage({ content: 'Hey, friend!', userId: '123' }).then(() => {
  console.log('message sent!')
})
```

<a id="api-client-methods"></a>
### Methods

#### `sendMessage(messageConfig: MessageConfig): Promise<SendMessageSuccess | SendMessageError>`

##### `MessageConfig`

An object describing the message to send.

* `userId`: _required_ – The Init.ai database id or the custom `remote_id` associated with the user
* `content`: _required_ – A string (if `contentType` is `text`) or object representing the message content to send
* `contentType`: _required_ - A string representing a valid message type: `text`, `image`, or `postback-action`
  * See [the docs](https://docs.init.ai/docs/sending-responses#section-sending-text-with-suggested-quick-replies) for more information on using "quick replies" and postback actions.
* `senderRole`: Default `end-user` – A string representing the message sender: `agent`, `app`, `end-user`

##### Handling responses

`sendMessage` returns a Promise which will resolve or reject with the following data:

```js
// Success
{
  id: 'new-message-id',
  sender_role: 'end-user',
  content_type: 'text',
  content: 'Hello!',
  created_at: '2017-06-29T14:57:57.092662Z',
  updated_at: '2017-06-29T14:57:57.092662Z'
}

// Error
{
  status: 500, // HTTP status code
  statusText: 'Server error', // HTTP status message
  message: 'Your message could not be sent at this time'
}
```

##### Examples

```js
// Sending a text message
apiClient.sendMessage({
  userId: '123',
  content: 'Hey there!',
  contentType: 'text',
  senderRole: 'agent' 
})

// Sending an image
apiClient.sendMessage({
  userId: '123',
  content: {
    alternativeText: 'Image alt text',
    imageUrl: 'path/to/image/url',
    mimeType: 'image/png'
  },
  contentType: 'image',
})

// Sending a postback action
apiClient.sendMessage({
  userId: '123',
  content: {
    text: 'Order accepted',
    data: { orderNumber: 123, status: 'accepted' },
    stream: 'handleCompletedOrder'
 },
 contentType: 'postback-action',
 senderRole: 'end-user'
})
```

#### `fetchMessages(userId: string): Promise<FetchMessagesResult>`

Fetch messages for the provided user's current conversation.

##### `userId`

The Init.ai database id or the custom `remote_id` associated with the user

##### Handling responses

`fetchMessages` returns a Promise which will resolve or reject with the following data:

```js
// Success
{
  messages: [
    {
      id: 'new-message-id',
      sender_role: 'end-user',
      content_type: 'text',
      content: 'Hello!',
      created_at: '2017-06-29T14:57:57.092662Z',
      updated_at: '2017-06-29T14:57:57.092662Z'
    }
  ],
  pagination: {
    page_size: 100,
    current_page_url:
      'https://api.init.ai/v1/users/123/conversations/current/messages?page_before_id=&page_size=100',
    first_page_url:
      'https://s-api.init.ai/v1/users/123/conversations/current/messages?&page_size=100'
  }
}

// Error
{
  status: 500, // HTTP status code
  statusText: 'Server error', // HTTP status message
  message: 'Could not fetch messages for user 123'
}
```

##### Examples

```js
apiClient.fetchMessages('123').then(({ messages }) => {
  console.log(messages) // [ ..., {...}, ...]
}).catch(console.log)
```

#### `fetchSuggestions(userId: string): Promise<SuggestionsResult>`

Fetch the _latest_ message suggestions for the provided user's conversation

##### `userId`

The Init.ai database id or the custom `remote_id` associated with the user

##### Handling responses

`fetchSuggestions` returns a Promise which will resolve or reject with the following data:

```js
// Success
{
  conversation_id: '123-456',
  suggestions: [
    ...,

    {
      content: { text: 'Some message content' },
      content_type: 'text',
      metadata: {}, // Arbitrary metadata sent with the request
      nlp_metadata: {}, // An Object containing NLP results (auto-suggestions only)
      source_type: 'logic_invocation', // 'api', 'logic_invocation', or 'auto'
      suggestion_type: 'message',
      suggestion_id: '456',
      data: {}, // Data used to populate templated suggestions
    },

    ....
  ]
}

// Error
{
  status: 500, // HTTP status code
  statusText: 'Server error', // HTTP status message
  message: 'Could not fetch suggetions for user 123'
}
```

##### Examples

```js
apiClient.fetchSuggestions('123').then(({ suggestions }) => {
  console.log(suggestestions) // [ ..., {...}, ...]
}).catch(console.log)
```

#### `triggerInboundEvent(eventConfig: InboundEvent): Promise<TriggerEventResult>`

##### `InboundEvent`

An object describing the message to send.
* `userId`: _required_ – The Init.ai database id associated with the user
* `eventType`: _required_ – The arbitrary value that will be provided to logic processing.
* `data`: _required_ - An arbitrary Object which you can send along with the request and is available during logic runs.

##### Handling responses

`triggerInboundEvent` returns a Promise which will resolve or reject with the following data:

```js
// Success
{
  body: "Event accepted.", 
  error: null
}

// Error
{
  status: 500, // HTTP status code
  statusText: 'Server error', // HTTP status message
  message: 'Your event could not be sent at this time'
}
```

##### Examples

```js
// Sending an event
apiClient.triggerInboundEvent({
  userId: '123',
  eventType: 'sample:event',
  data: {
    'key': 'value',
  },
})
```

## Monitor Client

The Monitor Client is used to establish a realtime connection with the Init.ai API to facilitate building rich client-side experiences for conversations.

<a id="monitor-client-initialization"></a>
### Initialization

A monitor client instance requires a configuration object that includes:

* A `userId` – The Init.ai database id or the custom `remote_id` for the current user.
* An `apiClient` – An instance of an [Init.ai API Client](#api-client)

The monitor client is instantiated asynchronously which means you will need to use the reference provided via the resolved Promise.

#### Example

```js
import { createAPIClient, createMonitorClient } from 'initai-js'

const apiClient = createAPIClient({ token: 'my-token' })

createMonitorClient({ apiClient, userId: '123' }).then(monitorClient => {
  // Use `monitorClient`
})
```

<a id="monitor-client-methods"></a>
### Methods

#### `on(eventName: string, handler: Function)`

Subscribe to conversation event.

* `eventName` – The name of the event you wish to subscribe to.
  * See [Events](#monitor-client-events) for event names and payload
* `handler` – A function to be called when an event is fired. The payload provided as an argument to this callback will depend on the event itself.

##### Example usage

```js
const handleSuggestions = (payload) => console.log('Suggestions:', payload)

monitorClient.on('suggestions:new', handleSuggestions)
```

#### `off(eventName?: string, handler?: Function)`

Unsubscribe from a conversation event.

* `eventName` – The name of the event you wish to unsubscribe from
  * If this is omitted, _all_ subscriptions will be cancelled
* `handler` – The specific function reference to remove from the callback list
  * If this is omitted, _all_ handlers for the given `eventName` will be removed

##### Example usage

```js
const handleSuggestions = (payload) => console.log('Suggestions:', payload)

monitorClient.on('suggestions:new', handleSuggestions)

monitorClient.off('suggestestions:new')
```

#### `destroy()`

Destroy the `monitorClient` instance and remove all subscriptions. This is useful in applications where you may need to swap clients when the current user session expires or changes –– such as a CRM.

##### Example usage

```js
const handleSuggestions = (payload) => console.log('Suggestions:', payload)

monitorClient.on('suggestions:new', handleSuggestions)

monitorClient.destroy()
```

<a id="monitor-client-events"></a>
### Events

#### `suggestions:new`

Triggered whenever new suggestions are added to the conversation..

##### Example payload

```js
// Success
{
  conversation_id: '123-456',
  suggestions: [
    ...,

    {
      content: { text: 'Some message content' },
      content_type: 'text',
      metadata: {}, // Arbitrary metadata sent with the request
      nlp_metadata: {}, // An Object containing NLP results (auto-suggestions only)
      source_type: 'logic_invocation', // 'api', 'logic_invocation', or 'auto'
      suggestion_type: 'message',
      suggestion_id: '456',
      data: {}, // Data used to populate templated suggestions
    },

    ....
  ]
}
```

## Developing

### Install dependencies

```bash
yarn
```

### Run in watch mode

```
yarn dev
```

The following environment variables are supported:

* `API_BASE_URL` – The protocol, host, and port for your API endpoint. Defaults to `https://api.init.ai`
* `PUSHER_APP_KEY` – A Pusher application key

### Building

To run a "production" build:

```bash
yarn build:production
```

This will build a copy of the library as well as a minified version to `/dist`

### Testing

#### Run unit tests

```bash
yarn test
```

To use `watch mode`:

```bash
yarn test:watch
```

### Running as a linked module

Depending on your use case, it can often be helpful to develop against a local copy of `initai-js`. Since the default exports for this library are the artifats built to `dist`, you will need to use [linking](https://yarnpkg.com/en/docs/cli/link) and a specific development task to build to `dist` on change.

```bash
yarn link && yarn dev:linked
```

and then in your target project run:

```bash
yarn link initai-js
```

> **Note:** Make sure you are using the same version of Node.js in both projects for [linking](https://yarnpkg.com/en/docs/cli/link) to work properly.

#### Run Flow type checker

```bash
yarn flow
```

## Contributing

We welcome [contributions](CONTRIBUTING.md) to the library. Please read the [guidelines](CONTRIBUTING.md) and open a pull request.
