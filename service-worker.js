// Modified from https://gist.github.com/developit/689aa4415bd688f3fce923cb8ae9abe7#file-polyfill-js
// in your ServiceWorker: importScripts('polyfill.js')

addEventListener('fetch', e => {
    const url = new URL(e.request.url)
    for (const loader of Loader.loaders) {
        if (url.pathname === loader.fallbackURL) {
            const request = fetch(url.searchParams.get('src'))
            const translated = request.then(loader.transpiler).then(file => {
                const headers = new Headers(request.headers)
                headers.set('content-type', 'application/javascript')
                headers.set('content-length', file.length)
                return new Response(file, { headers })
            })
            e.respondWith(translated)
        }
    }
})

class Loader {
    /**
     * @param {string} fallbackURL The fallback URL
     * @param {(res: Response) => Promise<string>} transpiler The transpiler
     */
    constructor(fallbackURL, transpiler) {
        this.fallbackURL = fallbackURL
        this.transpiler = transpiler
    }
    /**
     * @type {Loader[]}
     */
    static loaders = []
    /**
     * @param {Loader} loader
     */
    static add(loader) {
        this.loaders.push(loader)
    }
}

Loader.add(
    new Loader(
        '/css-module-loader.js',
        async res =>
            `const container = new CSSStyleSheet()
container.replace(${JSON.stringify(await res.text())})
export default container`
    )
)

Loader.add(
    new Loader('/json-module-loader.js', async res => `export default JSON.parse(${JSON.stringify(await res.text())})`)
)
globalThis.window = globalThis
importScripts('https://unpkg.com/marked@0.7.0/marked.min.js')

Loader.add(
    new Loader(
        '/markdown-loader.js',
        async res => `const container = document.createElement('p')
container.innerHTML = ${JSON.stringify(marked(await res.text()))}
export default container`
    )
)
