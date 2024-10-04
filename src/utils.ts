/**
 * Execute a callback function when the DOM is ready.
 * @param {Function} fn - callback function.
 */
export function onDomReady(fn: () => any) {
    if (document.readyState !== 'loading') {
        fn()
    } else if ( document.addEventListener ) {
        document.addEventListener('DOMContentLoaded', fn)
    } else {
        (document as any).attachEvent('onreadystatechange', function () {
            if (document.readyState !== 'loading') {
                fn()
            }
        })
    }
}

/**
 * Generate a UUID
 */
export function generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0
        const v = c === 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16) 
    })
}

/**
 * Ensure a session ID is set for the current user.
 */
export function ensureSessionID(): void {
    if (localStorage.getItem('sessionId') === null) {
        localStorage.setItem('sessionId', generateUUID())
    }
}