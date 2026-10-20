<script setup>
import { computed, onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import {
  CheckCircle2,
  Clock3,
  Flame,
  Heart,
  LibraryBig,
  PlayCircle,
  Star,
  Timer,
} from 'lucide-vue-next';
import { api } from '@/services/api';
import { STATUS_LABELS } from '@/constants/anime';
import { formatHours } from '@/utils/format';
import { chartPalette } from '@/utils/charts';
import { useThemeStore } from '@/stores/theme';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseCard from '@/components/ui/BaseCard.vue';
import SkeletonBlock from '@/components/ui/SkeletonBlock.vue';
import StatCard from '@/components/ui/StatCard.vue';
import AnimePoster from '@/components/anime/AnimePoster.vue';
import StatusDonut from '@/components/charts/StatusDonut.vue';
import HorizontalBarChart from '@/components/charts/HorizontalBarChart.vue';
import RatingBarChart from '@/components/charts/RatingBarChart.vue';
import ActivityLineChart from '@/components/charts/ActivityLineChart.vue';

const stats = ref(null);
const topRated = ref([]);
const loading = ref(true);
const error = ref(null);
const theme = useThemeStore();
const palette = computed(() => chartPalette(theme.resolved));

const completion = computed(() => {
  if (!stats.value || stats.value.total === 0) return 0;
  return Math.round((stats.value.termine / stats.value.total) * 100);
});

const averageRating = computed(() => {
  if (!stats.value) return 0;
  const entries = stats.value.ratingDistribution;
  const total = entries.reduce((sum, item) => sum + item.count, 0);
  if (total === 0) return 0;
  const weighted = entries.reduce((sum, item) => sum + item.rating * item.count, 0);
  return Math.round((weighted / total) * 10) / 10;
});

const statusItems = computed(() => {
  if (!stats.value) return [];
  const colors = palette.value.status;
  return [
    { name: STATUS_LABELS.termine, value: stats.value.termine, color: colors.termine },
    { name: STATUS_LABELS.en_cours, value: stats.value.enCours, color: colors.en_cours },
    { name: STATUS_LABELS.a_voir, value: stats.value.aVoir, color: colors.a_voir },
    { name: STATUS_LABELS.pause, value: stats.value.pause, color: colors.pause },
    { name: STATUS_LABELS.abandonne, value: stats.value.abandonne, color: colors.abandonne },
  ].filter((item) => item.value > 0);
});

const hasRatings = computed(() => stats.value?.ratingDistribution.some((item) => item.count > 0));

async function load() {
  loading.value = true;
  error.value = null;
  try {
    const [statsData, topData] = await Promise.all([
      api.getStats(),
      api.getAnimes({ limit: 6, sortBy: 'rating', order: 'desc' }),
    ]);
    stats.value = statsData;
    topRated.value = topData.data.filter((anime) => anime.rating !== null).slice(0, 5);
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Les statistiques sont indisponibles.';
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>

<template>
  <div class="page-wrap space-y-6">
    <header class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="eyebrow">Analyse</p>
        <h1 class="display-title mt-2">Statistiques</h1>
        <p class="mt-2 text-sm text-inkSoft">
          Le portrait de ta bibliothèque, mois après mois.
        </p>
      </div>
      <div class="rounded-full border border-line/12 bg-surface/50 px-4 py-2 text-xs text-inkSoft">
        <span class="font-semibold text-ink">{{ completion }} %</span> de la collection terminée
      </div>
    </header>

    <div
      v-if="error"
      class="surface-panel flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center"
    >
      <div class="flex-1">
        <p class="font-semibold text-ink">Impossible de calculer les statistiques.</p>
        <p class="muted-copy mt-1">{{ error }}</p>
      </div>
      <BaseButton variant="secondary" @click="load">Réessayer</BaseButton>
    </div>

    <template v-else-if="loading">
      <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SkeletonBlock v-for="index in 8" :key="index" class="h-[104px] rounded-4xl" />
      </div>
      <SkeletonBlock class="h-80 rounded-4xl" />
    </template>

    <template v-else-if="stats">
      <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Animes au total" :value="stats.total" hint="Toutes étagères" tone="brass">
          <template #icon><LibraryBig :size="19" /></template>
        </StatCard>
        <StatCard
          label="Terminés"
          :value="stats.termine"
          :hint="`${completion} % de complétion`"
          tone="jade"
        >
          <template #icon><CheckCircle2 :size="19" /></template>
        </StatCard>
        <StatCard
          label="Épisodes vus"
          :value="stats.totalEpisodesWatched"
          :hint="`${formatHours(stats.totalHoursWatched)} de visionnage`"
          tone="moon"
        >
          <template #icon><PlayCircle :size="19" /></template>
        </StatCard>
        <StatCard
          label="En cours"
          :value="stats.enCours"
          hint="Sessions actives"
          tone="brass"
        >
          <template #icon><Flame :size="19" /></template>
        </StatCard>
        <StatCard
          label="Temps total"
          :value="formatHours(stats.totalHoursWatched)"
          :hint="`${Math.round(stats.totalMinutesWatched / 60)} h cumulées`"
          tone="moon"
        >
          <template #icon><Timer :size="19" /></template>
        </StatCard>
        <StatCard
          label="Temps restant"
          :value="formatHours(stats.remainingHours)"
          :hint="`${stats.remainingEpisodes} épisodes à voir`"
          tone="rose"
        >
          <template #icon><Clock3 :size="19" /></template>
        </StatCard>
        <StatCard
          label="Favoris"
          :value="stats.favoriteCount"
          hint="Titres marqués d’un cœur"
          tone="rose"
        >
          <template #icon><Heart :size="19" /></template>
        </StatCard>
        <StatCard
          label="Note moyenne"
          :value="averageRating || '—'"
          hint="Sur les titres notés"
          tone="jade"
        >
          <template #icon><Star :size="19" /></template>
        </StatCard>
      </div>

      <div class="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
        <BaseCard>
          <p class="eyebrow">Répartition</p>
          <h2 class="section-heading mt-1">Tes états de lecture</h2>
          <div v-if="statusItems.length" class="relative mt-4 h-[240px]">
            <StatusDonut :items="statusItems" />
            <div class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span class="font-display text-3xl font-semibold tabular-nums text-ink">
                {{ stats.total }}
              </span>
              <span class="text-[10px] uppercase tracking-[0.16em] text-inkFaint">animes</span>
            </div>
          </div>
          <div class="mt-4 grid grid-cols-2 gap-2">
            <div
              v-for="item in statusItems"
              :key="item.name"
              class="flex items-center gap-2 text-[11px] text-inkSoft"
            >
              <span class="h-2 w-2 rounded-full" :style="{ backgroundColor: item.color }" />
              {{ item.name }} <span class="ml-auto tabular-nums">{{ item.value }}</span>
            </div>
          </div>
        </BaseCard>

        <BaseCard>
          <div class="flex items-center justify-between gap-4">
            <div>
              <p class="eyebrow">Rythme</p>
              <h2 class="section-heading mt-1">Activité des 12 derniers mois</h2>
            </div>
            <span class="hidden text-[11px] text-inkFaint sm:block">Entrées d’historique</span>
          </div>
          <div class="mt-5">
            <ActivityLineChart :items="stats.monthlyActivity" />
          </div>
        </BaseCard>
      </div>

      <div class="grid gap-6 lg:grid-cols-2">
        <BaseCard>
          <div class="flex items-end justify-between gap-3">
            <div>
              <p class="eyebrow">Affinités</p>
              <h2 class="section-heading mt-1">Genres préférés</h2>
            </div>
            <span class="text-[11px] text-inkFaint">Top {{ Math.min(8, stats.genreDistribution.length) }}</span>
          </div>
          <div v-if="stats.genreDistribution.length" class="mt-5">
            <HorizontalBarChart
              :items="stats.genreDistribution.slice(0, 8)"
              :color="palette.moon"
              label="Animes par genre"
            />
          </div>
          <p v-else class="muted-copy mt-6">Pas encore assez de données.</p>
        </BaseCard>

        <BaseCard>
          <div class="flex items-end justify-between gap-3">
            <div>
              <p class="eyebrow">Maisons</p>
              <h2 class="section-heading mt-1">Studios préférés</h2>
            </div>
            <span class="text-[11px] text-inkFaint">Top {{ Math.min(8, stats.studioDistribution.length) }}</span>
          </div>
          <div v-if="stats.studioDistribution.length" class="mt-5">
            <HorizontalBarChart
              :items="stats.studioDistribution.slice(0, 8)"
              :color="palette.brass"
              label="Animes par studio"
            />
          </div>
          <p v-else class="muted-copy mt-6">Pas encore assez de données.</p>
        </BaseCard>
      </div>

      <div class="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <BaseCard v-if="hasRatings">
          <p class="eyebrow">Évaluation</p>
          <h2 class="section-heading mt-1">Répartition des notes</h2>
          <div class="mt-5">
            <RatingBarChart :items="stats.ratingDistribution" />
          </div>
        </BaseCard>
        <BaseCard v-else>
          <p class="eyebrow">Évaluation</p>
          <h2 class="section-heading mt-1">Répartition des notes</h2>
          <p class="muted-copy mt-4">
            Note tes animes pour faire apparaître ta courbe de goûts.
          </p>
        </BaseCard>

        <BaseCard>
          <div class="flex items-end justify-between gap-3">
            <div>
              <p class="eyebrow">Coups de cœur</p>
              <h2 class="section-heading mt-1">Les mieux notés</h2>
            </div>
            <RouterLink to="/library?sortBy=rating" class="text-xs font-semibold text-brass hover:underline">
              Voir tout
            </RouterLink>
          </div>
          <ol v-if="topRated.length" class="mt-4 space-y-3">
            <li v-for="(anime, index) in topRated" :key="anime.id">
              <RouterLink
                :to="`/anime/${anime.id}`"
                class="group flex items-center gap-3 rounded-2xl p-1.5 transition hover:bg-surfaceMuted/50"
              >
                <span class="w-4 shrink-0 text-center font-display text-sm font-semibold text-inkFaint">
                  {{ index + 1 }}
                </span>
                <span class="h-14 w-10 shrink-0 overflow-hidden rounded-lg border border-line/10">
                  <AnimePoster :image="anime.image" :title="anime.title" />
                </span>
                <span class="min-w-0 flex-1">
                  <span class="block truncate text-sm font-medium text-ink group-hover:text-brass">
                    {{ anime.title }}
                  </span>
                  <span class="mt-0.5 block text-[10px] text-inkFaint">
                    {{ anime.studios[0] || 'Studio inconnu' }}
                  </span>
                </span>
                <span class="flex items-center gap-1 text-xs font-semibold text-amber">
                  <Star :size="11" fill="currentColor" />
                  {{ anime.rating }}
                </span>
              </RouterLink>
            </li>
          </ol>
          <p v-else class="muted-copy mt-4">Aucune note pour le moment.</p>
        </BaseCard>
      </div>
    </template>
  </div>
</template>
