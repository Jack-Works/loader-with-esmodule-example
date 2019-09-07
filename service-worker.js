// Modified from https://gist.github.com/developit/689aa4415bd688f3fce923cb8ae9abe7#file-polyfill-js
// in your ServiceWorker: importScripts('polyfill.js')

addEventListener('fetch', e => {
    const url = new URL(e.request.url)
    if (url.pathname === '/css-module-loader.js') {
        const request = fetch(url.searchParams.get('src'))
        const css = request
            .then(x => x.text())
            .then(x => {
                const headers = new Headers(request.headers)
                const cssModule = `let s = new CSSStyleSheet()
s.replace(${JSON.stringify(x)})
export default s`
                headers.set('content-type', 'application/javascript')
                headers.set('content-length', cssModule.length)
                return new Response(cssModule, { headers })
            })
        e.respondWith(css)
    }
})
