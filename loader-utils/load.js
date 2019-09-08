/**
 * This file is not compile by TypeScript, feel free to edit it.
 */
export function fetchFileSync(src) {
    const req = new XMLHttpRequest()
    req.open('GET', src, false)
    req.send(null)
    if (req.status > 399) throw new Error(`Load ${src} failed`)
    return req.responseText
}
export function fetchFile(src) {
    if (typeof src !== 'string') return Promise.reject('URL must be a string')
    return fetch(src)
        .then(x => (x.ok ? x : Promise.reject(new Error('Load ' + src + ' failed'))))
        .then(x => x.text())
}
export function parseSrc(meta, baseURL = location.origin) {
    return new URL(new URL(meta).searchParams.get('src'), baseURL).toJSON()
}
