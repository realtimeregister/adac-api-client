import { ActionEnum, DomainStatusEnum } from './enums'
import { DomainsBotOptions, NameSuggestionOptions, PrefixesSuffixesOptions, RnsOptions, SidnOptions } from './hints.types'

export interface AdacUserConfig {
    tldSetToken: string;
    priorityListToken?: string;
    debug?: boolean;
    ote?: boolean;
    disableSsl?: boolean;
    apiHost?: string;
    hints?: Hints,
}

export interface DomainResult {
    domain_name: string;
    status: DomainStatusEnum;
    type: string;
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
    action: ActionEnum;
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
    action: ActionEnum.ERROR,
    data: string
}
