<script setup lang="ts">
defineProps<{
  title: string
}>()
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold text-gray-900 mb-6">{{ title }}</h1>
    <slot></slot>
  </div>
</template> 