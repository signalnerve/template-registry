async function handleRequest(request) {
  let url = new URL(request.url)
  // Only use the path for the cache key, removing query strings
  // and always storing HTTPS e.g. https://www.example.com/file-uri-here
  let someCustomKey = `https://${url.hostname}${url.pathname}`
  let response = await fetch(request, {
    cf: {
      // Tell Cloudflare's Global CDN to always cache this fetch regardless of content type
      // for a max of 5 seconds before revalidating the resource
      cacheTtl: 5, // sets TTL to 5 and cacheEverything setting
      //Enterprise only feature, see Cache API for other plans
      cacheKey: someCustomKey,
    },
  })
  // must use Response constructor to inherit all of response's fields
  response = new Response(response.body, response)
  //Set cache control headers to cache on browser for 25 minutes
  response.headers.set('Cache-Control', 'max-age=1500')
  return response
}
addEventListener('fetch', event => {
  return event.respondWith(handleRequest(event.request))
})
