import { parseSrc } from '../loader-utils/load.js'
const src = parseSrc(import.meta.url, location.origin)
const container = new CSSStyleSheet()

console.log('Loading css', src)

fetch(src)
    .then(x => x.text())
    .then(x => container.replace(x))

export default container
