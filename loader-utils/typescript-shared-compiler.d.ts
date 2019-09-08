/**
 * This file (/loaders/typescript-shared-compiler.js) is compiled from /src/typescript/typescript-shared-compiler.ts
 * Do not modify the JS file directly!
 *
 * Use the following command to compile this file:
 * tsc -p ./src/typescript/tsconfig.json
 */
export declare const LoadedModules: Map<string, ECMAScriptModule>;
declare let fetchFile: typeof import('../../loader-utils/load').fetchFile;
declare let fetchFileSync: typeof import('../../loader-utils/load').fetchFileSync;
declare let ts: typeof import('typescript');
export declare function configureTypeScriptSharedCompiler(fetchFile_: typeof fetchFile, fetchFileSync_: typeof fetchFileSync, TypeScript: typeof ts): void;
export declare function compileModule(filePath: string, fileContent: string): ECMAScriptModule;
export declare class ECMAScriptModule {
    src: string;
    private __staticImports;
    staticImports: string[];
    resolvedStaticImports: string[];
    private updateResolvedStaticImports;
    exportBindings: Record<string, any>;
    private SystemJSModuleInstance;
    constructor(src: string);
    register(staticImports: string[], SystemJSModule: SystemJSModule): void;
    static resolveStaticImports(absoluteImportPath: string, sync: true): ECMAScriptModule['exportBindings'];
    static resolveStaticImports(absoluteImportPath: string, sync: false): Promise<ECMAScriptModule['exportBindings']>;
    static evalModuleSync(self: ECMAScriptModule): Record<string, any>;
    static evalModuleAsync(self: ECMAScriptModule): Promise<Record<string, any>>;
}
export declare type SystemJSModule = (
/** The objects that this module exports */
exported: (bindingName: string, value: any) => void, meta: {
    /** import.meta */
    meta: object;
    /** Dynamic import */
    import(src: string): Promise<any>;
}) => {
    /** When the imports resolves, call this function to pass the item in */
    setters: Array<(val: any) => void>;
    /** Execute the module */
    execute(): any;
};
declare type TransformationContext = import('typescript').TransformationContext;
export declare function importPathTransformation(context: TransformationContext, baseURL: string): <T extends import("typescript").Node>(node: T) => T;
export {};
