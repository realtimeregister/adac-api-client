import ADAC from '@/client.ts'

export default ADAC

export type {
  Action,
  AdacUserConfig,
  AdacErrorResponse,
  DomainResult,
  DomainPremiumResult,
  SuggestionResult,
  CategoriesResult,
  Command,
  CommandData,
  Hints
} from '@/resources/types.ts'
export type {
  DomainsBotLanguage,
  DomainsBotOptions,
  SidnOptions,
  RnsOptions,
  PrefixesSuffixesOptions,
  NameSuggestionLanguage,
  NameSuggestionOptions
} from '@/resources/hints.types.ts'
