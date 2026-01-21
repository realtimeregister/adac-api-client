<template>
  <main>
    <h1 style="text-align: center">ADAC example with custom pricing</h1>
    <div class="input-wrapper">
      <input
          v-model="query"
          type="text"
          placeholder="Search for a domain..."
          @keydown.enter="submit"
      />
      <button @click="submit">Search</button>
    </div>
    <p style="text-align: center; font-size: 0.9rem; font-weight: 500;">Please note that these prices are mocked.</p>
    <section class="results">
      <div
          class="result"
         v-for="result in results"
         :key="result.domain_name"
      >
        <h3>{{ result.domain_name }}</h3>
        <span class="result-price">
          <template v-if="result.price">&dollar; {{ result.price.toFixed(2) }}</template>
          <template v-else>N/A</template>
        </span>
      </div>
    </section>
  </main>
</template>


<script setup lang="ts">
// We're importing a locally saved priceList here. You should get your own priceList from an API endpoint or a static list
// you've created yourself.
import priceList from './static/priceList.json'
// Normally you would import from @realtimeregister/adac-api-client here.
import ADAC, {
  type SuggestionResult,
  type DomainResult,
  type DomainPremiumResult
} from '@/index.ts'
import { ref, type Ref, computed, type ComputedRef } from 'vue'

type Result = DomainResult & DomainPremiumResult & SuggestionResult & {
  price?: number
}

const query: Ref<string> = ref('')
const domains: Ref<Record<string, Result>> = ref({})

const results: ComputedRef<Result[]> = computed(() => Object.values(domains.value))

const adac: ADAC = ADAC.initialize(import.meta.env.VITE_ADAC_API_KEY, {
  tldSetToken: import.meta.env.VITE_ADAC_TLD_SET_TOKEN, // Should contain your TLD set token.
  // ote: true // Uncomment to use the OT&E environment, NOTE that you should use OT&E credentials.
})

function onResult (result: Result) {
  /* Immediately get the price when receiving a result. This means that before a result is added to the UI it will have
   * to wait for a price to be added first. Alternatively, you could use a separate API call to fetch the price and 
   * update the result later. */
  const price = priceList[(result.suffix as keyof typeof priceList)]

  domains.value[result.domain_name] = {
    ...result,
    price: price ? price / 100 : 0
  }
}

adac.onDomainResult = onResult
adac.onSuggestion = onResult

function submit (): void {
  domains.value = {}
  adac.processInput(query.value)
}
</script>

<style>
* {
  font-family: -apple-system, 'Segoe UI', sans-serif;
}

h3 {
  margin: 0;
}

.input-wrapper {
  display: flex;
  gap: 8px;
  max-width: 500px;
  margin: 2rem auto .5rem;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.input-wrapper input {
  flex: 1;
  border: none;
  padding: 8px 12px;
  font-size: 16px;
  outline: none;
}

.input-wrapper button {
  background-color: #F35B00;
  color: white;
  border: none;
  padding: 10px 18px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.2s;
}

.input-wrapper button:hover {
  background-color: #c64901;
}

.results {
  max-width: 500px;
  flex-direction: column;
  display: flex;
  justify-content: center;
  margin: 2rem auto;
}

.result {
  border-bottom: 1px solid #ddd;
  padding: 2rem 0;
  display: flex;
  justify-content: space-between;
}

.result-price {
  font-size: 1.2rem;
}
</style>