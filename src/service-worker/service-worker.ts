/**
 * This file (service-worker.js) is compiled from ./service-worker.ts
 */
// This will be omitted by the typescript compiler if we don't use any value in it
import { swCompile as MarkdownModule } from '../../loaders/markdown-loader.js'
import { swCompile as CSSModule } from '../../loaders/css-module-loader.js'
import { swCompile as JSONModule } from '../../loaders/json-module-loader.js'
import { swCompile as TypeScriptModule } from '../../loaders/typescript-loader.js'

async function loadLoader(url: URL, loader: Loader) {
    const request = await fetch(url.searchParams.get('src')!)
    if (!request.ok) return request
    const file = await loader.transpiler(request)
    const headers = new Headers(request.headers)
    headers.set('content-type', 'application/javascript')
    headers.set('content-length', file.length.toString())
    return new Response(file, { headers })
}
export function compiler(e: FetchEvent) {
    const url = new URL(e.request.url)
    if (url.origin !== location.origin) return
    for (const loader of Loader.loaders) {
        if (url.pathname === loader.fallbackURL) {
            e.respondWith(loadLoader(url, loader))
        }
    }
}

class Loader {
    /**
     * @param fallbackURL The fallback URL
     * @param transpiler The transpiler
     */
    constructor(public fallbackURL: string, public transpiler: (res: Response) => Promise<string>) {}
    static loaders: Loader[] = []
    static add(loader: Loader) {
        this.loaders.push(loader)
    }
}

Loader.add(new Loader('/loaders/css-module-loader.js', CSSModule))
Loader.add(new Loader('/loaders/json-module-loader.js', JSONModule))
Loader.add(new Loader('/loaders/markdown-loader.js', MarkdownModule))
Loader.add(new Loader('/loaders/typescript-loader.js', TypeScriptModule))
