<script setup>
import { computed } from 'vue';

const props = defineProps({
  color: { type: String, default: 'rgb(var(--color-brass))' },
  dot: { type: Boolean, default: false },
  uppercase: { type: Boolean, default: false },
});

const style = computed(() => ({ '--badge-color': props.color }));
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-wide"
    :class="props.uppercase && 'uppercase tracking-[0.12em]'"
    :style="style"
  >
    <span v-if="props.dot" class="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--badge-color)]" />
    <slot />
  </span>
</template>

<style scoped>
span {
  color: var(--badge-color);
  background: color-mix(in srgb, var(--badge-color) 13%, transparent);
  border-color: color-mix(in srgb, var(--badge-color) 28%, transparent);
  box-shadow: inset 0 1px 0 color-mix(in srgb, var(--badge-color) 14%, transparent);
}
</style>
