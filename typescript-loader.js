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
        this.src = src = resolveImportMap(src)
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
                import: src => {
                    const resolvedPath = resolveImportMap(new URL(src, this.src).toJSON())
                    const cached = LoadedModules.get(resolvedPath)[$exports]
                    if (cached) return Promise.resolve(cached)
                    return fetchFile(resolvedPath)
                        .then(code => loadModule(resolvedPath, code))
                        .then(x => x[$exports])
                }
            })
        )
    }
    /**
     * @param {Module} self
     */
    static execute(self) {
        for (const index in self.dependencies) {
            const waitForImport = resolveImportMap(self.dependencies[index])
            const currentFile = self.src
            const resolvedImportPath = new URL(waitForImport, currentFile).toJSON()
            const cache = LoadedModules.get(resolvedImportPath)
            if (cache) {
                self[$module].setters[index](cache[$exports])
            } else {
                const nextModule = loadModule(resolvedImportPath, SyncXHR(resolvedImportPath))
                this.execute(nextModule)
                self[$module].setters[index](nextModule[$exports])
            }
        }
        console.log('Executing', self.src)
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
        compilerOptions: {
            module: ts.ModuleKind.System,
            target: ts.ScriptTarget.Latest,
            jsx: ts.JsxEmit.React
        }
    })
}

/**
 * @param {string} src
 */
function resolveImportMap(src) {
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
