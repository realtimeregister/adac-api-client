<template>
  <div class="flex flex-col">
    <h2 class="text-xl font-bold">
      {{ props.title }}
    </h2>
    <ul>
      <li v-for="result in results">{{ result.domain_name }} {{ result.status }}</li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import type {DomainResult, SuggestionResult} from '@/index.ts'

const props = defineProps<{
  title: string
  results: DomainResult[] | DomainPremiumResult[] | SuggestionResult[]
}>()
</script>