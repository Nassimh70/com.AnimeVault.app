<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  ArrowLeft,
  Clapperboard,
  ExternalLink,
  Heart,
  History,
  Pencil,
  Star,
  Trash2,
} from 'lucide-vue-next';
import { api } from '@/services/api';
import { useToastStore } from '@/stores/toast';
import { PRIORITY_COLORS, PRIORITY_LABELS } from '@/constants/anime';
import {
  formatDate,
  formatDateTime,
  formatEpisodes,
  formatHours,
  progressPercent,
} from '@/utils/format';
import AnimePoster from '@/components/anime/AnimePoster.vue';
import HistoryTimeline from '@/components/anime/HistoryTimeline.vue';
import ProgressControl from '@/components/anime/ProgressControl.vue';
import BaseBadge from '@/components/ui/BaseBadge.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseCard from '@/components/ui/BaseCard.vue';
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue';
import SkeletonBlock from '@/components/ui/SkeletonBlock.vue';
import StatusBadge from '@/components/ui/StatusBadge.vue';

const route = useRoute();
const router = useRouter();
const toast = useToastStore();

const anime = ref(null);
const history = ref([]);
const related = ref([]);
const loading = ref(true);
const error = ref(null);
const busy = ref(false);
const confirmDelete = ref(false);
const deleting = ref(false);

const percent = computed(() =>
  anime.value ? Math.round(progressPercent(anime.value.episodesWatched, anime.value.episodesTotal)) : 0
);
const remaining = computed(() => {
  if (!anime.value) return 0;
  return Math.max(anime.value.episodesTotal - anime.value.episodesWatched, 0);
});
const remainingHours = computed(() =>
  anime.value ? Math.round((remaining.value * anime.value.episodeDuration) / 60) : 0
);

