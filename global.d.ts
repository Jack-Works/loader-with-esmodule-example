declare module 'https://cdn.pika.dev/remarkable/v2' {
    export class Remarkable {
        render(markdown: string): string
    }
}
declare const ts: typeof import('./node_modules/typescript/lib/typescript')
