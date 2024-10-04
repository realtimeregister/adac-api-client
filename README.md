# ADAC API client
JavaScript API client for our Advanced Domain Availability Checker (ADAC). 

### Features
- Easy integration with front-end frameworks
- Complete control over the handling of every result, suggestion and category
- Easily add your own pricing

### Prerequisites
- [Realtime Register](https://realtimeregister.com) account
- Access to the ADAC management portal

### Basic usage
A basic Vue 3 example could look something like this:
```vue
<template>
  <div class="container">
    <input v-model="domainInput" id="adac-js-domain-input" @input.prevent="onChangeDomainInput"/>
    <div style="display:flex;gap:1rem;justify-content:center;">
      <span v-for="category in categories">
        <input type="checkbox" :id="'form_' + category[1]" :value="category[0]" v-model="selectedCategories" @change="onChangeDomainInput"/>
        <label :for="'form_'+category[1]">{{category[1]}}</label>
      </span>
    </div>

    <div class="results" style="display: grid; grid-template-columns: 1fr 1fr">
      <div class="domain-results">
        <div v-for="result in results">
          {{result.domain_name}}
        </div>
      </div>
      <div class="domain-suggestions">
        <div v-for="suggestion in suggestions">
          {{suggestion.domain_name}}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import ADAC from '@realtimeregister/adac-api-client'
  import { debounce } from 'es-toolkit' // or write your own simple debounce function.
  import { ref } from 'vue'

  const domainInput = ref('')
  const selectedCategories = ref([])
  const results = ref([])
  const suggestions = ref([])
  const categories = ref([])
  
  const adac = ADAC.initialize('YOUR_API_KEY', {
        PRIORITY_LIST_TOKEN: 'YOUR_TLD_SET_TOKEN'
      }
  )
  
  adac.onCategories = (categoryResult) => categories.value = categoryResult
  adac.onDomainResult = (domainResult) => results.value.push(domainResult)
  adac.onSuggestion = (suggestionResult) => suggestions.value.push(suggestionResult)

  const onChangeDomainInput = debounce(() => {
    results.value = []
    suggestions.value = []
    adac.processInput(domainInput.value, selectedCategories.value)
  }, 300)
</script>
```

## Development

### Building
```bash
yarn build # build for production
yarn dev # build for dev, with watch mode enabled
```

## License
This project is licensed under the MIT license