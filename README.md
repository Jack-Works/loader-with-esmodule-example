# loader-with-esmodule-example

Transpile files without any build step in browser directly

Just like using Webpack, we load files in this way

```js
import README from '/loaders/markdown-loader.js?src=/README.md'
import css from '/loaders/css-module-loader.js?src=/style.css'
import tsconfig from '/loaders/json-module-loader.js?src=/tsconfig.json'
import App from '/loaders/typescript-loader.js?src=/typescript-test/index.tsx'
```

For the first time, it will loaded by the real "markdown-loader.js"

After the first access, a ServiceWorker will be installed and ongoing requests are transpiled by the ServiceWorker

## First time access

-   [x] Markdown (return a `<p>` element)
-   [x] CSS (return a `CSSStyleSheet` object)
-   [x] JSON (return the JSON)
-   [x] TypeScript (only `export default` can be accessed due to tech limitation)

## Second time access

-   [x] Markdown
-   [x] CSS
-   [x] JSON
-   [x] TypeScript (limitation listed above has gone!)
