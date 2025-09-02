<template>
  <main>
    <input v-model="value" type="text">
    <button @click="() => adac.getSuggestions(value)">Get Suggestions</button>
    <div v-if="suggestions.length">
      <h1>Suggestions</h1>
      <ul>
        <li v-for="suggestion in suggestions">{{ suggestion }}</li>
      </ul>
    </div>
  </main>
</template>

<script setup>
import { ref } from 'vue'
import ADAC from '@/index.ts'

const value = ref('')
const suggestions = ref([])

const adac = ADAC.initialize(import.meta.env.VITE_ADAC_API_KEY, {
  apiHost: import.meta.env.VITE_ADAC_API_HOST,
  tldSetToken: import.meta.env.VITE_ADAC_TLD_SET_TOKEN,
  debug: true,
  disableSsl: true
})

adac.onSuggestion = (result) => {
  suggestions.value.push(result.domain_name)
}

</script>
