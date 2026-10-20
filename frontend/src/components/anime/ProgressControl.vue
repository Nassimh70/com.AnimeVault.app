<script setup>
import { computed } from 'vue';
import { Loader2, Minus, Plus, Sparkles } from 'lucide-vue-next';
import ProgressBar from '@/components/ui/ProgressBar.vue';
import { formatEpisodes, progressPercent } from '@/utils/format';

const props = defineProps({
  anime: { type: Object, required: true },
  busy: { type: Boolean, default: false },
});
const emit = defineEmits(['progress']);

const percent = computed(() => Math.round(progressPercent(props.anime.episodesWatched, props.anime.episodesTotal)));
const canIncrement = computed(
  () => props.anime.episodesTotal <= 0 || props.anime.episodesWatched < props.anime.episodesTotal
);
const canDecrement = computed(() => props.anime.episodesWatched > 0);
</script>

<template>
  <section class="surface-panel p-5 sm:p-6" aria-labelledby="progress-heading">
    <div class="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        <p id="progress-heading" class="eyebrow">Ta progression</p>
        <p class="mt-1 font-display text-2xl font-semibold tabular-nums text-ink">
          {{ formatEpisodes(anime.episodesWatched, anime.episodesTotal) }}
          <span class="text-sm font-normal text-inkSoft">épisodes</span>
        </p>
      </div>
      <span class="text-sm font-semibold tabular-nums text-brass">{{ percent }} %</span>
    </div>

    <ProgressBar
      :watched="anime.episodesWatched"
      :total="anime.episodesTotal"
      :label="`Progression de ${anime.title}`"
    />

    <div class="mt-5 flex flex-wrap items-center gap-2.5">
      <button
        type="button"
        class="btn-base btn-secondary"
        :disabled="busy || !canDecrement"
        aria-label="Retirer un épisode vu"
        @click="emit('progress', 'decrement')"
      >
        <Minus :size="16" />
        <span class="hidden sm:inline">Retirer</span>
      </button>
      <button
        type="button"
        class="btn-base btn-primary"
        :disabled="busy || !canIncrement"
        aria-label="Ajouter un épisode vu"
        @click="emit('progress', 'increment')"
      >
        <Loader2 v-if="busy" :size="16" class="animate-spin" />
        <Plus v-else :size="16" />
        Épisode vu
      </button>
      <p class="ml-auto flex items-center gap-1.5 text-[11px] text-inkFaint">
        <Sparkles :size="12" aria-hidden="true" />
        Le statut s’adapte automatiquement
      </p>
    </div>
  </section>
</template>
