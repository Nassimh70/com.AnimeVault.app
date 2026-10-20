<script setup>
defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: undefined },
  compact: { type: Boolean, default: false },
});
</script>

<template>
  <div
    class="flex flex-col items-center justify-center px-6 text-center"
    :class="compact ? 'py-10' : 'py-20'"
  >
    <div
      class="mb-5 flex h-16 w-16 items-center justify-center rounded-[1.4rem] border border-brass/25 bg-brass/10 text-brass shadow-glow"
      aria-hidden="true"
    >
      <slot name="icon" />
    </div>
    <h2 class="font-display text-xl font-semibold text-ink sm:text-2xl">{{ title }}</h2>
    <p v-if="subtitle" class="mt-2 max-w-md text-sm leading-relaxed text-inkSoft">
      {{ subtitle }}
    </p>
    <div v-if="$slots.action" class="mt-6">
      <slot name="action" />
    </div>
  </div>
</template>
