import { AdacUserConfig, DomainResult, CategoriesResult, SuggestionResult, AdacErrorResponse } from './resources/types'
import { onDomReady } from './utils'

import WebsocketsAPI from './api/websockets'
import AjaxAPI from './api/ajax'

export default class ADAC {
    customerApiKey: string
    tldSetToken: string
    debug: boolean
    ote: boolean
    disableSSL: boolean
    apiHost: string
    api: WebsocketsAPI | AjaxAPI | null = null
    onReady: () => void

    private constructor(apiKey: string, userConfig: AdacUserConfig = {} as AdacUserConfig, onReady: () => void) {
        if (!apiKey) throw new Error('Please provide an API key')

        this.apiHost = 'adac.api.yoursrs.com'
        this.customerApiKey = apiKey
        this.tldSetToken = userConfig.tldSetToken ?? userConfig.priorityListToken  ?? ''
        this.debug = userConfig.debug || false
        this.ote = userConfig.ote || false
        this.disableSSL = userConfig.disable_ssl || false
        this.disableSSL = userConfig.disableSsl || false

        if (typeof onReady === 'function') {
            this.onReady = onReady
        } else {
            this.onReady = () => {}
        }

        if (userConfig.apiHost) {
            this.apiHost = userConfig.apiHost
        }

        if (userConfig.ote) {
            this.apiHost = 'adac.api.yoursrs-ote.com'
        }

        onDomReady(() => {
            if (!window.WebSocket) {
                this.setupAjaxAPI()
            } else {
                this.setupWebsocketsAPI()
            }

            // @ts-expect-error Api will be defined in either setupWebSocketsAPI() or setupAjaxAPI()
            this.api.onConnectionError = this.onConnectionError.bind(this)
        })

    }

    static initialize (ApiKey: string, userConfig: AdacUserConfig, onReady: () => void): ADAC {
        return new ADAC(ApiKey, userConfig, onReady)
    }

    /**
     * Hook, called when a domain result came back.
     * @param {DomainResult} result
     */
    // @ts-ignore
    onDomainResult (result: DomainResult) {}

    /**
     * Hook, called when a suggestion result came back.
     * @param {SuggestionResult} result
     */
    // @ts-ignore
    onSuggestion (result: SuggestionResult) {}

    /**
     * Hook, called when categories came back.
     * @param {CategoriesResult[]} result
     */
    // @ts-ignore
    onCategories (result: CategoriesResult[]) {}

    /**
     * Hook, called when an error has occurred
     * @param {AdacErrorResponse} error
     */
    // @ts-ignore
    onClientError (error: AdacErrorResponse) {}


    /**
     * Set up the API that works via websockets.
     * @private
     */
    private setupWebsocketsAPI () {
        this.api = new WebsocketsAPI(this.customerApiKey, this.apiHost, this.debug, this.disableSSL)
        this.api.fetchCategories()
        this.initializeActionListeners()
    }

    /**
     * Set up the Ajax API
     * @private
     */
    private setupAjaxAPI () {
        this.api = new AjaxAPI(this.customerApiKey, this.apiHost, this.debug, this.disableSSL)
        this.api.onAction = (action: string, data: SuggestionResult | CategoriesResult[] | DomainResult | Error) => {
            // @ts-expect-error dynamic function call
            this[action](data)
        }
        this.api.fetchCategories()
        this.api.pollServer()
        this.onReady()
    }

    /**
     * Handler for when the API couldn't connect
     */
    onConnectionError () {
        if (this.api instanceof WebsocketsAPI) {
            this.setupAjaxAPI()
        } else if (this.api instanceof AjaxAPI) {
            this.setupWebsocketsAPI()
        }
        if (this.api) {
            this.api.onConnectionError = this.onConnectionError.bind(this)
        }
    }

    /**
     * Handler for domain_status action
     * @param {DomainResult} domainResult
     */
    // @ts-expect-error Call determined by string value in connection.onmessage
    private action_domain_status (domainResult: DomainResult) {
        if (this.debug) console.log('ADAC: action_domain_status() progress: ', domainResult)
        this.onDomainResult(domainResult)
    }

    /**
     * Handler for categories action
     * @param {CategoriesResult} categoriesResult
     */
    // @ts-expect-error Call determined by string value in connection.onmessage
    private action_categories (categoriesResult: CategoriesResult[]) {
        if (this.debug) console.log('ADAC: action_categories() progress:', categoriesResult)
        this.onCategories(categoriesResult)
    }

    /**
     * Handler for suggestion action
     * @param {SuggestionResult} suggestionResult
     */
    // @ts-expect-error Call determined by string value in connection.onmessage
    private action_suggestion (suggestionResult: SuggestionResult) {
        if (this.debug) console.log('ADAC: action_suggestion() progress:', suggestionResult)
        this.onSuggestion(suggestionResult)
    }

    /**
     * Handler for error messages
     * @param {AdacErrorResponse} error
     */
    // @ts-expect-error Call determined by string value in connection.onmessage
    private action_error (error: AdacErrorResponse) {
        if (this.debug) console.log('ADAC: action_error():', error)
        this.onClientError(error)
    }

    /**
     * Process input from the input element.
     * @param {string} value - value from input element
     * @param {number[]} categories
     * @private
     */
    // @ts-ignore
    processInput (value: string, categories: number[] = []) {
        if (value !== '') {
            if (this.debug) console.log('ADAC: input given:', value)

            this.api?.getInputResults(categories, value, this.tldSetToken)
        }
    }

    /**
     * Initialize the websocket listeners.
     * @private
     */
    private initializeActionListeners () {
        if (this.api instanceof WebsocketsAPI) {
            const connection = this.api.getConnection()

            if (connection) {
                connection.onopen = () => {
                    this.onReady()
                }

                connection.onmessage = (message) => {
                    const data = JSON.parse(message.data)
                    // @ts-expect-error Can be ignored, the action is called dynamically
                    this['action_' + data.action](data.data)
                }
            }
        }
    }

}