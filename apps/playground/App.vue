<template>
  <main class="w-full h-screen flex flex-col items-center justify-center gap-5">
    <div class="flex flex-col items-center justify-center gap-2" style="margin-top: -10rem;">
      <h1 class="text-2xl font-bold">ADAC Playground</h1>
      <input v-model="value" type="text" class="border border-gray-300 rounded-md px-4 py-2 w-full max-w-md">
      <div class="flex gap-3">
        <template v-for="(categoryName, categoryId) in categories" >
          <div>
            <input type="checkbox" v-model="activeCategories" :value="categoryId" :name="categoryName" :id="categoryId + '_checkbox'">
            <label class="ml-1" :for="categoryId + '_checkbox'">{{ categoryName }}</label>
          </div>
        </template>
      </div>
      <div class="flex gap-3 mt-2">
        <PButton @click="processInput">processInput() <small class="text-sm text-gray-400">(default)</small></PButton>
        <PButton @click="() => adac.getSuggestions(value)">getSuggestions()</PButton>
      </div>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mx-auto w-full max-w-4xl">
      <PResults title="Results" :results="Object.values(domains)"/>
      <PResults title="Suggestions" :results="Object.values(suggestions)"/>
    </div>
  </main>
</template>

<script setup lang="ts">
import { type Ref, ref, watch } from 'vue'
import ADAC, {
  type SuggestionResult,
  type DomainResult,
  type DomainPremiumResult,
  type CategoriesResult
} from '@/index.ts'
import PButton from './components/PButton.vue'
import PResults from './components/PResults.vue'

const value: Ref<string> = ref('')
const activeCategories: Ref<number[]> = ref([])

const categories: Ref<Record<number, string>> = ref({})
const suggestions: Ref<Record<SuggestionResult['domain_name'], SuggestionResult>> = ref({})
const domains: Ref<Record<DomainResult['domain_name'], DomainResult | DomainPremiumResult>> = ref({})

const adac: ADAC = ADAC.initialize(import.meta.env.VITE_ADAC_API_KEY, {
  apiHost: import.meta.env.VITE_ADAC_API_HOST,
  tldSetToken: import.meta.env.VITE_ADAC_TLD_SET_TOKEN,
  debug: true,
  disableSsl: true
})

const processInput = () => adac.processInput(value.value, activeCategories.value.map(n => parseInt(n)))

adac.onCategories = (result: CategoriesResult[]) => {
  categories.value = result.reduce((acc, [id, name]) => {
    acc[id] = name
    return acc
  }, {})
}

adac.onDomainResult = (result: DomainResult | DomainPremiumResult) => {
  const existingDomain = domains.value[result.domain_name]
  if (existingDomain) {
    existingDomain.status = result.status
  } else {
    domains.value[result.domain_name] = result
  }
}

adac.onSuggestion = (result: SuggestionResult) => {
  const existingSuggestion = suggestions.value[result.domain_name]
  if (existingSuggestion) {
    existingSuggestion.status = result.status
  } else {
    suggestions.value[result.domain_name] = result
  }
}

adac.onDone = () => {
  console.log('ADAC: Done generating suggestions')
}

const purgeOnChange = () => {
  domains.value = {}
  suggestions.value = {}
}

watch(value, purgeOnChange)
watch(activeCategories, purgeOnChange)
</script>
