# loader-with-esmodule-example

Transpile files without any build step in browser directly

Just like using Webpack, we load files in this way

```js
import article from './markdown-loader.js?src=./article.md'
import css from './css-module-loader.js?src=./style.css'
import tsconfig from './json-module-loader.js?src=./tsconfig.json'
```

For the first time, it will loaded by the real "markdown-loader.js"

After the fisrt access, a ServiceWorker will be installed and ongoing requests are transpiled by the ServiceWorker
