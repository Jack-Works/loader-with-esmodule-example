/**
 * @param {string} src
 */
export function SyncXHR(src) {
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

/**
 * @param {string} meta URL
 * @param {string} baseURL Base URL
 * @returns {string}
 */
export function parseSrc(meta, baseURL = location.origin) {
    return new URL(new URL(meta).searchParams.get('src'), baseURL).toJSON()
}
