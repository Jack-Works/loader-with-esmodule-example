const src = new URL(import.meta.url).searchParams.get('src')
const container = new CSSStyleSheet()

console.log('Loading css', src)

fetch(src)
    .then(x => x.text())
    .then(x => container.replace(x))

export default container
