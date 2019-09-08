import { parseSrc, fetchFileSync } from '../loader-utils/load.js'
export default typeof document === 'object' ? runtimeCompile() : undefined

function runtimeCompile() {
    const src = parseSrc(import.meta.url, location.origin)
    return JSON.parse(fetchFileSync(src))
}

/**
 * @param {Response} res
 */
export async function swCompile(res) {
    return `export default JSON.parse(${JSON.stringify(await res.text())})`
}
