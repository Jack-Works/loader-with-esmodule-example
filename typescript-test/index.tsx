import * as React from 'https://unpkg.com/@pika/react@0.1.0/dist-es2019/react.min.js'
import * as ReactDOM from 'https://unpkg.com/@pika/react-dom@0.1.0/dist-es2019/react-dom.min.js'
import { App } from './app.tsx'

console.log(import.meta)
function x(y, z) {
    return import(Math.random() ? y : z)
}
console.log(x('./app.tsx', '@pika/react'))
const e = document.createElement('div')
ReactDOM.render(<App />, e)
export default e
