import article from './markdown-loader.js?src=./article.md'
import css from './css-module-loader.js?src=./style.css'

document.body.appendChild(document.createElement('div')).appendChild(article)
document.adoptedStyleSheets = [css]
