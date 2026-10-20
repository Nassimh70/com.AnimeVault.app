<script setup>
import { computed, onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  Heart,
  LibraryBig,
  PlayCircle,
  Plus,
  Sparkles,
  TrendingUp,
} from 'lucide-vue-next';
import { api } from '@/services/api';
import { STATUS_COLORS, STATUS_LABELS } from '@/constants/anime';
import { useSettingsStore } from '@/stores/settings';
import { formatDate, formatEpisodes, formatHours, progressPercent } from '@/utils/format';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseCard from '@/components/ui/BaseCard.vue';
import ProgressBar from '@/components/ui/ProgressBar.vue';
import SkeletonBlock from '@/components/ui/SkeletonBlock.vue';
import StatCard from '@/components/ui/StatCard.vue';
import AnimePoster from '@/components/anime/AnimePoster.vue';
import HistoryTimeline from '@/components/anime/HistoryTimeline.vue';
import StatusDonut from '@/components/charts/StatusDonut.vue';
import ActivityLineChart from '@/components/charts/ActivityLineChart.vue';

const settings = useSettingsStore();
const stats = ref(null);
const recent = ref([]);
const inProgress = ref([]);
const activity = ref([]);
const loading = ref(true);
const error = ref(null);

const today = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
}).format(new Date());

const statusItems = computed(() => {
  if (!stats.value) return [];
  return [
    { name: STATUS_LABELS.termine, value: stats.value.termine, color: STATUS_COLORS.termine },
    { name: STATUS_LABELS.en_cours, value: stats.value.enCours, color: STATUS_COLORS.en_cours },
    { name: STATUS_LABELS.a_voir, value: stats.value.aVoir, color: STATUS_COLORS.a_voir },
    { name: STATUS_LABELS.pause, value: stats.value.pause, color: STATUS_COLORS.pause },
    { name: STATUS_LABELS.abandonne, value: stats.value.abandonne, color: STATUS_COLORS.abandonne },
  ].filter((item) => item.value > 0);
});

const current = computed(() => inProgress.value[0] ?? null);
const nextUp = computed(() => stats.value?.lastAdded ?? null);
const globalPercent = computed(() => {
  if (!stats.value || stats.value.total === 0) return 0;
  return Math.round((stats.value.termine / stats.value.total) * 100);
});

async function load() {
  loading.value = true;
  error.value = null;
  try {
    const [statsData, recentData, progressData, historyData] = await Promise.all([
      api.getStats(),
      api.getAnimes({ limit: 6, sortBy: 'createdAt', order: 'desc' }),
      api.getAnimes({ status: 'en_cours', limit: 4, sortBy: 'updatedAt', order: 'desc' }),
      api.getHistory(6),
    ]);
    stats.value = statsData;
    recent.value = recentData.data;
    inProgress.value = progressData.data;
    activity.value = historyData;
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Le tableau de bord est indisponible.';
  } finally {
    loading.value = false;
  }
}

onMounted(load);
</script>

