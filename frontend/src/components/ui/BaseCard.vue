<script setup>
import { computed } from 'vue';
import { cn } from '@/utils/format';

const props = defineProps({
  padded: { type: Boolean, default: true },
  hover: { type: Boolean, default: false },
  flat: { type: Boolean, default: false },
  as: { type: String, default: 'div' },
});

const classes = computed(() =>
  cn(
    props.flat ? 'surface-flat' : 'surface-panel',
    props.padded && 'p-5 sm:p-6',
    props.hover &&
      'transition duration-300 ease-vault hover:-translate-y-1 hover:border-brass/25 hover:shadow-lift'
  )
);
</script>

<template>
  <component :is="props.as" :class="classes">
    <slot />
  </component>
</template>
