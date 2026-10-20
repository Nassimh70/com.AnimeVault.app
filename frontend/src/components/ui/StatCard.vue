<script setup>
import { RouterLink } from 'vue-router';

defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], required: true },
  hint: { type: String, default: undefined },
  to: { type: [String, Object], default: undefined },
  tone: { type: String, default: 'brass' },
});

const tones = {
  brass: 'border-brass/22 bg-brass/10 text-brass',
  moon: 'border-moon/22 bg-moon/10 text-moon',
  jade: 'border-jade/22 bg-jade/10 text-jade',
  rose: 'border-rose/22 bg-rose/10 text-rose',
};
</script>

<template>
  <component
    :is="to ? RouterLink : 'div'"
    :to="to"
    class="surface-panel group flex items-start gap-4 p-4 transition duration-300 sm:p-5"
    :class="to && 'hover:-translate-y-0.5 hover:border-brass/25'"
  >
    <span
      class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border"
      :class="tones[tone]"
      aria-hidden="true"
    >
      <slot name="icon" />
    </span>
    <span class="min-w-0">
      <span class="block font-display text-2xl font-semibold leading-none tabular-nums text-ink">
        {{ value }}
      </span>
      <span class="mt-1.5 block truncate text-xs font-medium text-inkSoft">{{ label }}</span>
      <span v-if="hint" class="mt-0.5 block text-[10px] text-inkFaint">{{ hint }}</span>
    </span>
  </component>
</template>
