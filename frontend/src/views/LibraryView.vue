<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  ArrowDownWideNarrow,
  ArrowUpWideNarrow,
  Download,
  Heart,
  LayoutGrid,
  List,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from 'lucide-vue-next';
import { useDebounceFn } from '@vueuse/core';
import { api } from '@/services/api';
import { useLibraryStore } from '@/stores/library';
import { useToastStore } from '@/stores/toast';
import { PRIORITY_LABELS, PRIORITY_OPTIONS, SORT_OPTIONS, STATUS_LABELS, STATUS_OPTIONS } from '@/constants/anime';
import { pluralize } from '@/utils/format';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseSelect from '@/components/ui/BaseSelect.vue';
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue';
import EmptyState from '@/components/ui/EmptyState.vue';
import SkeletonBlock from '@/components/ui/SkeletonBlock.vue';
import AnimeCard from '@/components/anime/AnimeCard.vue';
import AnimeTable from '@/components/anime/AnimeTable.vue';

const route = useRoute();
const router = useRouter();
const library = useLibraryStore();
const toast = useToastStore();

const view = ref('grid');
const search = ref(typeof route.query.search === 'string' ? route.query.search : '');
const showAdvanced = ref(false);
const toDelete = ref(null);
const deleting = ref(false);
const busyId = ref(null);

const statusValues = new Set(STATUS_OPTIONS.map((option) => option.value));
const priorityValues = new Set(PRIORITY_OPTIONS.map((option) => option.value));

const status = computed(() => {
  const value = route.query.status;
  return typeof value === 'string' && statusValues.has(value) ? value : '';
});

const priority = computed(() => {
  const value = route.query.priority;
  return typeof value === 'string' && priorityValues.has(value) ? value : '';
});

const filters = computed(() => ({
  search: typeof route.query.search === 'string' ? route.query.search : undefined,
  status: status.value || undefined,
  priority: priority.value || undefined,
  genre: typeof route.query.genre === 'string' ? route.query.genre : undefined,
  studio: typeof route.query.studio === 'string' ? route.query.studio : undefined,
  platform: typeof route.query.platform === 'string' ? route.query.platform : undefined,
  year: typeof route.query.year === 'string' ? route.query.year : undefined,
  favorite: route.query.favorite === 'true' ? true : undefined,
  sortBy: typeof route.query.sortBy === 'string' ? route.query.sortBy : 'createdAt',
  order: route.query.order === 'asc' ? 'asc' : 'desc',
}));

const activeFilters = computed(() => {
  const entries = [];
  if (status.value) entries.push({ key: 'status', label: STATUS_LABELS[status.value], value: status.value });
  if (priority.value)
    entries.push({ key: 'priority', label: PRIORITY_LABELS[priority.value], value: priority.value });
  for (const key of ['genre', 'studio', 'platform', 'year']) {
    const value = route.query[key];
    if (typeof value === 'string' && value) entries.push({ key, label: value, value });
  }
  if (route.query.favorite === 'true')
    entries.push({ key: 'favorite', label: 'Favoris uniquement', value: 'true' });
  return entries;
});

const hasSearchQuery = computed(() => Boolean(filters.value.search?.trim()));

const hasActiveQuery = computed(
  () => hasSearchQuery.value || activeFilters.value.length > 0
);

const advancedCount = computed(
  () =>
    Number(Boolean(route.query.genre)) +
    Number(Boolean(route.query.studio)) +
    Number(Boolean(route.query.platform)) +
    Number(Boolean(route.query.year))
);

const sortOptions = SORT_OPTIONS.map((option) => ({ value: option.value, label: option.label }));
const genreOptions = computed(() =>
  (library.meta?.genres ?? []).map((item) => ({
    value: item.name,
    label: `${item.name} (${item.count})`,
  }))
);
const studioOptions = computed(() =>
  (library.meta?.studios ?? []).map((item) => ({
    value: item.name,
    label: `${item.name} (${item.count})`,
  }))
);
const platformOptions = computed(() =>
  (library.meta?.platforms ?? []).map((value) => ({ value, label: value }))
);
const yearOptions = computed(() =>
  (library.meta?.years ?? []).map((year) => ({ value: String(year), label: String(year) }))
);

/**
 * Remplace un paramètre de requête de la route /library.
 * @param {string} key Clé du paramètre.
 * @param {string} [value] Nouvelle valeur ; undefined pour la supprimer.
 * @returns {void}
 */
