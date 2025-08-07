import { Command, Hints, Action } from '@/resources/types.ts'
import { ensureSessionID } from '@/utils.ts'

/**
 * AJAX fallback API
 */
export default class AjaxAPI {
    reconnectTime = 3000
    apiKey: string
    host: string
    debug: boolean
    sslDisabled: boolean
    private connection: XMLHttpRequest | null = null

    constructor(apiKey: string, host: string, debug = false, sslDisabled = false) {
        ensureSessionID()
        this.apiKey = apiKey
        this.sslDisabled = sslDisabled
        this.debug = debug
        this.host = host
        this.connection = null
    }

    /**
     * Get url for http requests.
     * @private
     */
    private getURL(): string {
        return (this.sslDisabled ? 'http' : 'https') + '://' + this.host + '/ajax'
    }

    /**
     * Send a command over an active connection
     * @param {string} method - method to use.
     * @param {Command} command - command to send.
     * @private
     */
    private sendCommand(method: string, command: Command): void {
        if (!command) return

        const xhr = this.setupConnection(command.action)

        xhr.open(method, this.getURL() + '?session_id=' + sessionStorage.getItem('sessionId'), true)

        if (method === 'POST') {
            xhr.setRequestHeader('Content-Type', 'application/json')
        }

        if (this.debug) {
            console.log('ADAC: xhr.send:', command)
        }

        xhr.send(JSON.stringify(command))
    }

    /**
     * Set up a connection over http(s)
     * @param {Action} action - action to setup
     * @private
     */
    private setupConnection(action: Action): XMLHttpRequest {
        if (this.connection && action === 'poll') {
            return this.connection
        }

        const connection = new XMLHttpRequest()

        connection.responseType = 'json'
        connection.onreadystatechange = () => {
            if (connection.readyState === XMLHttpRequest.DONE) {
                if (connection.status === 200) {
                    const responseData = connection.response
                    if (Array.isArray(responseData)) {
                        if (this.debug) {
                            console.log('non-empty xhr response!')
                        }
                        responseData.forEach((data: any) => {
                            this.onAction('action_' + data.action, data.data)
                        })
                    }
                    if (action === 'poll') {
                        this.pollServer()
                    }
                } else {
                    setTimeout(() => {
                        if (this.debug) {
                            console.log('ADAC: Fallback failed, reconnecting to websocket...')
                        }
                        this.onConnectionError()
                    }, this.reconnectTime)
                }
            }

            if (action === 'poll') this.connection = connection
        }

        return connection
    }

    /**
     * Placeholder for when the client has been disconnected.
     */
    onConnectionError() {}

    /**
     * Placeholder for when an action has to be performed.
     * @param {string} action - action to perform
     * @param {Record<any, any>} data - data received from performed action
     */
    // @ts-ignore
    onAction(action: string, data: Record<any, any>) {}

    /**
     * Get results based on a given input.
     * @param {number[]} categoryIds - array of active categories.
     * @param {string} inputValue - user input value.
     * @param {string} tldSetToken - token for tld set to use.
     * @param {Hints} hints - per-request configuration to pass to suggestion engines
     */
    getInputResults(categoryIds: number[], inputValue: string, tldSetToken: string, hints: Hints | null = null) {
        this.sendCommand('POST', {
            api_key: this.apiKey,
            action: 'input',
            data: {
                tld_set_token: tldSetToken,
                input: inputValue,
                categories: categoryIds,
                hints: hints || {},
            }
        })
    }

    /**
     * Fetch all available categories.
     */
    fetchCategories() {
        this.sendCommand('POST', {
            api_key: this.apiKey,
            action: 'categories',
            data: ''
        })
    }

    /**
     * Poll the server
     */
    pollServer() {
        this.sendCommand('GET', {
            api_key: this.apiKey,
            action: 'poll',
            data: ''
        })
    }

}
