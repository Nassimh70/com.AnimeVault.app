<script setup>
defineProps({ rounded: { type: String, default: 'rounded-2xl' } });
</script>

<template>
  <div class="skeleton" :class="rounded" aria-hidden="true" />
</template>
