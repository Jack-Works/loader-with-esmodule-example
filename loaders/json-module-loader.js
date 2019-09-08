import { parseSrc } from '../loader-utils/load.js'
const src = parseSrc(import.meta.url, location.origin)
console.log('Loading JSON', src)

const req = new XMLHttpRequest()
req.open('GET', src, false)
req.send(null)
export default JSON.parse(req.responseText)
