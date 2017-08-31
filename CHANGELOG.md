# 0.0.9 / 2017-08-31

* Add ability to provide conversation IDs for messaging management
  * Deliver `conversation_id` and `remote_conversation_id` only to `suggestions:new` monitor event
  * Accept `conversationId` in `fetchMessages`, `sendMessage`, and `fetchSuggestions`

# 0.0.8 / 2017-08-08

* Add Node.js support

# 0.0.7 / 2017-08-01

* Declare unminified file as `main` in `package.json`

# 0.0.6 / 2017-07-25

* Allow custom `baseUrl` and `pusherAppKey` in client configurations

# 0.0.5 / 2017-07-12

* Expose envrionment configuration via `API_BASE_URL`

# 0.0.4 / 2017-07-11

* Include `flow-typed` type definition in `npm` package distribution

# 0.0.3 / 2017-07-10

* Add ability to use repo as [linked](https://yarnpkg.com/en/docs/cli/link) module

# 0.0.2 / 2017-07-10

* Fix `npm` build task

# 0.0.1 / 2017-07-10

* Initial release
