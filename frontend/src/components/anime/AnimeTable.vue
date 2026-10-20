<script setup>
import { Heart, Pencil, Star, Trash2 } from 'lucide-vue-next';
import { RouterLink } from 'vue-router';
import { PRIORITY_COLORS, PRIORITY_LABELS } from '@/constants/anime';
import AnimePoster from './AnimePoster.vue';
import BaseBadge from '@/components/ui/BaseBadge.vue';
import ProgressBar from '@/components/ui/ProgressBar.vue';
import StatusBadge from '@/components/ui/StatusBadge.vue';
import { formatDate, formatEpisodes } from '@/utils/format';

defineProps({
  animes: { type: Array, required: true },
  busyId: { type: String, default: null },
});
const emit = defineEmits(['favorite', 'delete']);
</script>

<template>
  <div class="table-shell overflow-x-auto">
    <table class="data-table">
      <caption class="sr-only">Liste des animes de la bibliothèque</caption>
      <thead>
        <tr>
          <th scope="col">Anime</th>
          <th scope="col">Statut</th>
          <th scope="col">Progression</th>
          <th scope="col">Priorité</th>
          <th scope="col">Note</th>
          <th scope="col">Sortie</th>
          <th scope="col" class="text-right">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="anime in animes" :key="anime.id">
          <td>
            <RouterLink :to="`/anime/${anime.id}`" class="flex items-center gap-3">
              <div class="h-14 w-10 shrink-0 overflow-hidden rounded-xl border border-line/10">
                <AnimePoster :image="anime.image" :title="anime.title" />
              </div>
              <span class="min-w-0">
                <span class="block max-w-[260px] truncate font-medium text-ink">
                  {{ anime.title }}
                </span>
                <span class="mt-0.5 block max-w-[260px] truncate text-[11px] text-inkFaint">
                  {{ anime.studios[0] || anime.author || '—' }}
                </span>
              </span>
            </RouterLink>
          </td>
          <td><StatusBadge :status="anime.status" /></td>
          <td>
            <div class="w-36">
              <div class="mb-1.5 flex justify-between text-[11px] tabular-nums text-inkSoft">
                <span>{{ formatEpisodes(anime.episodesWatched, anime.episodesTotal) }}</span>
                <span>{{ anime.episodesTotal || '?' }} ép.</span>
              </div>
              <ProgressBar
                :watched="anime.episodesWatched"
                :total="anime.episodesTotal"
                size="sm"
                :label="`Progression de ${anime.title}`"
              />
            </div>
          </td>
          <td>
            <BaseBadge :color="PRIORITY_COLORS[anime.priority]">
              {{ PRIORITY_LABELS[anime.priority] }}
            </BaseBadge>
          </td>
          <td>
            <span v-if="anime.rating !== null" class="flex items-center gap-1 text-amber">
              <Star :size="12" fill="currentColor" aria-hidden="true" />
              <span class="font-semibold">{{ anime.rating }}</span>
            </span>
            <span v-else class="text-inkFaint">—</span>
          </td>
          <td class="whitespace-nowrap text-xs text-inkSoft">{{ formatDate(anime.releaseDate) }}</td>
          <td>
            <div class="flex items-center justify-end gap-1">
              <button
                type="button"
                class="flex h-9 w-9 items-center justify-center rounded-xl transition"
                :class="
                  anime.isFavorite
                    ? 'bg-rose/12 text-rose'
                    : 'text-inkFaint hover:bg-surfaceMuted/70 hover:text-rose'
                "
                :disabled="busyId === anime.id"
                :aria-label="
                  anime.isFavorite
                    ? `Retirer ${anime.title} des favoris`
                    : `Ajouter ${anime.title} aux favoris`
                "
                :aria-pressed="anime.isFavorite"
                @click="emit('favorite', anime)"
              >
                <Heart :size="15" :fill="anime.isFavorite ? 'currentColor' : 'none'" />
              </button>
              <RouterLink
                :to="`/anime/${anime.id}/edit`"
                class="flex h-9 w-9 items-center justify-center rounded-xl text-inkFaint transition hover:bg-surfaceMuted/70 hover:text-brass"
                :aria-label="`Modifier ${anime.title}`"
              >
                <Pencil :size="15" />
              </RouterLink>
              <button
                type="button"
                class="flex h-9 w-9 items-center justify-center rounded-xl text-inkFaint transition hover:bg-surfaceMuted/70 hover:text-rose"
                :aria-label="`Supprimer ${anime.title}`"
                @click="emit('delete', anime)"
              >
                <Trash2 :size="15" />
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
