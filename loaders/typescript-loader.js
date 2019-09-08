import { fetchFileSync, parseSrc, fetchFile } from '../loader-utils/load.js'
import {
    configureTypeScriptSharedCompiler,
    ECMAScriptModule,
    compileModule,
    importPathTransformation
} from '../loader-utils/typescript-shared-compiler.js'

/** @type {import('typescript')} */
const ts = globalThis.ts
configureTypeScriptSharedCompiler(fetchFile, fetchFileSync, ts)
export default typeof document === 'object' ? runtimeCompile() : undefined

function runtimeCompile() {
    const entryPoint = parseSrc(import.meta.url, location.origin)
    return ECMAScriptModule.evalModuleSync(compileModule(entryPoint, fetchFileSync(entryPoint))).default
}

/**
 * @param {Response} res
 */
export async function swCompile(res) {
    return ts.transpileModule(await res.text(), {
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
                    const visit = importPathTransformation(context, res.url)
                    return node => ts.visitNode(node, visit)
                }
            ]
        }
    }).outputText
}
