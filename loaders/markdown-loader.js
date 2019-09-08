import { Remarkable } from 'https://cdn.pika.dev/remarkable/v2'
import { parseSrc } from '../loader-utils/load.js'
export default typeof document === 'object' ? runtimeCompile() : undefined

function runtimeCompile() {
    const src = parseSrc(import.meta.url, location.origin)
    const container = document.createElement('p')

    fetch(src)
        .then(x => x.text())
        .then(x => new Remarkable().render(x))
        .then(x => (container.innerHTML = x))
    return container
}
/**
 * @param {Response} res
 */
export async function swCompile(res) {
    return `const container = document.createElement('p')
container.innerHTML = ${JSON.stringify(new Remarkable().render(await res.text()))}
container.setAttribute('pre-compiled', true)
export default container`
}
