import { Remarkable } from 'https://cdn.pika.dev/remarkable/v2'

const src = new URL(import.meta.url).searchParams.get('src')
const container = document.createElement('p')

fetch(src)
    .then(x => x.text())
    .then(x => new Remarkable().render(x))
    .then(x => (container.innerHTML = x))

export default container
