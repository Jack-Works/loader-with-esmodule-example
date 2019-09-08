/**
 * This file (service-worker.js) is compiled from ./service-worker.ts
 */
async function loadLoader(url: URL, loader: Loader) {
    const request = await fetch(url.searchParams.get('src')!)
    if (!request.ok) return request
    const file = await loader.transpiler(request)
    const headers = new Headers(request.headers)
    headers.set('content-type', 'application/javascript')
    headers.set('content-length', file.length.toString())
    return new Response(file, { headers })
}

function init(this: ServiceWorkerGlobalScope) {
    this.addEventListener('fetch', e => {
        const url = new URL(e.request.url)
        if (url.origin !== location.origin) return
        for (const loader of Loader.loaders) {
            if (url.pathname === loader.fallbackURL) {
                e.respondWith(loadLoader(url, loader))
            }
        }
    })
}

class Loader {
    /**
     * @param fallbackURL The fallback URL
     * @param transpiler The transpiler
     */
    constructor(public fallbackURL: string, public transpiler: (res: Response) => Promise<string>) {}
    static loaders: Loader[] = []
    static add(loader: Loader) {
        this.loaders.push(loader)
    }
}

Loader.add(
    new Loader(
        '/loaders/css-module-loader.js',
        async res =>
            `const container = new CSSStyleSheet()
container.replace(${JSON.stringify(await res.text())})
export default container`
    )
)

Loader.add(
    new Loader(
        '/loaders/json-module-loader.js',
        async res => `export default JSON.parse(${JSON.stringify(await res.text())})`
    )
)
Object.assign(globalThis, { window: globalThis, process: { argv: [] } })
importScripts('https://unpkg.com/marked@0.7.0/marked.min.js')
declare const marked: (md: string) => string
Loader.add(
    new Loader(
        '/loaders/markdown-loader.js',
        async res => `const container = document.createElement('p')
container.innerHTML = ${JSON.stringify(marked(await res.text()))}
export default container`
    )
)

importScripts('https://www.unpkg.com/typescript@3.6.2/lib/typescript.js')
declare const ts: typeof import('./node_modules/typescript/lib/typescript')
const TypeScriptLoaderPath = '/loaders/typescript-loader.js'
Loader.add(
    new Loader(
        TypeScriptLoaderPath,
        async res =>
            ts.transpileModule(await res.text(), {
                compilerOptions: {
                    module: ts.ModuleKind.ESNext,
                    jsx: ts.JsxEmit.React,
                    allowJs: true,
                    target: ts.ScriptTarget.ESNext
                },
                fileName: res.url,
                transformers: {
                    before: [
                        context => {
                            const visit = createReplacer(context, res.url)
                            return node => ts.visitNode(node, visit)
                        }
                    ]
                }
            }).outputText
    )
)
type TransformationContext = import('./node_modules/typescript/lib/typescript').TransformationContext
type Node = import('./node_modules/typescript/lib/typescript').Node
type Expression = import('./node_modules/typescript/lib/typescript').Expression
function createReplacer(context: TransformationContext, baseURL: string) {
    return function visit(node: Node): Node {
        if (ts.isImportDeclaration(node)) {
            let nextModuleSpecifier
            if (ts.isStringLiteral(node.moduleSpecifier)) {
                if (node.moduleSpecifier.text[0] === '/' || node.moduleSpecifier.text[0] === '.') {
                    nextModuleSpecifier = ts.createStringLiteral(
                        TypeScriptLoaderPath + '?src=' + new URL(node.moduleSpecifier.text, baseURL)
                    )
                } else {
                    // unknown source
                    // like "@pika/react"
                    nextModuleSpecifier = node.moduleSpecifier
                }
            } else {
                throw new Error('Invalid module specifier')
            }
            return ts.createImportDeclaration(node.decorators, node.modifiers, node.importClause, nextModuleSpecifier)
        } else if (ts.isCallExpression(node)) {
            if (node.expression.kind === ts.SyntaxKind.ImportKeyword) {
                return transformDynamicImport(node.arguments, baseURL)
            }
        }
        return ts.visitEachChild(node, child => visit(child), context)
    }
}
function transformDynamicImport(args: readonly Expression[], baseURL: string) {
    // @ts-ignore
    const importToken: ts.Expression = ts.createToken(ts.SyntaxKind.ImportKeyword)
    return ts.createCall(importToken, undefined, [
        ts.createCall(
            ts.createParen(
                ts.createArrowFunction(
                    undefined,
                    undefined,
                    [
                        ts.createParameter(
                            undefined,
                            undefined,
                            undefined,
                            ts.createIdentifier('x'),
                            undefined,
                            undefined,
                            undefined
                        )
                    ],
                    undefined,
                    ts.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                    ts.createConditional(
                        ts.createBinary(
                            ts.createCall(
                                ts.createPropertyAccess(ts.createIdentifier('x'), ts.createIdentifier('startsWith')),
                                undefined,
                                [ts.createStringLiteral('.')]
                            ),
                            ts.createToken(ts.SyntaxKind.BarBarToken),
                            ts.createCall(
                                ts.createPropertyAccess(ts.createIdentifier('x'), ts.createIdentifier('startsWith')),
                                undefined,
                                [ts.createStringLiteral('/')]
                            )
                        ),
                        ts.createBinary(
                            ts.createStringLiteral(TypeScriptLoaderPath + '?src='),
                            ts.createToken(ts.SyntaxKind.PlusToken),
                            ts.createPropertyAccess(
                                ts.createNew(ts.createIdentifier('URL'), undefined, [
                                    ts.createIdentifier('x'),
                                    ts.createStringLiteral(baseURL)
                                ]),
                                ts.createIdentifier('pathname')
                            )
                        ),
                        ts.createIdentifier('x')
                    )
                )
            ),
            undefined,
            args
        )
    ])
}
