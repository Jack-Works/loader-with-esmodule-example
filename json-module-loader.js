const src = new URL(import.meta.url).searchParams.get('src')
console.log('Loading JSON', src)

const req = new XMLHttpRequest()
req.open('GET', src, false)
req.send(null)
export default JSON.parse(req.responseText)
