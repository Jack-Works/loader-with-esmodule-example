/**
 * This file (/loaders/typescript-shared-compiler.js) is compiled from /src/typescript/typescript-shared-compiler.ts
 * Do not modify the JS file directly!
 *
 * Use the following command to compile this file:
 * tsc -p ./src/typescript/tsconfig.json
 */
export const LoadedModules = new Map<string, ECMAScriptModule>()
let fetchFile: typeof import('../../loader-utils/load').fetchFile
let fetchFileSync: typeof import('../../loader-utils/load').fetchFileSync
let ts: typeof import('typescript')
export function configureTypeScriptSharedCompiler(
    fetchFile_: typeof fetchFile,
    fetchFileSync_: typeof fetchFileSync,
    TypeScript: typeof ts
) {
    fetchFile = fetchFile_
    fetchFileSync = fetchFileSync_
    ts = TypeScript
}
export function compileModule(filePath: string, fileContent: string): ECMAScriptModule {
    // const scriptKindMap = {
    //     js: ts.ScriptKind.JS,
    //     jsx: ts.ScriptKind.JSX,
    //     ts: ts.ScriptKind.TS,
    //     tsx: ts.ScriptKind.TSX
    // }
    // const fileExtension = filePath.split('.').slice(-1)[0] as keyof typeof scriptKindMap
    // const sourceFile = ts.createSourceFile(
    //     filePath,
    //     fileContent,
    //     ts.ScriptTarget.Latest,
    //     false,
    //     scriptKindMap[fileExtension] || ts.ScriptKind.Unknown
    // )
    // TODO: add SourceMap support?
    const { diagnostics = [], outputText, sourceMapText } = transpileModuleToSystemJS(fileContent)
    if (diagnostics.length) {
        const { messageText, start, file } = diagnostics[0]
        const error = new SyntaxError(typeof messageText === 'string' ? messageText : messageText.messageText)
        error.stack = `at ${file ? file.fileName : filePath}:${start}\n` + error.stack
        throw error
    }
    const module = new ECMAScriptModule(filePath)
    const script = `(function (System) {
    'use strict'
    ${outputText}
})`
    eval(script)(module)
    return module
}

