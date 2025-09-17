import {
  DomainsBotOptions,
  NameSuggestionOptions,
  PrefixesSuffixesOptions,
  RnsOptions,
  SidnOptions
} from '@/resources/hints.types.ts'

export interface AdacUserConfig {
    tldSetToken: string;
    priorityListToken?: string;
    debug?: boolean;
    ote?: boolean;
    disableSsl?: boolean;
    apiHost?: string;
    hints?: Hints,
}

export const DomainStatuses = {
  DOMAIN_STATUS_WAITING: 0,
  DOMAIN_STATUS_AVAILABLE: 1,
  DOMAIN_STATUS_TAKEN: 2,
  DOMAIN_STATUS_INVALID: 3,
  DOMAIN_STATUS_ERROR: 4,
  DOMAIN_STATUS_UNKNOWN: 5
}
export type DomainStatus = (typeof DomainStatuses)[keyof typeof DomainStatuses]

export interface DomainResult {
    domain_name: string;
    status: DomainStatus;
    suffix: string;
    /** Reason for invalid domain status. Only present if status is invalid. */
    reason?: string;
}

export const Actions = {
  /** Action to indicate a result after processing an input. */
  input: 'input',
  /** Action to indicate a 'categories' result. */
  CATEGORIES: 'categories',
  /** Action to indicate a polling action. */
  POLL: 'poll',
  /** Action to indicate an error. */
  ERROR: 'error',
  /** Action to indicate a suggestion result. */
  SUGGEST: 'suggest',
  /** Action to indicate that all suggestions have been generated. */
  DONE: 'done'
} as const
export type Action = (typeof Actions)[keyof typeof Actions]

export type DomainPremiumResult = DomainResult & {
    type: 'premium';
    price: number;
    currency: string;
}

export type SuggestionResult = {
    source: string;
    domain_name: string;
    suffix: string;
    status: number;
}

export type CategoriesResult = [number, string]

export type Command = {
    api_key: string;
    action: Action;
    data: CommandData | SuggestionCommandData | string
}

export type CommandData = {
    tld_set_token: string;
    input: string;
    categories: number[];
    hints?: Hints
}

export type SuggestionCommandData = {
 input: string,
 hints?: Hints
}

export type Hints = {
    domainsbot?: DomainsBotOptions | false,
    sidn?: SidnOptions | false,
    rns?: RnsOptions | false,
    'prefixes-suffixes'?: PrefixesSuffixesOptions | false,
    namesuggestion?: NameSuggestionOptions | false
}

export type AdacErrorResponse = {
    action: (typeof Actions)['ERROR'],
    data: string
}