async function load() {
  const id = String(route.params.id ?? '');
  loading.value = true;
  error.value = null;
  try {
    const [animeData, historyData] = await Promise.all([
      api.getAnime(id),
      api.getAnimeHistory(id, 30),
    ]);
    anime.value = animeData;
    history.value = historyData;
    if (animeData.studios[0]) {
      const sameStudio = await api.getAnimes({
        studio: animeData.studios[0],
        limit: 7,
        sortBy: 'rating',
        order: 'desc',
      });
      related.value = sameStudio.data.filter((item) => item.id !== animeData.id).slice(0, 6);
    } else {
      related.value = [];
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Impossible de charger cette fiche.';
  } finally {
    loading.value = false;
  }
}

async function toggleFavorite() {
  if (!anime.value) return;
  busy.value = true;
  try {
    const updated = await api.toggleFavorite(anime.value.id, !anime.value.isFavorite);
    anime.value = updated;
    toast.success(updated.isFavorite ? 'Ajouté à tes favoris.' : 'Retiré de tes favoris.');
  } catch (err) {
    toast.error(err instanceof Error ? err.message : 'Impossible de modifier le favori.');
  } finally {
    busy.value = false;
  }
}

async function updateProgress(direction) {
  if (!anime.value) return;
  busy.value = true;
  try {
    const previousStatus = anime.value.status;
    const updated = await api.updateProgress(anime.value.id, direction);
    anime.value = updated;
    history.value = await api.getAnimeHistory(updated.id, 30);
    if (updated.status === 'termine' && previousStatus !== 'termine') {
      toast.success(`« ${updated.title} » est terminé. Bravo !`);
    } else if (updated.status === 'en_cours' && previousStatus === 'a_voir') {
      toast.info('Le visionnage est lancé.');
    }
  } catch (err) {
    toast.error(err instanceof Error ? err.message : 'Progression impossible.');
  } finally {
    busy.value = false;
  }
}

async function deleteAnime() {
  if (!anime.value) return;
  deleting.value = true;
  try {
    await api.deleteAnime(anime.value.id);
    toast.success(`« ${anime.value.title} » a été supprimé.`);
    await router.push('/library');
  } catch (err) {
    toast.error(err instanceof Error ? err.message : 'Suppression impossible.');
  } finally {
    deleting.value = false;
  }
}

watch(
  () => route.params.id,
  () => {
    if (route.name === 'anime-detail') void load();
  }
);

onMounted(load);
</script>

<template>
  <div class="page-wrap">
    <div v-if="loading" class="space-y-6">
      <SkeletonBlock class="h-8 w-40" />
      <div class="grid gap-6 lg:grid-cols-[280px_1fr]">
        <SkeletonBlock class="aspect-[2/3] rounded-4xl" />
        <div class="space-y-4">
          <SkeletonBlock class="h-10 w-2/3" />
          <SkeletonBlock class="h-5 w-1/3" />
          <SkeletonBlock class="h-40" />
        </div>
      </div>
    </div>

    <div v-else-if="error || !anime" class="surface-panel p-8 text-center sm:p-12">
      <p class="eyebrow">Fiche introuvable</p>
      <h1 class="mt-3 font-display text-3xl font-semibold text-ink">
        Cette histoire n’est pas sur l’étagère.
      </h1>
      <p class="muted-copy mx-auto mt-3 max-w-lg">{{ error }}</p>
      <BaseButton to="/library" variant="secondary" class="mt-6">
        <template #icon><ArrowLeft :size="15" /></template>
        Retour à la bibliothèque
      </BaseButton>
    </div>

    <template v-else>
      <RouterLink
        to="/library"
        class="inline-flex items-center gap-1.5 text-xs font-semibold text-inkFaint transition hover:text-brass"
      >
        <ArrowLeft :size="14" />
        Retour à la bibliothèque
      </RouterLink>

      <section class="relative mt-4 overflow-hidden rounded-5xl border border-line/10 bg-surface/55">
        <div v-if="anime.image" class="absolute inset-0" aria-hidden="true">
          <img :src="anime.image" alt="" class="h-full w-full scale-110 object-cover opacity-20 blur-2xl" />
          <div class="absolute inset-0 bg-gradient-to-b from-canvas/50 via-canvas/80 to-canvas" />
        </div>
        <div
          class="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-brass/12 blur-3xl"
          aria-hidden="true"
        />

        <div class="relative grid gap-6 p-5 sm:p-7 lg:grid-cols-[260px_1fr] lg:gap-8 lg:p-8">
          <div class="mx-auto w-44 sm:w-52 lg:mx-0 lg:w-full">
            <div class="poster-frame aspect-[2/3]">
              <AnimePoster :image="anime.image" :title="anime.title" eager />
            </div>
          </div>

          <div class="min-w-0">
            <div class="flex flex-wrap items-start justify-between gap-4">
              <div class="min-w-0">
                <div class="flex flex-wrap items-center gap-2">
                  <StatusBadge :status="anime.status" dot />
                  <BaseBadge :color="PRIORITY_COLORS[anime.priority]">
                    Priorité {{ PRIORITY_LABELS[anime.priority].toLowerCase() }}
                  </BaseBadge>
                  <BaseBadge color="rgb(var(--color-moon))">{{ anime.language }}</BaseBadge>
                  <BaseBadge v-if="anime.isFavorite" color="rgb(var(--color-rose))">
                    <Heart :size="10" fill="currentColor" /> Favori
                  </BaseBadge>
                </div>
                <h1 class="mt-3 font-display text-3xl font-semibold leading-[1.04] tracking-[-0.03em] text-ink sm:text-4xl lg:text-5xl">
                  {{ anime.title }}
                </h1>
                <p v-if="anime.titleJapanese" class="mt-2 text-sm text-inkSoft">
                  {{ anime.titleJapanese }}
                </p>
              </div>
              <div class="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  class="icon-button h-11 w-11"
                  :class="anime.isFavorite && '!border-rose/35 !bg-rose/10 !text-rose'"
                  :disabled="busy"
                  :aria-label="anime.isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'"
                  :aria-pressed="anime.isFavorite"
                  @click="toggleFavorite"
                >
                  <Heart :size="17" :fill="anime.isFavorite ? 'currentColor' : 'none'" />
                </button>
                <BaseButton :to="`/anime/${anime.id}/edit`" variant="secondary" size="sm">
                  <template #icon><Pencil :size="14" /></template>
                  Modifier
                </BaseButton>
                <button
                  type="button"
                  class="icon-button h-11 w-11 hover:!border-rose/30 hover:!text-rose"
                  aria-label="Supprimer cet anime"
                  @click="confirmDelete = true"
                >
                  <Trash2 :size="16" />
                </button>
              </div>
            </div>

            <div class="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-inkSoft">
              <span v-if="anime.studios.length" class="flex items-center gap-1.5">
                <Clapperboard :size="13" class="text-brass" />
                {{ anime.studios.join(', ') }}
              </span>
              <span v-if="anime.releaseDate">Sortie : {{ formatDate(anime.releaseDate, 'long') }}</span>
              <span v-if="anime.season">{{ anime.season }}</span>
              <span v-if="anime.rating !== null" class="flex items-center gap-1 text-amber">
                <Star :size="13" fill="currentColor" />
                {{ anime.rating }}/10
              </span>
            </div>

            <p class="mt-5 max-w-3xl text-sm leading-7 text-inkSoft">
              {{ anime.synopsis || 'Aucun synopsis renseigné pour ce titre.' }}
            </p>

            <div class="mt-5 flex flex-wrap gap-1.5">
              <span v-for="genre in anime.genres" :key="genre" class="chip">{{ genre }}</span>
              <span v-for="tag in anime.tags" :key="tag" class="chip !border-moon/20 !text-moon">
                #{{ tag }}
              </span>
              <span v-if="anime.collections.length" class="chip !border-jade/20 !text-jade">
                {{ anime.collections.join(' · ') }}
              </span>
            </div>

            <div class="mt-6 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
              <div class="rounded-2xl border border-line/10 bg-surface/45 p-3">
                <p class="text-[9px] uppercase tracking-[0.14em] text-inkFaint">Progression</p>
                <p class="mt-1 text-sm font-semibold tabular-nums text-ink">{{ percent }} %</p>
              </div>
              <div class="rounded-2xl border border-line/10 bg-surface/45 p-3">
                <p class="text-[9px] uppercase tracking-[0.14em] text-inkFaint">Épisodes</p>
                <p class="mt-1 text-sm font-semibold tabular-nums text-ink">
                  {{ formatEpisodes(anime.episodesWatched, anime.episodesTotal) }}
                </p>
              </div>
              <div class="rounded-2xl border border-line/10 bg-surface/45 p-3">
                <p class="text-[9px] uppercase tracking-[0.14em] text-inkFaint">Restant</p>
                <p class="mt-1 text-sm font-semibold tabular-nums text-ink">
                  {{ formatHours(remainingHours) }}
                </p>
              </div>
              <div class="rounded-2xl border border-line/10 bg-surface/45 p-3">
                <p class="text-[9px] uppercase tracking-[0.14em] text-inkFaint">Durée / ép.</p>
                <p class="mt-1 text-sm font-semibold tabular-nums text-ink">
                  {{ anime.episodeDuration }} min
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div class="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div class="space-y-6">
          <ProgressControl :anime="anime" :busy="busy" @progress="updateProgress" />

          <BaseCard>
            <div class="flex items-center justify-between">
              <div>
                <p class="eyebrow">Mon carnet</p>
                <h2 class="section-heading mt-1">Note & impressions</h2>
              </div>
              <RouterLink
                :to="`/anime/${anime.id}/edit`"
                class="text-xs font-semibold text-brass hover:underline"
              >
                Modifier
              </RouterLink>
            </div>
            <div class="mt-4 flex items-center gap-3">
              <span
                v-if="anime.rating !== null"
                class="flex items-baseline gap-1 font-display text-3xl font-semibold text-amber"
              >
                {{ anime.rating }}
                <span class="text-sm font-normal text-inkFaint">/ 10</span>
              </span>
              <span v-else class="text-sm text-inkSoft">Pas encore noté.</span>
              <span class="ml-auto chip">{{ anime.platform || 'Plateforme non renseignée' }}</span>
            </div>
            <p class="mt-4 whitespace-pre-line text-sm leading-relaxed text-inkSoft">
              {{ anime.comment || 'Aucun commentaire pour le moment.' }}
            </p>
          </BaseCard>

          <BaseCard>
            <div class="flex items-center gap-2">
              <History :size="16" class="text-brass" aria-hidden="true" />
              <div>
                <p class="eyebrow">Journal de bord</p>
                <h2 class="section-heading mt-1">Historique du titre</h2>
              </div>
            </div>
            <div class="mt-4">
              <HistoryTimeline :entries="history" />
            </div>
          </BaseCard>
        </div>

        <div class="space-y-6">
          <BaseCard>
            <p class="eyebrow">Informations</p>
            <h2 class="section-heading mt-1">La fiche</h2>
            <dl class="mt-4 space-y-3 text-sm">
              <div class="flex justify-between gap-4 border-b border-line/8 pb-3">
                <dt class="text-inkFaint">Studios</dt>
                <dd class="text-right text-inkSoft">{{ anime.studios.join(', ') || '—' }}</dd>
              </div>
              <div class="flex justify-between gap-4 border-b border-line/8 pb-3">
                <dt class="text-inkFaint">Auteur</dt>
                <dd class="text-right text-inkSoft">{{ anime.author || '—' }}</dd>
              </div>
              <div class="flex justify-between gap-4 border-b border-line/8 pb-3">
                <dt class="text-inkFaint">Saison</dt>
                <dd class="text-right text-inkSoft">{{ anime.season || '—' }}</dd>
              </div>
              <div class="flex justify-between gap-4 border-b border-line/8 pb-3">
                <dt class="text-inkFaint">Sortie</dt>
                <dd class="text-right text-inkSoft">{{ formatDate(anime.releaseDate) }}</dd>
              </div>
              <div class="flex justify-between gap-4 border-b border-line/8 pb-3">
                <dt class="text-inkFaint">Plateforme</dt>
                <dd class="text-right text-inkSoft">{{ anime.platform || '—' }}</dd>
              </div>
              <div class="flex justify-between gap-4 border-b border-line/8 pb-3">
                <dt class="text-inkFaint">Langue</dt>
                <dd class="text-right text-inkSoft">{{ anime.language }}</dd>
              </div>
              <div class="flex justify-between gap-4 border-b border-line/8 pb-3">
                <dt class="text-inkFaint">Ajouté le</dt>
                <dd class="text-right text-inkSoft">{{ formatDate(anime.dateAdded) }}</dd>
              </div>
              <div v-if="anime.dateFinished" class="flex justify-between gap-4 border-b border-line/8 pb-3">
                <dt class="text-inkFaint">Terminé le</dt>
                <dd class="text-right text-inkSoft">{{ formatDate(anime.dateFinished) }}</dd>
              </div>
              <div class="flex justify-between gap-4">
                <dt class="text-inkFaint">Dernière modification</dt>
                <dd class="text-right text-inkSoft">{{ formatDateTime(anime.updatedAt) }}</dd>
              </div>
            </dl>

            <div v-if="anime.malLink || anime.aniListLink" class="mt-5 flex flex-wrap gap-3">
              <a
                v-if="anime.malLink"
                :href="anime.malLink"
                target="_blank"
                rel="noreferrer"
                class="inline-flex items-center gap-1.5 text-xs font-semibold text-brass hover:underline"
              >
                <ExternalLink :size="12" /> MyAnimeList
              </a>
              <a
                v-if="anime.aniListLink"
                :href="anime.aniListLink"
                target="_blank"
                rel="noreferrer"
                class="inline-flex items-center gap-1.5 text-xs font-semibold text-brass hover:underline"
              >
                <ExternalLink :size="12" /> AniList
              </a>
            </div>
          </BaseCard>

          <BaseCard class="overflow-hidden">
            <p class="eyebrow">Prochain palier</p>
            <h2 class="section-heading mt-1">Ta prochaine session</h2>
            <p v-if="anime.episodesTotal > 0" class="mt-3 text-sm leading-relaxed text-inkSoft">
              Il reste <span class="font-semibold text-ink">{{ remaining }} épisodes</span>,
              soit environ {{ formatHours(remainingHours) }} de visionnage.
            </p>
            <p v-else class="mt-3 text-sm text-inkSoft">
              Le nombre total d’épisodes n’est pas renseigné. Tu peux le compléter depuis la fiche
              d’édition.
            </p>
            <RouterLink
              :to="`/anime/${anime.id}/edit`"
              class="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-brass hover:underline"
            >
              Compléter la fiche
            </RouterLink>
          </BaseCard>
        </div>
      </div>

      <section v-if="related.length" class="mt-8">
        <div class="flex items-end justify-between gap-4">
          <div>
            <p class="eyebrow">Même maison</p>
            <h2 class="section-heading mt-1">Dans le même studio</h2>
          </div>
          <RouterLink
            :to="`/library?studio=${encodeURIComponent(anime.studios[0] ?? '')}`"
            class="text-xs font-semibold text-brass hover:underline"
          >
            Voir tout
          </RouterLink>
        </div>
        <div class="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-6">
          <RouterLink
            v-for="item in related"
            :key="item.id"
            :to="`/anime/${item.id}`"
            class="group"
          >
            <div class="poster-frame aspect-[2/3] transition group-hover:-translate-y-1 group-hover:border-brass/30">
              <AnimePoster :image="item.image" :title="item.title" />
            </div>
            <p class="mt-2 truncate text-[11px] text-inkSoft group-hover:text-ink">
              {{ item.title }}
            </p>
          </RouterLink>
        </div>
      </section>

      <ConfirmDialog
        :open="confirmDelete"
        title="Supprimer cet anime ?"
        :message="`« ${anime.title} » sera définitivement supprimé de ta bibliothèque. Cette action est irréversible.`"
        confirm-label="Supprimer définitivement"
        :loading="deleting"
        @confirm="deleteAnime"
        @cancel="confirmDelete = false"
      />
    </template>
  </div>
</template>