function transpileModuleToSystemJS(source: string) {
    return ts.transpileModule(source, {
        compilerOptions: {
            module: ts.ModuleKind.System,
            target: ts.ScriptTarget.Latest,
            jsx: ts.JsxEmit.React
        }
    })
}
export class ECMAScriptModule {
    src: string
    private __staticImports: string[] = []
    get staticImports() {
        return this.__staticImports
    }
    set staticImports(val) {
        this.__staticImports = val
        this.resolvedStaticImports = this.updateResolvedStaticImports()
    }
    resolvedStaticImports: string[] = []
    private updateResolvedStaticImports() {
        return this.staticImports.map(path => {
            const waitForImport = resolveImportMap(path)
            const resolvedImportPath = new URL(waitForImport, this.src).toJSON()
            return resolvedImportPath
        })
    }
    exportBindings: Record<string, any> = {}
    private SystemJSModuleInstance!: ReturnType<SystemJSModule>
    constructor(src: string) {
        this.src = src = resolveImportMap(src)
        if (LoadedModules.has(src)) return LoadedModules.get(src)!
        LoadedModules.set(src, this)
    }
    register(staticImports: string[], SystemJSModule: SystemJSModule) {
        this.staticImports = staticImports
        this.SystemJSModuleInstance = SystemJSModule(
            (bindingName, value) => {
                this.exportBindings[bindingName] = value
            },
            Object.freeze({
                meta: Object.freeze({ url: new URL(this.src).toJSON() }),
                import: src => {
                    const resolvedPath = resolveImportMap(new URL(src, this.src).toJSON())
                    const cached = LoadedModules.get(resolvedPath)
                    if (cached) return Promise.resolve(cached.exportBindings)
                    return fetchFile(resolvedPath)
                        .then(code => compileModule(resolvedPath, code))
                        .then(x => x.exportBindings)
                }
            })
        )
    }
    static resolveStaticImports(absoluteImportPath: string, sync: true): ECMAScriptModule['exportBindings']
    static resolveStaticImports(absoluteImportPath: string, sync: false): Promise<ECMAScriptModule['exportBindings']>
    static resolveStaticImports(
        absoluteImportPath: string,
        sync: boolean
    ): ECMAScriptModule['exportBindings'] | Promise<ECMAScriptModule['exportBindings']> {
        // TODO: Find a esm ts?
        if (absoluteImportPath === 'https://www.unpkg.com/typescript@3.6.2/lib/typescript.js')
            return sync ? ts : Promise.resolve(ts)
        if (sync) {
            const nextModule = compileModule(absoluteImportPath, fetchFileSync(absoluteImportPath))
            return this.evalModuleSync(nextModule)
        } else {
            return fetchFile(absoluteImportPath)
                .then(file => compileModule(absoluteImportPath, file))
                .then(module => this.evalModuleAsync(module))
        }
    }
    static evalModuleSync(self: ECMAScriptModule) {
        for (const index in self.resolvedStaticImports) {
            const resolvedImportPath = self.resolvedStaticImports[index]
            const cache = LoadedModules.get(resolvedImportPath)
            if (cache) {
                self.SystemJSModuleInstance.setters[index](cache.exportBindings)
            } else {
                let exported = this.resolveStaticImports(resolvedImportPath, true)
                self.SystemJSModuleInstance.setters[index](exported)
            }
        }
        self.SystemJSModuleInstance.execute()
        return self.exportBindings
    }
    static async evalModuleAsync(self: ECMAScriptModule) {
        for (const index in self.resolvedStaticImports) {
            const resolvedImportPath = self.resolvedStaticImports[index]
            const cache = LoadedModules.get(resolvedImportPath)
            if (cache) {
                self.SystemJSModuleInstance.setters[index](cache.exportBindings)
            } else {
                let exported = await this.resolveStaticImports(resolvedImportPath, false)
                self.SystemJSModuleInstance.setters[index](exported)
            }
        }
        self.SystemJSModuleInstance.execute()
        return self.exportBindings
    }
}

function resolveImportMap(src: string): string {
    // run in service worker, browser will use it own importmap
    if (typeof document === 'undefined') return src
    const script = document.querySelector('script[type="importmap"]')
    if (!script) return src
    try {
        const map = JSON.parse(script.innerHTML).imports
        if (map[src]) return map[src][0]
        return src
    } catch (e) {
        console.warn('Parsing import map failed!', e)
        return src
    }
}
// Types
declare class URL {
    constructor(src: string, base?: string)
    toJSON(): string
}
declare const document: { querySelector: any } | undefined
declare const console: any
export type SystemJSModule = (
    /** The objects that this module exports */
    exported: (bindingName: string, value: any) => void,
    meta: {
        /** import.meta */
        meta: object
        /** Dynamic import */
        import(src: string): Promise<any>
    }
) => {
    /** When the imports resolves, call this function to pass the item in */
    setters: Array<(val: any) => void>
    /** Execute the module */
    execute(): any
}

const TypeScriptLoaderPath = '/loaders/typescript-loader.js'
type TransformationContext = import('typescript').TransformationContext
type TSNode = import('typescript').Node
type Expression = import('typescript').Expression
export function importPathTransformation(context: TransformationContext, baseURL: string) {
    return function visit<T extends TSNode>(node: T): T {
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
            return ts.createImportDeclaration(
                node.decorators,
                node.modifiers,
                node.importClause,
                nextModuleSpecifier
            ) as typeof node
        } else if (ts.isCallExpression(node)) {
            if (node.expression.kind === ts.SyntaxKind.ImportKeyword) {
                return transformDynamicImport(node.arguments, baseURL) as typeof node
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
