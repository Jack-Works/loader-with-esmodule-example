import README from './markdown-loader.js?src=./README.md'
import css from './css-module-loader.js?src=./style.css'
import tsconfig from './json-module-loader.js?src=./tsconfig.json'

console.log('Loaded by JSON import', tsconfig)
document.body.appendChild(document.createElement('div')).appendChild(README)
document.adoptedStyleSheets = [css]

navigator.serviceWorker
    .register('./service-worker.js', {
        // DOMException: "type 'module' in RegistrationOptions is not implemented yet.
        // See https://crbug.com/824647 for details."
        // type: 'module'
    })
    .then(sw => console.log('Service worker registered!'), e => console.error((window.e = e)))
