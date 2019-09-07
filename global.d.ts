declare module 'https://cdn.pika.dev/remarkable/v2' {
    export class Remarkable {
        render(markdown: string): string
    }
}
declare module 'https://unpkg.com/@pika/react@0.1.0/dist-es2019/react.min.js' {
    const x: typeof import('./node_modules/@types/react/index')
    export = x
}
declare module 'https://unpkg.com/@pika/react-dom@0.1.0/dist-es2019/react-dom.min.js' {
    const y: typeof import('./node_modules/@types/react-dom/index')
    export = y
}
declare const ts: typeof import('./node_modules/typescript/lib/typescript')