<template>
  <div class="page-wrap space-y-6 lg:space-y-8">
    <section class="surface-panel relative overflow-hidden p-6 sm:p-8 lg:p-10">
      <div
        class="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full bg-brass/12 blur-3xl"
        aria-hidden="true"
      />
      <div
        class="pointer-events-none absolute -bottom-36 left-1/3 h-72 w-72 rounded-full bg-moon/8 blur-3xl"
        aria-hidden="true"
      />
      <div class="relative grid gap-8 lg:grid-cols-[1.6fr_0.8fr] lg:items-end">
        <div>
          <p class="eyebrow flex items-center gap-2">
            <Sparkles :size="12" class="text-brass" aria-hidden="true" />
            {{ today }}
          </p>
          <h1 class="mt-3 font-display text-4xl font-semibold leading-[1.02] tracking-[-0.03em] text-ink sm:text-5xl">
            Bon retour,
            <span class="text-gradient-brass">{{ settings.displayName }}</span>
          </h1>
          <p class="mt-4 max-w-xl text-sm leading-relaxed text-inkSoft">
            Ta bibliothèque t’attend. Reprends un visionnage, explore tes favoris ou ajoute une
            nouvelle histoire à ta collection.
          </p>
          <div class="mt-6 flex flex-wrap gap-2.5">
            <BaseButton to="/anime/new">
              <template #icon><Plus :size="16" /></template>
              Ajouter un anime
            </BaseButton>
            <BaseButton to="/library" variant="secondary">
              Explorer la bibliothèque
              <template #icon><BookOpen :size="16" /></template>
            </BaseButton>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="rounded-3xl border border-line/10 bg-surface/45 p-4">
            <p class="text-[10px] font-semibold uppercase tracking-[0.16em] text-inkFaint">
              Temps regardé
            </p>
            <p class="mt-2 font-display text-2xl font-semibold text-ink">
              {{ formatHours(stats?.totalHoursWatched ?? 0) }}
            </p>
          </div>
          <div class="rounded-3xl border border-line/10 bg-surface/45 p-4">
            <p class="text-[10px] font-semibold uppercase tracking-[0.16em] text-inkFaint">
              À découvrir
            </p>
            <p class="mt-2 font-display text-2xl font-semibold text-ink">
              {{ stats?.aVoir ?? 0 }}
            </p>
          </div>
          <div class="col-span-2 rounded-3xl border border-line/10 bg-surface/45 p-4">
            <div class="flex items-center justify-between text-xs">
              <span class="text-inkSoft">Bibliothèque terminée</span>
              <span class="font-semibold tabular-nums text-brass">{{ globalPercent }} %</span>
            </div>
            <div class="mt-2.5">
              <ProgressBar
                :watched="stats?.termine ?? 0"
                :total="stats?.total ?? 0"
                label="Part de la bibliothèque terminée"
              />
            </div>
          </div>
        </div>
      </div>
    </section>

    <div v-if="loading" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <SkeletonBlock v-for="index in 4" :key="index" class="h-[104px] rounded-4xl" />
    </div>
    <div
      v-else-if="error"
      class="surface-panel flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center"
    >
      <div class="flex-1">
        <p class="font-semibold text-ink">Impossible de charger le tableau de bord.</p>
        <p class="muted-copy mt-1">{{ error }}</p>
      </div>
      <BaseButton variant="secondary" @click="load">Réessayer</BaseButton>
    </div>

    <template v-else-if="stats">
      <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Animes dans la collection"
          :value="stats.total"
          hint="Toutes histoires confondues"
          to="/library"
          tone="brass"
        >
          <template #icon><LibraryBig :size="19" /></template>
        </StatCard>
        <StatCard
          label="Terminés"
          :value="stats.termine"
          :hint="`${globalPercent} % de la bibliothèque`"
          to="/library?status=termine"
          tone="jade"
        >
          <template #icon><CheckCircle2 :size="19" /></template>
        </StatCard>
        <StatCard
          label="En cours"
          :value="stats.enCours"
          hint="Visionnages actifs"
          to="/library?status=en_cours"
          tone="moon"
        >
          <template #icon><PlayCircle :size="19" /></template>
        </StatCard>
        <StatCard
          label="À voir"
          :value="stats.aVoir"
          :hint="`${stats.remainingEpisodes} épisodes restants`"
          to="/library?status=a_voir"
          tone="rose"
        >
          <template #icon><Clock3 :size="19" /></template>
        </StatCard>
      </div>

      <div class="grid gap-6 xl:grid-cols-3">
        <div class="space-y-6 xl:col-span-2">
          <BaseCard :padded="false" class="overflow-hidden">
            <div class="flex items-center justify-between gap-4 px-5 pb-3 pt-5 sm:px-6">
              <div>
                <p class="eyebrow">Reprendre le fil</p>
                <h2 class="section-heading mt-1">Là où tu t’es arrêté</h2>
              </div>
              <RouterLink
                to="/library?status=en_cours"
                class="inline-flex items-center gap-1 text-xs font-semibold text-brass hover:underline"
              >
                Tout voir <ArrowRight :size="13" />
              </RouterLink>
            </div>

            <div v-if="current" class="flex flex-col gap-5 p-5 pt-3 sm:flex-row sm:items-center sm:p-6 sm:pt-3">
              <RouterLink
                :to="`/anime/${current.id}`"
                class="poster-frame aspect-[2/3] w-28 shrink-0 sm:w-32"
              >
                <AnimePoster :image="current.image" :title="current.title" eager />
              </RouterLink>
              <div class="min-w-0 flex-1">
                <p class="text-[11px] font-semibold uppercase tracking-[0.16em] text-brass">
                  {{ current.studios[0] || 'Visionnage en cours' }}
                </p>
                <RouterLink
                  :to="`/anime/${current.id}`"
                  class="mt-1.5 block font-display text-2xl font-semibold leading-tight text-ink hover:text-brass"
                >
                  {{ current.title }}
                </RouterLink>
                <p class="mt-1 text-sm text-inkSoft">
                  {{ formatEpisodes(current.episodesWatched, current.episodesTotal) }} épisodes ·
                  {{ Math.round(progressPercent(current.episodesWatched, current.episodesTotal)) }} %
                </p>
                <div class="mt-4 max-w-xl">
                  <ProgressBar
                    :watched="current.episodesWatched"
                    :total="current.episodesTotal"
                    :label="`Progression de ${current.title}`"
                  />
                </div>
                <div class="mt-5 flex flex-wrap gap-2">
                  <BaseButton :to="`/anime/${current.id}`" size="sm">
                    Continuer
                    <template #icon><PlayCircle :size="15" /></template>
                  </BaseButton>
                  <BaseButton :to="`/anime/${current.id}/edit`" size="sm" variant="secondary">
                    Modifier la fiche
                  </BaseButton>
                </div>
              </div>
            </div>

            <div v-else class="flex flex-col items-start gap-4 p-6 pt-2 sm:flex-row sm:items-center">
              <span class="flex h-12 w-12 items-center justify-center rounded-2xl bg-brass/10 text-brass">
                <BookOpen :size="21" />
              </span>
              <div class="flex-1">
                <p class="font-semibold text-ink">Aucun visionnage en cours</p>
                <p class="muted-copy mt-1">
                  Choisis un titre dans ta pile « À voir » pour lancer ta prochaine session.
                </p>
              </div>
              <BaseButton to="/library?status=a_voir" variant="secondary" size="sm">
                Voir ma pile
              </BaseButton>
            </div>

            <div v-if="inProgress.length > 1" class="border-t border-line/10 px-5 py-3 sm:px-6">
              <div class="flex gap-2 overflow-x-auto pb-1">
                <RouterLink
                  v-for="anime in inProgress.slice(1)"
                  :key="anime.id"
                  :to="`/anime/${anime.id}`"
                  class="flex shrink-0 items-center gap-2 rounded-full border border-line/10 bg-surfaceMuted/40 py-1 pl-1 pr-3 transition hover:border-brass/25"
                >
                  <span class="h-8 w-8 overflow-hidden rounded-full">
                    <AnimePoster :image="anime.image" :title="anime.title" />
                  </span>
                  <span class="max-w-36 truncate text-xs font-medium text-inkSoft">
                    {{ anime.title }}
                  </span>
                </RouterLink>
              </div>
            </div>
          </BaseCard>

          <BaseCard :padded="false">
            <div class="flex items-center justify-between gap-4 px-5 pb-4 pt-5 sm:px-6">
              <div>
                <p class="eyebrow">Nouveaux arrivants</p>
                <h2 class="section-heading mt-1">Ajoutés récemment</h2>
              </div>
              <RouterLink
                to="/library"
                class="inline-flex items-center gap-1 text-xs font-semibold text-brass hover:underline"
              >
                Voir tout <ArrowRight :size="13" />
              </RouterLink>
            </div>
            <div
              v-if="recent.length === 0"
              class="px-6 pb-6 text-sm text-inkSoft"
            >
              Ta bibliothèque est encore vide.
              <RouterLink to="/anime/new" class="font-semibold text-brass hover:underline">
                Ajoute ton premier anime.
              </RouterLink>
            </div>
            <div v-else class="grid grid-cols-3 gap-3 px-5 pb-5 sm:grid-cols-6 sm:px-6">
              <RouterLink
                v-for="anime in recent"
                :key="anime.id"
                :to="`/anime/${anime.id}`"
                class="group"
              >
                <div
                  class="poster-frame aspect-[2/3] transition duration-500 group-hover:-translate-y-1 group-hover:border-brass/30"
                >
                  <AnimePoster :image="anime.image" :title="anime.title" />
                </div>
                <p class="mt-2 truncate text-[11px] font-medium text-inkSoft group-hover:text-ink">
                  {{ anime.title }}
                </p>
              </RouterLink>
            </div>
          </BaseCard>

          <BaseCard>
            <div class="flex items-center justify-between">
              <div>
                <p class="eyebrow">Rythme</p>
                <h2 class="section-heading mt-1">Activité des 12 derniers mois</h2>
              </div>
              <span class="hidden items-center gap-1.5 text-[11px] text-inkFaint sm:flex">
                <TrendingUp :size="13" class="text-jade" /> Entrées d’historique
              </span>
            </div>
            <div class="mt-4">
              <ActivityLineChart :items="stats.monthlyActivity" />
            </div>
          </BaseCard>
        </div>

        <div class="space-y-6">
          <BaseCard>
            <div>
              <p class="eyebrow">Répartition</p>
              <h2 class="section-heading mt-1">État de la collection</h2>
            </div>
            <div v-if="statusItems.length" class="relative mt-4 h-[230px]">
              <StatusDonut :items="statusItems" />
              <div
                class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"
              >
                <span class="font-display text-3xl font-semibold tabular-nums text-ink">
                  {{ stats.total }}
                </span>
                <span class="text-[10px] uppercase tracking-[0.16em] text-inkFaint">animes</span>
              </div>
            </div>
            <div class="mt-4 grid grid-cols-2 gap-2">
              <RouterLink
                v-for="item in statusItems"
                :key="item.name"
                to="/library"
                class="flex items-center gap-2 rounded-xl px-1 py-1 text-[11px] text-inkSoft transition hover:bg-surfaceMuted/50"
              >
                <span
                  class="h-2 w-2 rounded-full"
                  :style="{ backgroundColor: item.color }"
                  aria-hidden="true"
                />
                {{ item.name }} <span class="ml-auto tabular-nums">{{ item.value }}</span>
              </RouterLink>
            </div>
          </BaseCard>

          <BaseCard>
            <div class="flex items-center justify-between">
              <div>
                <p class="eyebrow">Journal</p>
                <h2 class="section-heading mt-1">Activité récente</h2>
              </div>
              <RouterLink
                to="/stats"
                class="text-xs font-semibold text-brass hover:underline"
                aria-label="Voir toutes les statistiques"
              >
                Détails
              </RouterLink>
            </div>
            <div class="mt-4">
              <HistoryTimeline :entries="activity" compact />
            </div>
          </BaseCard>

          <BaseCard class="relative overflow-hidden">
            <div
              class="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-rose/10 blur-2xl"
              aria-hidden="true"
            />
            <p class="eyebrow">Coup de cœur</p>
            <div class="mt-3 flex items-baseline gap-2">
              <span class="font-display text-3xl font-semibold text-ink">
                {{ stats.favoriteCount }}
              </span>
              <span class="text-sm text-inkSoft">favoris</span>
            </div>
            <p class="mt-2 text-xs leading-relaxed text-inkSoft">
              Retrouve les titres que tu as marqués d’une cœur, prêts à être revus.
            </p>
            <RouterLink
              to="/favorites"
              class="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-brass hover:underline"
            >
              <Heart :size="13" /> Ouvrir mes favoris
            </RouterLink>
          </BaseCard>

          <BaseCard v-if="nextUp" class="overflow-hidden">
            <p class="eyebrow">Dernier ajout</p>
            <RouterLink :to="`/anime/${nextUp.id}`" class="mt-3 flex items-center gap-3">
              <span class="h-16 w-11 shrink-0 overflow-hidden rounded-xl border border-line/10">
                <AnimePoster :image="nextUp.image" :title="nextUp.title" />
              </span>
              <span class="min-w-0">
                <span class="block truncate font-medium text-ink">{{ nextUp.title }}</span>
                <span class="mt-0.5 block text-[11px] text-inkFaint">
                  Ajouté le {{ formatDate(nextUp.dateAdded) }}
                </span>
              </span>
            </RouterLink>
          </BaseCard>
        </div>
      </div>
    </template>
  </div>
</template>