function setQuery(key, value) {
  const query = { ...route.query };
  if (value === undefined || value === '') delete query[key];
  else query[key] = value;
  void router.replace({ path: '/library', query });
}

const updateSearch = useDebounceFn((value) => {
  setQuery('search', value.trim() || undefined);
}, 350);

watch(
  () => route.query.search,
  (value) => {
    const next = typeof value === 'string' ? value : '';
    if (next !== search.value) search.value = next;
  }
);

watch(
  () => route.fullPath,
  () => {
    void library.fetchAnimes(filters.value);
  },
  { immediate: true }
);

watch(
  () => route.query,
  () => {
    if (advancedCount.value > 0) showAdvanced.value = true;
  },
  { immediate: true }
);

onMounted(() => {
  void library.fetchMeta();
});

function resetFilters() {
  search.value = '';
  showAdvanced.value = false;
  void router.replace({ path: '/library' });
}

/**
 * Bascule le statut favori d'un anime via le store.
 * @param {import('@/types/anime').Anime} anime Anime concerné.
 * @returns {void}
 */
function toggleFavorite(anime) {
  busyId.value = anime.id;
  library
    .toggleFavorite(anime)
    .then((updated) => {
      toast.success(
        updated.isFavorite
          ? `« ${updated.title} » ajouté aux favoris.`
          : `« ${updated.title} » retiré des favoris.`
      );
    })
    .catch((error) => {
      toast.error(error instanceof Error ? error.message : 'Impossible de modifier le favori.');
    })
    .finally(() => {
      busyId.value = null;
    });
}

/**
 * Met à jour la progression d'un épisode via le store.
 * @param {import('@/types/anime').Anime} anime Anime concerné.
 * @param {'increment' | 'decrement'} direction Sens de la progression.
 * @returns {void}
 */
function updateProgress(anime, direction) {
  busyId.value = anime.id;
  library
    .updateProgress(anime, direction)
    .then((updated) => {
      if (updated.status === 'termine' && anime.status !== 'termine') {
        toast.success(`« ${updated.title} » est terminé. Bravo !`);
      } else if (updated.status === 'en_cours' && anime.status === 'a_voir') {
        toast.info(`« ${updated.title} » passe en cours de visionnage.`);
      }
    })
    .catch((error) => {
      toast.error(error instanceof Error ? error.message : 'Progression impossible.');
    })
    .finally(() => {
      busyId.value = null;
    });
}

async function confirmDelete() {
  if (!toDelete.value) return;
  deleting.value = true;
  try {
    await library.removeAnime(toDelete.value);
    toast.success(`« ${toDelete.value.title} » a été supprimé.`);
    toDelete.value = null;
    await library.fetchAnimes();
  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'Suppression impossible.');
  } finally {
    deleting.value = false;
  }
}
</script>

