<script setup>
import { computed, onMounted, ref } from 'vue';
import { Heart, Sparkles } from 'lucide-vue-next';
import { api } from '@/services/api';
import { useToastStore } from '@/stores/toast';
import { pluralize } from '@/utils/format';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseSelect from '@/components/ui/BaseSelect.vue';
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue';
import EmptyState from '@/components/ui/EmptyState.vue';
import SkeletonBlock from '@/components/ui/SkeletonBlock.vue';
import AnimeCard from '@/components/anime/AnimeCard.vue';

const toast = useToastStore();
const animes = ref([]);
const loading = ref(true);
const error = ref(null);
const sort = ref('updatedAt');
const busyId = ref(null);
const toDelete = ref(null);
const deleting = ref(false);

const sortOptions = [
  { value: 'updatedAt', label: 'Dernière activité' },
  { value: 'title', label: 'Titre' },
  { value: 'rating', label: 'Note' },
  { value: 'releaseDate', label: 'Date de sortie' },
];

const countLabel = computed(() => pluralize(animes.value.length, 'anime', 'animes'));

async function load() {
  loading.value = true;
  error.value = null;
  try {
    const response = await api.getAnimes({
      favorite: true,
      limit: 100,
      sortBy: sort.value,
      order: sort.value === 'title' ? 'asc' : 'desc',
    });
    animes.value = response.data;
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Impossible de charger les favoris.';
  } finally {
    loading.value = false;
  }
}

/**
 * Retire un anime de la liste locale des favoris.
 * @param {import('@/types/anime').Anime} anime Anime à retirer.
 * @returns {void}
 */
function removeFromList(anime) {
  animes.value = animes.value.filter((item) => item.id !== anime.id);
}

/**
 * Retire un anime des favoris via l'API.
 * @param {import('@/types/anime').Anime} anime Anime à défavoriser.
 * @returns {void}
 */
function toggleFavorite(anime) {
  busyId.value = anime.id;
  api
    .toggleFavorite(anime.id, false)
    .then(() => {
      removeFromList(anime);
      toast.success(`« ${anime.title} » retiré des favoris.`);
    })
    .catch((err) => {
      toast.error(err instanceof Error ? err.message : 'Impossible de modifier le favori.');
    })
    .finally(() => {
      busyId.value = null;
    });
}

/**
 * Met à jour la progression d'un épisode via l'API.
 * @param {import('@/types/anime').Anime} anime Anime concerné.
 * @param {'increment' | 'decrement'} direction Sens de la progression.
 * @returns {void}
 */
function updateProgress(anime, direction) {
  busyId.value = anime.id;
  api
    .updateProgress(anime.id, direction)
    .then((updated) => {
      const index = animes.value.findIndex((item) => item.id === updated.id);
      if (index !== -1) animes.value[index] = updated;
      if (updated.status === 'termine' && anime.status !== 'termine') {
        toast.success(`« ${updated.title} » est terminé.`);
      }
    })
    .catch((err) => {
      toast.error(err instanceof Error ? err.message : 'Progression impossible.');
    })
    .finally(() => {
      busyId.value = null;
    });
}

async function confirmDelete() {
  if (!toDelete.value) return;
  deleting.value = true;
  try {
    await api.deleteAnime(toDelete.value.id);
    removeFromList(toDelete.value);
    toast.success(`« ${toDelete.value.title} » a été supprimé.`);
    toDelete.value = null;
  } catch (err) {
    toast.error(err instanceof Error ? err.message : 'Suppression impossible.');
  } finally {
    deleting.value = false;
  }
}

onMounted(load);
</script>

<template>
  <div class="page-wrap space-y-6">
    <header class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="eyebrow">Collection</p>
        <h1 class="display-title mt-2 flex items-center gap-3">
          Mes favoris
          <Heart :size="26" class="text-rose" fill="currentColor" aria-hidden="true" />
        </h1>
        <p class="mt-2 text-sm text-inkSoft">
          {{ countLabel }} <span class="text-inkFaint">que tu chéris particulièrement</span>
        </p>
      </div>
      <BaseSelect
        :model-value="sort"
        :options="sortOptions"
        class="w-full sm:w-52"
        label="Trier les favoris"
        @update:model-value="
          sort = $event;
          load();
        "
      />
    </header>

    <div
      v-if="error"
      class="surface-panel flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center"
    >
      <div class="flex-1">
        <p class="font-semibold text-ink">Les favoris sont indisponibles.</p>
        <p class="muted-copy mt-1">{{ error }}</p>
      </div>
      <BaseButton variant="secondary" @click="load">Réessayer</BaseButton>
    </div>

    <div
      v-else-if="loading"
      class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6"
    >
      <SkeletonBlock v-for="index in 6" :key="index" class="aspect-[2/3] rounded-3xl" />
    </div>

    <EmptyState
      v-else-if="animes.length === 0"
      title="Aucun favori pour l’instant"
      subtitle="Marque des animes d’un cœur depuis leur fiche ou leur carte : ils apparaîtront ici, comme sur une étagère dédiée."
    >
      <template #icon><Sparkles :size="25" /></template>
      <template #action>
        <BaseButton to="/library" variant="secondary">Explorer la bibliothèque</BaseButton>
      </template>
    </EmptyState>

    <div v-else class="grid grid-cols-2 gap-3.5 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 xl:grid-cols-6">
      <AnimeCard
        v-for="anime in animes"
        :key="anime.id"
        :anime="anime"
        :busy="busyId === anime.id"
        @favorite="toggleFavorite"
        @delete="toDelete = $event"
        @progress="updateProgress"
      />
    </div>

    <ConfirmDialog
      :open="Boolean(toDelete)"
      title="Supprimer cet anime ?"
      :message="
        toDelete
          ? `« ${toDelete.title} » sera définitivement supprimé de ta bibliothèque et de tes favoris.`
          : ''
      "
      confirm-label="Supprimer"
      :loading="deleting"
      @confirm="confirmDelete"
      @cancel="toDelete = null"
    />
  </div>
</template>
