import article from './markdown-loader.js?src=./article.md'
import css from './css-module-loader.js?src=./style.css'
import tsconfig from './json-module-loader.js?src=./tsconfig.json'

console.log('Loaded by JSON import', tsconfig)
document.body.appendChild(document.createElement('div')).appendChild(article)
document.adoptedStyleSheets = [css]
