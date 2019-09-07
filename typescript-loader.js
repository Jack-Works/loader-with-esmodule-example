import { SyncXHR, parseSrc, fetchFile } from './loader-utils/load.js'

const entryPoint = parseSrc(import.meta.url, import.meta.url)
console.log('Loading TypeScript', entryPoint)

const $exports = Symbol('System JS exports')
const $module = Symbol('System JS module')
/**
 * @type {Map<string, Module>}
 */
const LoadedModules = new Map()
class Module {
    /**
     * @param {string} src
     */
    constructor(src) {
        this.src = src
        if (LoadedModules.has(src)) return LoadedModules.get(src)
        LoadedModules.set(src, this)
    }
    [$exports] = {};
    /**
     * @type {{ setters: Array<(val: any) => void>, execute(): any }}
     */
    [$module] = {}
    register(dependencies, executor) {
        this.dependencies = dependencies
        this[$module] = executor(
            (name, value) => {
                this[$exports][name] = value
            },
            Object.freeze({
                meta: Object.freeze({ url: new URL(this.src).toJSON() }),
                import: src =>
                    fetchFile(src)
                        .then(code => loadModule(new URL(src, this.src).toJSON(), code))
                        .then(x => x[$exports])
            })
        )
    }
    /**
     * @param {Module} self
     */
    static execute(self) {
        for (const index in self.dependencies) {
            self[$module].setters[index] = loadModule(new URL(dep, src).toJSON(), SyncXHR(src))
        }
        self[$module].execute()
        return self[$exports]
    }
}
/**
 * @param {string} src
 * @param {string} code
 * @returns {Module}
 */
function loadModule(src, code) {
    const sourceFile = ts.createSourceFile(
        src,
        code,
        ts.ScriptTarget.Latest,
        false,
        src.endsWith('tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS
    )
    const compiled = transpileModuleToSystemJS(code)
    if (compiled.diagnostics.length) {
        const { messageText, start, file } = module.diagnostics[0]
        const error = new SyntaxError(messageText)
        error.stack = `at ${file.fileName}:${start}`
        throw error
    }
    const module = new Module(src)
    const script = `(function (System) {
    ${compiled.outputText}
})`
    eval(script)(module)
    return module
}
export default Module.execute(loadModule(entryPoint, SyncXHR(entryPoint))).default

/**
 * @param {string} source
 */
function transpileModuleToSystemJS(source) {
    return ts.transpileModule(source, {
        compilerOptions: { module: ts.ModuleKind.System, target: ts.ScriptTarget.Latest }
    })
}
