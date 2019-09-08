Object.assign(globalThis, { process: { argv: [] } })
importScripts('https://www.unpkg.com/typescript@3.6.2/lib/typescript.js')
const serviceWorkerURL = new URL('/src/service-worker/service-worker.ts', location.origin).toJSON()

let compiler
addEventListener('fetch', e => {
    typeof compiler === 'function' && compiler(e)
})
init()

let lastETag = ''
async function init() {
    /** @type {Promise<import('./src/typescript/typescript-shared-compiler')>} */
    const sharedTypeScriptCompiler = fetch('/loader-utils/typescript-shared-compiler.js')
        .then(x => x.text())
        .then(x => x.replace(/export /g, '') + '\n({configureTypeScriptSharedCompiler,ECMAScriptModule,compileModule})')
        .then(eval)
    /**
     * @type {Promise<import('./loader-utils/load')>}
     */
    const loaderUtils = fetch('/loader-utils/load.js')
        .then(x => x.text())
        .then(x => x.replace(/export /g, '') + '\n({fetchFile,fetchFileSync})')
        .then(eval)
    const serviceWorkerCode = fetch(serviceWorkerURL)
        .then(x => ((lastETag = getETag(x)), x))
        .then(x => x.text())

    const tsCompiler = await sharedTypeScriptCompiler
    const utils = await loaderUtils
    const code = await serviceWorkerCode

    tsCompiler.configureTypeScriptSharedCompiler(utils.fetchFile, utils.fetchFileSync, Reflect.get(globalThis, 'ts'))

    const serviceWorkerModule = tsCompiler.compileModule(serviceWorkerURL, code)
    const exported = await tsCompiler.ECMAScriptModule.evalModuleAsync(serviceWorkerModule)
    // @ts-ignore
    useNewCompiler(exported)
}

async function checkServiceWorkerUpdate() {
    const req = await fetch(serviceWorkerURL, { method: 'HEAD' })
    const thisETag = getETag(req)
    if (thisETag === lastETag) return
    console.log('Service worker updated from ', lastETag, 'to', thisETag, 'unregister the old one.')
    globalThis.registration.unregister()
    clearTimeout(timeout)
}

const oneHour = 1000 * 60 * 60
const timeout = setInterval(checkServiceWorkerUpdate, location.hostname === 'localhost' ? 2000 : oneHour)

function useNewCompiler(/** @type {(typeof import('./src/service-worker/service-worker'))} */ newCompiler) {
    compiler = newCompiler.compiler
}
function getETag(/** @type {Response} */ x) {
    return x.headers.get('etag')
}