<template>
  <div class="page-wrap space-y-5">
    <header class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="eyebrow">Collection</p>
        <h1 class="display-title mt-2">Ma bibliothèque</h1>
        <p class="mt-2 text-sm text-inkSoft">
          {{ pluralize(library.total, 'anime') }}
          <span class="text-inkFaint">dans ta collection</span>
        </p>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <BaseButton variant="secondary" size="sm" :href="api.exportJsonUrl" download>
          <template #icon><Download :size="14" /></template>
          JSON
        </BaseButton>
        <BaseButton variant="secondary" size="sm" :href="api.exportCsvUrl" download>
          <template #icon><Download :size="14" /></template>
          CSV
        </BaseButton>
        <div class="flex rounded-2xl border border-line/10 bg-surface/55 p-1" role="group" aria-label="Mode d’affichage">
          <button
            type="button"
            class="flex h-9 w-9 items-center justify-center rounded-xl transition"
            :class="view === 'grid' ? 'bg-brass text-[#1b1408]' : 'text-inkFaint hover:text-ink'"
            :aria-pressed="view === 'grid'"
            aria-label="Affichage en grille"
            @click="view = 'grid'"
          >
            <LayoutGrid :size="16" />
          </button>
          <button
            type="button"
            class="flex h-9 w-9 items-center justify-center rounded-xl transition"
            :class="view === 'list' ? 'bg-brass text-[#1b1408]' : 'text-inkFaint hover:text-ink'"
            :aria-pressed="view === 'list'"
            aria-label="Affichage en tableau"
            @click="view = 'list'"
          >
            <List :size="16" />
          </button>
        </div>
      </div>
    </header>

    <section class="surface-panel p-4 sm:p-5" aria-label="Recherche et filtres">
      <div class="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div class="relative min-w-0 flex-1">
          <label for="library-search" class="sr-only">Rechercher un anime</label>
          <Search
            :size="16"
            class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-inkFaint"
            aria-hidden="true"
          />
          <input
            id="library-search"
            v-model="search"
            type="search"
            class="input-base pl-10 pr-10"
            placeholder="Titre, studio, auteur…"
            autocomplete="off"
            @input="updateSearch(search)"
          />
          <button
            v-if="search"
            type="button"
            class="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-inkFaint hover:text-ink"
            aria-label="Effacer la recherche"
            @click="
              search = '';
              setQuery('search');
            "
          >
            <X :size="14" />
          </button>
        </div>

        <div class="grid grid-cols-2 gap-2 sm:flex sm:items-center">
          <BaseSelect
            :model-value="filters.sortBy ?? 'createdAt'"
            :options="sortOptions"
            class="sm:w-48"
            aria-label="Trier par"
            @update:model-value="setQuery('sortBy', $event)"
          />
          <button
            type="button"
            class="icon-button h-[46px] w-full rounded-2xl sm:w-[46px]"
            :aria-label="filters.order === 'asc' ? 'Tri croissant, passer au décroissant' : 'Tri décroissant, passer au croissant'"
            :title="filters.order === 'asc' ? 'Croissant' : 'Décroissant'"
            @click="setQuery('order', filters.order === 'asc' ? 'desc' : 'asc')"
          >
            <component
              :is="filters.order === 'asc' ? ArrowUpWideNarrow : ArrowDownWideNarrow"
              :size="17"
            />
          </button>
          <button
            type="button"
            class="btn-base btn-secondary relative col-span-2 justify-center sm:col-span-1"
            :aria-expanded="showAdvanced"
            @click="showAdvanced = !showAdvanced"
          >
            <SlidersHorizontal :size="15" />
            Filtres
            <span
              v-if="advancedCount"
              class="flex h-5 min-w-5 items-center justify-center rounded-full bg-brass px-1.5 text-[10px] font-bold text-[#1b1408]"
            >
              {{ advancedCount }}
            </span>
          </button>
        </div>
      </div>

      <div class="mt-4 flex gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          class="shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition"
          :class="
            !status
              ? 'border-brass/40 bg-brass/12 text-brass'
              : 'border-line/10 bg-surfaceMuted/40 text-inkSoft hover:border-brass/25 hover:text-ink'
          "
          :aria-pressed="!status"
          @click="setQuery('status')"
        >
          Tous
        </button>
        <button
          v-for="option in STATUS_OPTIONS"
          :key="option.value"
          type="button"
          class="shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition"
          :class="
            status === option.value
              ? 'border-brass/40 bg-brass/12 text-brass'
              : 'border-line/10 bg-surfaceMuted/40 text-inkSoft hover:border-brass/25 hover:text-ink'
          "
          :aria-pressed="status === option.value"
          @click="setQuery('status', status === option.value ? undefined : option.value)"
        >
          {{ option.label }}
        </button>
        <button
          type="button"
          class="ml-auto flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition"
          :class="
            route.query.favorite === 'true'
              ? 'border-rose/40 bg-rose/12 text-rose'
              : 'border-line/10 bg-surfaceMuted/40 text-inkSoft hover:border-rose/25 hover:text-rose'
          "
          :aria-pressed="route.query.favorite === 'true'"
          @click="setQuery('favorite', route.query.favorite === 'true' ? undefined : 'true')"
        >
          <Heart :size="12" :fill="route.query.favorite === 'true' ? 'currentColor' : 'none'" />
          Favoris
        </button>
      </div>

      <Transition name="filters">
        <div v-if="showAdvanced" class="mt-4 border-t border-line/10 pt-4">
          <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <BaseSelect
              :model-value="filters.genre ?? ''"
              :options="genreOptions"
              label="Genre"
              placeholder="Tous les genres"
              :disabled="library.metaLoading"
              @update:model-value="setQuery('genre', $event)"
            />
            <BaseSelect
              :model-value="filters.studio ?? ''"
              :options="studioOptions"
              label="Studio"
              placeholder="Tous les studios"
              :disabled="library.metaLoading"
              @update:model-value="setQuery('studio', $event)"
            />
            <BaseSelect
              :model-value="filters.platform ?? ''"
              :options="platformOptions"
              label="Plateforme"
              placeholder="Toutes les plateformes"
              :disabled="library.metaLoading"
              @update:model-value="setQuery('platform', $event)"
            />
            <BaseSelect
              :model-value="filters.year ? String(filters.year) : ''"
              :options="yearOptions"
              label="Année de sortie"
              placeholder="Toutes les années"
              :disabled="library.metaLoading"
              @update:model-value="setQuery('year', $event)"
            />
            <BaseSelect
              :model-value="priority"
              :options="PRIORITY_OPTIONS.map((item) => ({ value: item.value, label: item.label }))"
              label="Priorité"
              placeholder="Toutes les priorités"
              @update:model-value="setQuery('priority', $event)"
            />
          </div>
        </div>
      </Transition>

      <div v-if="activeFilters.length" class="mt-4 flex flex-wrap items-center gap-2">
        <span class="text-[10px] font-semibold uppercase tracking-[0.14em] text-inkFaint">
          Filtres actifs
        </span>
        <button
          v-for="filter in activeFilters"
          :key="filter.key"
          type="button"
          class="chip transition hover:border-brass/35 hover:text-ink"
          @click="setQuery(filter.key)"
        >
          {{ filter.label }}
          <X :size="11" aria-hidden="true" />
        </button>
        <button
          type="button"
          class="inline-flex items-center gap-1 text-[11px] font-semibold text-brass hover:underline"
          @click="resetFilters"
        >
          <RotateCcw :size="11" /> Tout réinitialiser
        </button>
      </div>
    </section>

    <div
      v-if="library.error"
      class="surface-panel flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center"
    >
      <div class="flex-1">
        <p class="font-semibold text-ink">La bibliothèque n’a pas pu être chargée.</p>
        <p class="muted-copy mt-1">{{ library.error }}</p>
      </div>
      <BaseButton variant="secondary" @click="library.fetchAnimes()">Réessayer</BaseButton>
    </div>

    <div
      v-else-if="library.loading"
      class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6"
    >
      <SkeletonBlock v-for="index in 12" :key="index" class="aspect-[2/3] rounded-3xl" />
    </div>

    <EmptyState
      v-else-if="library.isEmpty && hasActiveQuery"
      title="Aucun anime ne correspond"
      subtitle="Essaie d’élargir tes filtres ou de modifier ta recherche pour retrouver un titre."
    >
      <template #icon><Search :size="25" /></template>
      <template #action>
        <BaseButton variant="secondary" @click="resetFilters">
          <template #icon><RotateCcw :size="15" /></template>
          Réinitialiser les filtres
        </BaseButton>
      </template>
    </EmptyState>

    <EmptyState
      v-else-if="library.isEmpty"
      title="Ta bibliothèque est vide"
      subtitle="Commence par ajouter une histoire : recherche automatique, fiche manuelle, tout est prêt."
    >
      <template #icon><Sparkles :size="25" /></template>
      <template #action>
        <BaseButton to="/anime/new">
          Ajouter mon premier anime
        </BaseButton>
      </template>
    </EmptyState>

    <template v-else>
      <AnimeTable
        v-if="view === 'list'"
        :animes="library.animes"
        :busy-id="busyId"
        @favorite="toggleFavorite"
        @delete="toDelete = $event"
      />
      <div
        v-else
        class="grid grid-cols-2 gap-3.5 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 xl:grid-cols-6"
      >
        <AnimeCard
          v-for="anime in library.animes"
          :key="anime.id"
          :anime="anime"
          :busy="busyId === anime.id"
          @favorite="toggleFavorite"
          @delete="toDelete = $event"
          @progress="updateProgress"
        />
      </div>

      <div v-if="library.hasMore" class="flex justify-center pt-2">
        <BaseButton
          variant="secondary"
          :loading="library.loadingMore"
          @click="library.loadMore()"
        >
          Charger plus d’animes
        </BaseButton>
      </div>
      <p v-else class="pt-1 text-center text-[11px] text-inkFaint">
        {{ library.total }} animes affichés · fin de la collection
      </p>
    </template>

    <ConfirmDialog
      :open="Boolean(toDelete)"
      title="Supprimer cet anime ?"
      :message="
        toDelete
          ? `« ${toDelete.title} » sera définitivement retiré de ta bibliothèque. Cette action est irréversible.`
          : ''
      "
      confirm-label="Supprimer"
      :loading="deleting"
      @confirm="confirmDelete"
      @cancel="toDelete = null"
    />
  </div>
</template>

<style scoped>
.filters-enter-active,
.filters-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.filters-enter-from,
.filters-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
