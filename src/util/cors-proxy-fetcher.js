/* @flow */

type CORSProxyFetchOptions = {
  body?: {},
  headers?: {},
  method?: 'GET' | 'PUT' | 'POST',
}

type CORSProxyFetchBody = CORSProxyFetchOptions & { url: string }

const CORSProxyFetch = () => (
  url: string,
  options: CORSProxyFetchOptions
): Promise<Response> =>
  new Promise((resolve, reject) => {
    const defaultHeaders = { 'content-type': 'application/json' }
    const body: CORSProxyFetchBody = {
      headers: Object.assign({}, defaultHeaders, options.headers),
      method: options.method || 'POST',
      url,
    }

    if (options.body) {
      body.body = options.body
    }

    fetch('https://cors-me.now.sh', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    })
      .then(resolve)
      .catch(reject)
  })

const fetcher = CORSProxyFetch()

export default fetcher
