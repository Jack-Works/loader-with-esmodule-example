import README from '/loaders/markdown-loader.js?src=/README.md'
import css from '/loaders/css-module-loader.js?src=/style.css'
import tsconfig from '/loaders/json-module-loader.js?src=/tsconfig.json'
import App from '/loaders/typescript-loader.js?src=/typescript-test/index.tsx'

document.body.appendChild(App)
console.log('Loaded by JSON import', tsconfig)
document.body.appendChild(document.createElement('div')).appendChild(README)
document.adoptedStyleSheets = [css]

navigator.serviceWorker.register('/typescript-serviceworker-loader.js').then(
    sw => {
        console.log('Service worker registered!')
    },
    async err => {
        console.error(err)
        const sw = await navigator.serviceWorker.getRegistration('/typescript-serviceworker-loader.js')
        if (sw) sw.unregister()
    }
)
