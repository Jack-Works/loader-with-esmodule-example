import * as React from 'https://unpkg.com/@pika/react@0.1.0/dist-es2019/react.min.js'

export function App() {
    const [c, sC] = React.useState(0)
    return (
        <>
            <p>
                This code block is loaded by <code>import App from './index.tsx'</code>
            </p>
            <a onClick={() => sC(c + 1)}>Clicked {c} times</a>
        </>
    )
}
