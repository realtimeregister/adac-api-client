import { ensureSessionID } from '@/utils.ts'
import type { Command, Hints } from '@/resources/types.ts'


export default class WebsocketsAPI {
    /** First reconnect delay; doubles on each failed attempt, up to maxReconnectTime. */
    reconnectTime = 1000
    maxReconnectTime = 10000
    /** How long a connection must stay open before the reconnect delay is reset. */
    stableTime = 5000
    apiKey: string
    connection: WebSocket
    host: string
    debug: boolean
    sslDisabled: boolean
    private retries = 0
    private stableTimer?: ReturnType<typeof setTimeout>

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
     * Hook, called each time a connection opens, including after a reconnect.
     */
    onOpen (): void {}

    /**
     * Hook, called when a message comes in on the current connection.
     * @param {MessageEvent} message
     */
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onMessage (message: MessageEvent): void {}

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

        connection.onopen = () => {
            // Only reset the backoff once the connection has stayed up for a while, so a
            // server that accepts and then closes straight away isn't retried every second.
            this.stableTimer = setTimeout(() => {
                this.retries = 0
            }, this.stableTime)
            this.onOpen()
        }

        connection.onmessage = (message) => this.onMessage(message)

        // Whatever the close code, reconnect with backoff and make the new socket the
        // current one. Commands still waiting in sendCommand then go out on it.
        connection.onclose = (event) => {
            clearTimeout(this.stableTimer)
            if (this.debug) console.log('ADAC: Websocket connection closed')
            if (event.code === 1006 && !event.wasClean) this.onConnectionError()

            const delay = Math.min(this.reconnectTime * 2 ** this.retries, this.maxReconnectTime)
            this.retries++
            setTimeout(() => {
                if (this.debug) console.log('ADAC: Retry connecting to Websocket')
                this.connection = this.setupConnection()
            }, delay)
        }

        return connection
    }

    /**
     * Retrieve the current websocket connection. It is replaced on reconnect.
     */
    getConnection () {
        return this.connection
    }

    /**
     * Get domain results and suggestions based on a given input.
     * @param categoryIds
     * @param inputValue
     * @param tldSetToken
     * @param hints
     */
    getInputResults (categoryIds: number[], inputValue: string, tldSetToken: string, hints: Hints | null = null) {
        this.sendCommand({
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
   * Get domain suggestions for a given input.
   * @param {string} input
   * @param {Hints} hints
   */
    getSuggestions (input: string, hints?: Hints) {
      this.sendCommand({
        api_key: this.apiKey,
        action: 'suggest',
        data: {
          input,
          hints
        }
      })
    }

    fetchCategories () {
        this.sendCommand({
            api_key: this.apiKey,
            action: 'categories',
            data: ''
        })
    }

    private setupConnection () {
        if (this.debug) console.log('ADAC: Setting up connection...')
        return this.setupWebsocketConnection()
    }

}