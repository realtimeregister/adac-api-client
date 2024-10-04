import { ActionEnum, DomainStatusEnum } from './enums'

export interface AdacUserConfig {
    TLD_SET_TOKEN: string | null;
    PRIORITY_LIST_TOKEN: string | null;
    debug: boolean;
    ote: boolean;
    disable_ssl: boolean;
    api_host: string | null;
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
}
