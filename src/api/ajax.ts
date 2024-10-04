import { Command } from '../resources/types'
import { ActionEnum } from '../resources/enums'

/**
 * AJAX fallback API
 */
export default class AjaxAPI {
    RECONNECT_TIME = 3000
    API_KEY: string
    host: string
    debug: boolean
    sslDisabled: boolean
    private readonly connections: Record<string, XMLHttpRequest>

    constructor(ApiKey: string, host: string, debug = false, sslDisabled = false) {
        this.API_KEY = ApiKey
        this.sslDisabled = sslDisabled
        this.debug = debug
        this.host = host
        this.connections = {}
    }

    /**
     * Get url for http requests.
     * @private
     */
    private getURL() {
        return (this.sslDisabled ? 'http' : 'https') + '://' + this.host + '/ajax'
    }

    /**
     * Send a command over an active connection
     * @param {string} method - method to use.
     * @param {Command} command - command to send.
     * @private
     */
    private sendCommand(method: string, command: Command) {
        if (!command) return

        const xhr = this.setupConnection(command.action)

        xhr.open(method, this.getURL() + '?session_id=' + localStorage.getItem('sessionId'), true)

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
     * @param {ActionEnum} action - action to setup
     * @private
     */
    private setupConnection(action: ActionEnum): XMLHttpRequest {
        let xhr = this.connections[action]

        if (!xhr) {
            xhr = new XMLHttpRequest()

            xhr.responseType = 'json'
            xhr.onreadystatechange = () => {
                if (xhr.readyState === XMLHttpRequest.DONE) {
                    if (xhr.status === 200) {
                        const responseData = xhr.response
                        if (Array.isArray(responseData)) {
                            if (this.debug) {
                                console.log('non-empty xhr response!')
                            }
                            responseData.forEach((data: any) => {
                                this.onAction('action_' + data.action, data.data)
                            })
                        }
                        if (action === ActionEnum.POLL) {
                            this.pollServer()
                        }
                    } else {
                        setTimeout(() => {
                            if (this.debug) {
                                console.log('ADAC: Fallback failed, reconnecting to websocket...')
                            }
                            this.onConnectionError()
                        }, this.RECONNECT_TIME)
                    }
                }
            }

            this.connections[action] = xhr
        }

        return xhr
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
     * @param {string} TLD_SET_TOKEN - token for tld set to use.
     */
    getInputResults(categoryIds: number[], inputValue: string, TLD_SET_TOKEN: string) {
        this.sendCommand('POST', {
            api_key: this.API_KEY,
            action: ActionEnum.INPUT,
            data: {
                tld_set_token: TLD_SET_TOKEN,
                input: inputValue,
                categories: categoryIds
            }
        })
    }

    /**
     * Fetch all available categories.
     */
    fetchCategories() {
        this.sendCommand('POST', {
            api_key: this.API_KEY,
            action: ActionEnum.CATEGORIES,
            data: ''
        })
    }

    /**
     * Poll the server
     */
    pollServer() {
        this.sendCommand('GET', {
            api_key: this.API_KEY,
            action: ActionEnum.POLL,
            data: ''
        })
    }

}
