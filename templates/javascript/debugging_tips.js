const LOG_URL = 'https://log-service.example.com/' // Service setup up to receive logs
async function handleRequest(event) {
  let response
  try {
    response = await fetch(event.request)
    if (!response.ok) {
      let body = await response.text()
      throw new Error(
        'Bad response at origin. Status: ' +
          response.status +
          ' Body: ' +
          body.trim().substring(0, 10), //ensures is string that can be a header
      )
    }
  } catch (err) {
    // Without event.waitUntil(), our fetch() to our logging service may
    // or may not complete.
    event.waitUntil(postLog(err))
    const stack = JSON.stringify(err.stack) || err
    // Copy the response and initialize body to the stack trace
    response = new Response(stack, response)
    // Shove our rewritten URL into a header to find out what it was.
    response.headers.set('X-Debug-stack', stack)
    response.headers.set('X-Debug-err', err)
  }
  return response
}
addEventListener('fetch', event => {
  //Have any uncaught errors thrown go directly to origin
  event.passThroughOnException()
  event.respondWith(handleRequest(event))
})
function postLog(data) {
  return fetch(LOG_URL, {
    method: 'POST',
    body: data,
  })
}
