import {
  AdacUserConfig,
  DomainResult,
  CategoriesResult,
  SuggestionResult,
  AdacErrorResponse,
  DomainPremiumResult
} from '@/resources/types.ts'
import { Hints } from '@/resources/types.ts'
import { onDomReady } from '@/utils.ts'

import WebsocketsAPI from '@/api.ts'

export default class ADAC {
    customerApiKey: string
    tldSetToken: string
    debug: boolean
    ote: boolean
    disableSSL: boolean
    apiHost: string
    api?: WebsocketsAPI
    hints: Hints
    onReady: () => void

    private constructor(apiKey: string, userConfig: AdacUserConfig = {} as AdacUserConfig, onReady?: () => void) {
        if (!apiKey) throw new Error('Please provide an API key')

        this.apiHost = 'adac.api.yoursrs.com'
        this.customerApiKey = apiKey
        this.tldSetToken = userConfig.tldSetToken ?? userConfig.priorityListToken  ?? ''
        this.debug = userConfig.debug || false
        this.ote = userConfig.ote || false
        this.disableSSL = userConfig.disableSsl || false
        this.hints = userConfig.hints || {}

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
            this.setupWebsocketsAPI()
        })

    }

    static initialize (apiKey: string, userConfig: AdacUserConfig, onReady?: () => void): ADAC {
        return new ADAC(apiKey, userConfig, onReady)
    }

    /**
     * Hook, called when a domain result came back.
     * @param {DomainResult | DomainPremiumResult} result
     */
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onDomainResult (result: DomainResult | DomainPremiumResult) {}

    /**
     * Hook, called when a suggestion result came back.
     * @param {SuggestionResult} result
     */
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onSuggestion (result: SuggestionResult) {}

    /**
     * Hook, called when categories came back.
     * @param {CategoriesResult[]} result
     */
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onCategories (result: CategoriesResult[]) {}

    /**
     * Hook, called when all suggestions have been generated.
     */
    // @ts-ignore
    onDone () {}

    /**
     * Hook, called when an error has occurred
     * @param {AdacErrorResponse} error
     */
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onClientError (error: AdacErrorResponse) {}


    /**
     * Set up the API that works via websockets.
     * @private
     */
    private setupWebsocketsAPI () {
        this.api = new WebsocketsAPI(this.customerApiKey, this.apiHost, this.debug, this.disableSSL)
        this.api.fetchCategories()
        this.api.onConnectionError = this.onConnectionError.bind(this)
        this.initializeActionListeners()
    }

    /**
     * Handler for when the API couldn't connect
     */
    onConnectionError () {
        // Retry connection after 1 second
        setTimeout(() => {
          this.setupWebsocketsAPI()
        }, 1000)
    }

    /**
     * Handler for domain_status action
     * @param {DomainResult | DomainPremiumResult} domainResult
     */
    // @ts-expect-error Call determined by string value in connection.onmessage
    private action_domain_status (domainResult: DomainResult | DomainPremiumResult) {
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
     * Handler for `done` action. The `done` action is called when the API has finished generating suggestions.
     * @private
     */
    // @ts-expect-error Call determined by string value in connection.onmessage
    private action_done () {
      if (this.debug) console.log('ADAC: action_done()')
      this.onDone()
    }

    /**
     * Process input from the input element.
     * @param {string} value - value from input element
     * @param {number[]} categories - categories to include TLDs from in the results
     * @param {Hints} hints - per-request configuration to pass to suggestion engines
     * @private
     */
    // @ts-ignore
    processInput (value: string, categories: number[] = [], hints: Hints = {}) {
      if (value !== '') {
          if (this.debug) console.log('ADAC: input given:', value)

          this.api?.getInputResults(categories, value, this.tldSetToken, { ...this.hints, ...hints })
      }
    }

    /**
     * Get domain suggestions for a given input.
     * @param {string} value
     * @param {Hints} hints
     */
    getSuggestions (value: string, hints: Hints = {}) {
      if (value !== '') {
        if (this.debug) console.log('ADAC: get suggestions for:', value)

        this.api?.getSuggestions(value, { ...this.hints, ...hints })
      }
    }

    /**
     * Initialize the websocket listeners.
     * @private
     */
    private initializeActionListeners () {
      const connection = this.api!.getConnection()

      if (connection) {
          connection.onopen = () => this.onReady()

          connection.onmessage = (message) => {
              const data = JSON.parse(message.data)
              // @ts-expect-error Can be ignored, the action is called dynamically
              this['action_' + data.action](data.data)
          }
      }
    }

}