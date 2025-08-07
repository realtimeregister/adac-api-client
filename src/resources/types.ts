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
}

export const Actions = {
  input: 'input',
  CATEGORIES: 'categories',
  POLL: 'poll',
  ERROR: 'error',
} as const
export type Action = (typeof Actions)[keyof typeof Actions]

export interface DomainPremiumResult extends DomainResult {
    type: 'premium';
    price: number;
    currency: string;
}

export interface SuggestionResult {
    source: string;
    domain_name: string;
    suffix: string;
    status: number;
}

export type CategoriesResult = [number, string]

export interface Command {
    api_key: string;
    action: Action;
    data: CommandData | string
}

export interface CommandData {
    tld_set_token: string;
    input: string;
    categories: number[];
    hints?: Hints
}

export interface Hints {
    domainsbot?: DomainsBotOptions | false,
    sidn?: SidnOptions | false,
    rns?: RnsOptions | false,
    'prefixes-suffixes'?: PrefixesSuffixesOptions | false,
    namesuggestion?: NameSuggestionOptions | false
}

export interface AdacErrorResponse {
    action: (typeof Actions)['ERROR'],
    data: string
}
