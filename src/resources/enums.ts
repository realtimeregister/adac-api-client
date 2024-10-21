export enum DomainStatusEnum {
    DOMAIN_STATUS_WAITING = 0,
    DOMAIN_STATUS_AVAILABLE = 1,
    DOMAIN_STATUS_TAKEN = 2,
    DOMAIN_STATUS_INVALID = 3,
    DOMAIN_STATUS_ERROR = 4,
    DOMAIN_STATUS_UNKNOWN = 5
}

export enum ActionEnum {
    INPUT = 'input',
    CATEGORIES = 'categories',
    POLL = 'poll',
    ERROR = 'error',
}