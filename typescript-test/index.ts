console.log('My import.meta', import.meta)
const x = y => import(y)
globalThis._import = x
export const symbol = Symbol()
export default symbol
