// @flow
type Error = { message: string }

const logError = (error: Error) =>
  console.error(`[initai-js:error]: ${error.message}`)

export { logError }
