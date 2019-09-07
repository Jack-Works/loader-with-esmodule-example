// Modified from https://gist.github.com/developit/689aa4415bd688f3fce923cb8ae9abe7#file-polyfill-js
// in your ServiceWorker: importScripts('polyfill.js')

/**
 * @param {URL} url
 * @param {Loader} loader
 */
async function loadLoader(url, loader) {
    const request = await fetch(url.searchParams.get('src'))
    if (!request.ok) return request
    const file = await loader.transpiler(request)
    const headers = new Headers(request.headers)
    headers.set('content-type', 'application/javascript')
    headers.set('content-length', file.length)
    return new Response(file, { headers })
}
addEventListener('fetch', e => {
    const url = new URL(e.request.url)
    for (const loader of Loader.loaders) {
        if (url.pathname === loader.fallbackURL) {
            e.respondWith(loadLoader(url, loader))
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

globalThis.process = {
    argv: []
}
importScripts('https://www.unpkg.com/typescript@3.6.2/lib/typescript.js')
Loader.add(
    new Loader(
        '/typescript-loader.js',
        async res =>
            ts.transpileModule(await res.text(), {
                compilerOptions: {
                    module: ts.ModuleKind.ESNext,
                    jsx: ts.JsxEmit.React,
                    allowJs: true,
                    target: ts.ScriptTarget.ESNext
                },
                fileName: res.url,
                transformers: { before: [importTransformer(res.url)] }
            }).outputText
    )
)
function importTransformer(baseURL) {
    return context => {
        function visit(node) {
            if (ts.isImportDeclaration(node)) {
                let nextModuleSpecifier
                if (ts.isStringLiteral(node.moduleSpecifier)) {
                    if (node.moduleSpecifier.text.startsWith('/') || node.moduleSpecifier.text.startsWith('.')) {
                        nextModuleSpecifier = ts.createStringLiteral(
                            '/typescript-loader.js?src=' + new URL(node.moduleSpecifier.text, baseURL)
                        )
                    } else {
                        // unknown source
                        // like "@pika/react"
                        nextModuleSpecifier = node.moduleSpecifier
                    }
                } else {
                    throw new Error('Invalid module specifier')
                }
                return ts.createImportDeclaration(
                    node.decorators,
                    node.modifiers,
                    node.importClause,
                    nextModuleSpecifier
                )
            } else if (ts.isImportClause(node)) {
                console.log(node.name, node.namedBindings)
                return ts.createImportClause(node.name, node.namedBindings)
            }
            return ts.visitEachChild(node, child => visit(child), context)
        }
        return node => ts.visitNode(node, visit)
    }
}
