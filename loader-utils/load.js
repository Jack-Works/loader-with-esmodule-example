/**
 * @param {string} src
 */
export function SyncXHR(src) {
    const req = new XMLHttpRequest()
    req.open('GET', src, false)
    req.send(null)
    return req.responseText
}

export function fetchFile(src) {
    if (typeof src !== 'string') return Promise.reject('URL must be a string')
    return fetch(src).then(x => x.text())
}

/**
 * @param {string} meta URL
 * @param {string} baseURL Base URL
 * @returns {string}
 */
export function parseSrc(meta, baseURL) {
    return new URL(new URL(meta).searchParams.get('src'), baseURL).toJSON()
}
