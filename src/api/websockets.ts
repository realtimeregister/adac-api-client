import { ensureSessionID } from '../utils'
import { Command, Hints } from '../resources/types'
import { ActionEnum } from '../resources/enums'


export default class WebsocketsAPI {
    reconnectTime = 3000
    apiKey: string
    readonly connection: WebSocket
    host: string
    debug: boolean
    sslDisabled: boolean

    /**
     * @param ApiKey - customer api key
     * @param host - api host
     * @param debug - use debug mode
     * @param sslDisabled - disable/enable ssl
     */
    constructor(ApiKey: string, host: string, debug = false, sslDisabled = false) {
        ensureSessionID()
        this.apiKey = ApiKey
        this.host = host
        this.debug = debug
        this.sslDisabled = sslDisabled
        this.connection = this.setupConnection()

        if (debug && this.connection) {
            console.log('ADAC: Connection successful')
        }

    }

    onConnectionError (): void {}

    /**
     * Send a command to the current connection.
     * @param {Command} command - command to send.
     * @private
     */
    private sendCommand (command: Command) {
        if (this.connection.readyState !== 1) {
            setTimeout(() => {
                this.sendCommand(command)
            }, 100)
            return
        }

        this.connection.send(JSON.stringify(command))
    }

    /**
     * Get websocket url
     * @private
     */
    private getWebsocketUrl () {
        return (this.sslDisabled ? 'ws' : 'wss') + '://' + this.host + '/ws'
    }

    /**
     * Setup the websocket connection
     * @private
     */
    private setupWebsocketConnection () {
        const connection = new WebSocket(this.getWebsocketUrl() + '?session_id=' + sessionStorage.getItem('sessionId'))

        connection.onclose = (event) => {
            if (this.debug) console.log('ADAC: Websocket connection closed')
            if (event.code === 1006 && !event.wasClean) {
                if (this.debug) console.log('ADAC: Websocket failed, using fallback')
                this.onConnectionError()
            } else {
                setTimeout(() => {
                    if (this.debug) console.log('ADAC: Retry connecting to Websocket')
                    this.setupConnection()
                }, this.reconnectTime)
            }
        }

        return connection
    }

    /**
     * Retrieve the websocket connection
     */
    getConnection () {
        return this.connection
    }

    /**
     *
     * @param categoryIds
     * @param inputValue
     * @param tldSetToken
     * @param hints
     */
    getInputResults (categoryIds: number[], inputValue: string, tldSetToken: string, hints: Hints | null = null) {
        this.sendCommand({
            api_key: this.apiKey,
            action: ActionEnum.INPUT,
            data: {
                tld_set_token: tldSetToken,
                input: inputValue,
                categories: categoryIds,
                hints: hints || {},
            }
        })
    }

    fetchCategories () {
        this.sendCommand({
            api_key: this.apiKey,
            action: ActionEnum.CATEGORIES,
            data: ''
        })
    }

    private setupConnection () {
        if (this.debug) console.log('ADAC: Setting up connection...')
        return this.setupWebsocketConnection()
    }

}