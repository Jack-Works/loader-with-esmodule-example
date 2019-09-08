import { parseSrc } from '../loader-utils/load.js'
export default typeof document === 'object' ? runtimeCompile() : undefined

function runtimeCompile() {
    const src = parseSrc(import.meta.url, location.origin)
    const css = new CSSStyleSheet()

    fetch(src)
        .then(x => x.text())
        .then(x => css.replace(x))
    return css
}

/**
 * @param {Response} res
 */
export async function swCompile(res) {
    return `const css = new CSSStyleSheet()
css.replace(${JSON.stringify(await res.text())})
export default css`
}
