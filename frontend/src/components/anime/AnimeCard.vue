<script setup>
import { computed } from 'vue';
import { Heart, Minus, Pencil, Plus, Star, Trash2 } from 'lucide-vue-next';
import { RouterLink } from 'vue-router';
import { PRIORITY_COLORS, PRIORITY_LABELS } from '@/constants/anime';
import BaseBadge from '@/components/ui/BaseBadge.vue';
import ProgressBar from '@/components/ui/ProgressBar.vue';
import StatusBadge from '@/components/ui/StatusBadge.vue';
import AnimePoster from './AnimePoster.vue';
import { formatEpisodes } from '@/utils/format';

const props = defineProps({
  anime: { type: Object, required: true },
  busy: { type: Boolean, default: false },
});

const emit = defineEmits(['favorite', 'delete', 'progress']);

const canIncrement = computed(
  () => props.anime.episodesTotal === 0 || props.anime.episodesWatched < props.anime.episodesTotal
);
const year = computed(() => props.anime.releaseDate?.slice(0, 4) || '');
</script>

<template>
  <article
    class="group surface-panel relative flex flex-col overflow-hidden rounded-3xl transition duration-300 ease-vault hover:-translate-y-1 hover:border-brass/25 hover:shadow-lift"
  >
    <div class="relative aspect-[2/3] overflow-hidden">
      <RouterLink
        :to="`/anime/${anime.id}`"
        class="block h-full w-full"
        :aria-label="`Voir la fiche de ${anime.title}`"
      >
        <div class="h-full w-full transition duration-700 ease-vault group-hover:scale-[1.04]">
          <AnimePoster :image="anime.image" :title="anime.title" />
        </div>
        <span
          class="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#04060c]/85 via-transparent to-[#04060c]/25 opacity-70"
          aria-hidden="true"
        />
      </RouterLink>

      <div class="absolute left-2.5 top-2.5 flex max-w-[75%] flex-wrap gap-1.5">
        <StatusBadge :status="anime.status" dot />
      </div>

      <button
        type="button"
        class="absolute right-2.5 top-2.5 flex h-9 w-9 items-center justify-center rounded-full border backdrop-blur-md transition"
        :class="
          anime.isFavorite
            ? 'border-rose/40 bg-rose/25 text-rose'
            : 'border-white/15 bg-black/30 text-white/80 hover:border-rose/40 hover:text-rose'
        "
        :aria-label="anime.isFavorite ? `Retirer ${anime.title} des favoris` : `Ajouter ${anime.title} aux favoris`"
        :aria-pressed="anime.isFavorite"
        @click="emit('favorite', anime)"
      >
        <Heart :size="15" :fill="anime.isFavorite ? 'currentColor' : 'none'" />
      </button>

      <div
        v-if="anime.rating !== null"
        class="absolute bottom-2.5 left-2.5 flex items-center gap-1 rounded-full border border-white/10 bg-black/45 px-2 py-1 text-[11px] font-semibold text-amber backdrop-blur-md"
      >
        <Star :size="11" fill="currentColor" aria-hidden="true" />
        {{ anime.rating.toFixed(1).replace('.0', '') }}
      </div>

      <div class="absolute bottom-2.5 right-2.5 flex gap-1.5">
        <button
          type="button"
          class="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white/80 backdrop-blur-md transition hover:border-brass/40 hover:text-brass"
          :aria-label="`Supprimer ${anime.title}`"
          @click="emit('delete', anime)"
        >
          <Trash2 :size="13" />
        </button>
        <RouterLink
          :to="`/anime/${anime.id}/edit`"
          class="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white/80 backdrop-blur-md transition hover:border-brass/40 hover:text-brass"
          :aria-label="`Modifier ${anime.title}`"
        >
          <Pencil :size="13" />
        </RouterLink>
      </div>
    </div>

    <div class="flex flex-1 flex-col p-3.5">
      <div class="flex items-start gap-2">
        <RouterLink
          :to="`/anime/${anime.id}`"
          class="line-clamp-2 min-w-0 flex-1 font-display text-[15px] font-semibold leading-tight text-ink transition hover:text-brass"
        >
          {{ anime.title }}
        </RouterLink>
        <button
          type="button"
          class="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-line/12 text-inkFaint transition hover:border-brass/35 hover:text-brass disabled:opacity-30"
          :disabled="busy || !canIncrement"
          :aria-label="`Ajouter un épisode vu à ${anime.title}`"
          @click="emit('progress', anime, 'increment')"
        >
          <Plus :size="13" />
        </button>
      </div>

      <p class="mt-1 truncate text-[11px] text-inkFaint">
        <span v-if="year">{{ year }}</span>
        <span v-if="year && anime.studios[0]"> · </span>
        <span v-if="anime.studios[0]">{{ anime.studios[0] }}</span>
        <span v-if="!year && !anime.studios[0]">Anime</span>
      </p>

      <div class="mt-auto pt-3">
        <div class="mb-1.5 flex items-center justify-between gap-2">
          <span class="text-[11px] tabular-nums text-inkSoft">
            {{ formatEpisodes(anime.episodesWatched, anime.episodesTotal) }} ép.
          </span>
          <BaseBadge
            :color="PRIORITY_COLORS[anime.priority]"
            class="!px-2 !py-0.5 !text-[9px]"
          >
            {{ PRIORITY_LABELS[anime.priority] }}
          </BaseBadge>
        </div>
        <ProgressBar
          :watched="anime.episodesWatched"
          :total="anime.episodesTotal"
          size="sm"
          :label="`Progression de ${anime.title}`"
        />
      </div>
    </div>

    <button
      v-if="anime.episodesWatched > 0"
      type="button"
      class="absolute inset-x-0 bottom-0 hidden h-0 items-center justify-center bg-surfaceMuted/90 text-xs font-medium text-inkSoft backdrop-blur transition-all group-focus-within:h-8 group-hover:h-8 sm:flex"
      :aria-label="`Retirer un épisode vu à ${anime.title}`"
      @click="emit('progress', anime, 'decrement')"
    >
      <Minus :size="12" class="mr-1" /> Retirer un épisode
    </button>
  </article>
</template>
