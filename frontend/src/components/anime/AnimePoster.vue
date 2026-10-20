<script setup>
import { ref, watch } from 'vue';
import { BookOpen } from 'lucide-vue-next';

const props = defineProps({
  image: { type: String, default: '' },
  title: { type: String, required: true },
  alt: { type: String, default: undefined },
  eager: { type: Boolean, default: false },
});

const failed = ref(false);
watch(
  () => props.image,
  () => {
    failed.value = false;
  }
);
</script>

<template>
  <div class="relative h-full w-full overflow-hidden bg-surfaceMuted">
    <img
      v-if="props.image && !failed"
      :src="props.image"
      :alt="props.alt ?? `Affiche de ${props.title}`"
      :loading="props.eager ? 'eager' : 'lazy'"
      class="h-full w-full object-cover"
      @error="failed = true"
    />
    <div
      v-else
      class="flex h-full w-full flex-col items-center justify-center gap-2 bg-[radial-gradient(circle_at_30%_20%,rgb(var(--color-brass)/0.16),transparent_55%),linear-gradient(160deg,rgb(var(--color-surface-muted)),rgb(var(--color-surface)))] p-4 text-center"
    >
      <BookOpen :size="26" class="text-brass/70" aria-hidden="true" />
      <span class="line-clamp-3 font-display text-sm font-medium text-inkSoft">{{ props.title }}</span>
    </div>
  </div>
</template>
