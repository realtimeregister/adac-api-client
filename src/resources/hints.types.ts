enum DomainsBotLanguagesEnum {
    en = 'English',
    nl = 'Dutch',
    de = 'German',
    es = 'Spanish',
    it = 'Italian',
    fr = 'French'
}

export interface DomainsBotOptions {
    adult?: boolean;
    no_idn?: boolean;
    include_geolocation?: boolean;
    max_results?: number;
    tld_no?: string;
    tld_ok?: string;
    tld_only?: string;
    languages?: DomainsBotLanguagesEnum[],
    func?: 1 | 2 | 3 | 4 // literals, because enum can't have numeric values.
}

export interface SidnOptions {
    limit: number;
}

export interface RnsOptions {
    allowAdult?: boolean;
    allowOffensive?: boolean;
    allowPremium?: boolean;
    clientIP?: boolean;
    useDomainTld?: boolean;
    useaiSLD?: boolean;
    useaiTLD?: boolean;
    maxCount?: number;
    onlyTLDs?: string;
    forceTLDs?: string;
    addTLDs?: string;
    removeTLDs?: string;
}

export interface PrefixesSuffixesOptions {
    prefixes?: string[];
    suffixes?: string[]
}

enum NameSuggestionTLDsEnum {
    com = 'com',
    net = 'net',
    cc = 'cc'
}

enum NameSuggestionLanguageEnum {
    eng = 'English',
    spa = 'Spanish',
    ita = 'Italian',
    jpn = 'Japanese',
    tur = 'Turkish',
    chi = 'Chinese',
    ger = 'German',
    por = 'Portuguese',
    fre = 'French',
    kor = 'Korean',
    vie = 'Vietnamese',
    dut = 'Dutch'
}

export interface NameSuggestionOptions {
    tlds?: NameSuggestionTLDsEnum[],
    use_dashes?: boolean,
    use_numbers?: boolean,
    use_idns?: boolean,
    lang?: NameSuggestionLanguageEnum,
    include_geolocation?: boolean,
    max_results?: number,
    sensitive_content_filter?: boolean,
}