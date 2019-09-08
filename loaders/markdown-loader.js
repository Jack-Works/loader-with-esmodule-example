import { Remarkable } from 'https://cdn.pika.dev/remarkable/v2'
import { parseSrc } from '../loader-utils/load.js'

const src = parseSrc(import.meta.url, location.origin)
const container = document.createElement('p')

console.log('Loading markdown', src)

fetch(src)
    .then(x => x.text())
    .then(x => new Remarkable().render(x))
    .then(x => (container.innerHTML = x))

export default container
