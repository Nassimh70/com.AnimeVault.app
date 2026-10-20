<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  ArrowLeft,
  ExternalLink,
  ImagePlus,
  Loader2,
  Search,
  Sparkles,
  Upload,
} from 'lucide-vue-next';
import { useDebounceFn } from '@vueuse/core';
import { api } from '@/services/api';
import { useToastStore } from '@/stores/toast';
import {
  LANGUAGE_OPTIONS,
  PLATFORM_OPTIONS,
  PRIORITY_OPTIONS,
  STATUS_OPTIONS,
} from '@/constants/anime';
import { splitList } from '@/utils/format';
import AnimePoster from '@/components/anime/AnimePoster.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseSelect from '@/components/ui/BaseSelect.vue';
import SkeletonBlock from '@/components/ui/SkeletonBlock.vue';

const route = useRoute();
const router = useRouter();
const toast = useToastStore();

const isEdit = computed(() => route.name === 'anime-edit');
const animeId = computed(() => String(route.params.id ?? ''));
const loading = ref(isEdit.value);
const loadError = ref(null);
const submitting = ref(false);
const uploading = ref(false);
const formError = ref(null);

const form = reactive({
  title: '',
  titleJapanese: '',
  image: '',
  synopsis: '',
  author: '',
  episodesTotal: 0,
  episodesWatched: 0,
  episodeDuration: 24,
  releaseDate: '',
  dateFinished: '',
  season: '',
  status: 'a_voir',
  rating: null,
  comment: '',
  priority: 'moyenne',
  platform: 'Crunchyroll',
  language: 'VOSTFR',
  malLink: '',
  aniListLink: '',
});

const genresText = ref('');
const studiosText = ref('');
const tagsText = ref('');
const collectionsText = ref('');

const searchQuery = ref('');
const searchLoading = ref(false);
const searchMessage = ref('');
const results = ref([]);
let searchController = null;

async function loadAnime() {
  if (!isEdit.value) return;
  loading.value = true;
  loadError.value = null;
  try {
    const anime = await api.getAnime(animeId.value);
    form.title = anime.title;
    form.titleJapanese = anime.titleJapanese;
    form.image = anime.image;
    form.synopsis = anime.synopsis;
    form.author = anime.author;
    form.episodesTotal = anime.episodesTotal;
    form.episodesWatched = anime.episodesWatched;
    form.episodeDuration = anime.episodeDuration;
    form.releaseDate = anime.releaseDate || '';
    form.dateFinished = anime.dateFinished ? anime.dateFinished.slice(0, 10) : '';
    form.season = anime.season;
    form.status = anime.status;
    form.rating = anime.rating;
    form.comment = anime.comment;
    form.priority = anime.priority;
    form.platform = anime.platform || 'Crunchyroll';
    form.language = anime.language;
    form.malLink = anime.malLink;
    form.aniListLink = anime.aniListLink;
    genresText.value = anime.genres.join(', ');
    studiosText.value = anime.studios.join(', ');
    tagsText.value = anime.tags.join(', ');
    collectionsText.value = anime.collections.join(', ');
  } catch (err) {
    loadError.value = err instanceof Error ? err.message : 'Impossible de charger cette fiche.';
  } finally {
    loading.value = false;
  }
}

/**
 * Recherche un anime en ligne via l'API externe.
 * @param {string} query Texte recherché.
 * @returns {Promise<void>}
 */
async function doSearch(query) {
  const value = query.trim();
  if (value.length < 2) {
    searchMessage.value = 'Tape au moins 2 caractères pour lancer la recherche.';
    results.value = [];
    return;
  }
  searchController?.abort();
  searchController = new AbortController();
  searchLoading.value = true;
  searchMessage.value = '';
  try {
    const found = await api.searchExternal(value, searchController.signal);
    results.value = found;
    if (found.length === 0) searchMessage.value = 'Aucun résultat pour cette recherche.';
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') return;
    results.value = [];
    searchMessage.value =
      err instanceof Error ? err.message : 'La recherche automatique est indisponible.';
  } finally {
    searchLoading.value = false;
  }
}

const debouncedSearch = useDebounceFn((query) => doSearch(query), 500);

watch(searchQuery, (query) => {
  if (query.trim().length < 2) {
    results.value = [];
    searchMessage.value = '';
    return;
  }
  void debouncedSearch(query);
});

/**
 * Applique les informations d'un résultat externe au formulaire.
 * @param {import('@/types/anime').ExternalAnime} item Résultat sélectionné.
 * @returns {void}
 */
function applyExternal(item) {
  form.title = item.title;
  form.titleJapanese = item.titleJapanese;
  form.image = item.image;
  form.synopsis = item.synopsis;
  form.episodesTotal = item.episodesTotal;
  form.episodeDuration = item.episodeDuration;
  form.rating = item.rating;
  form.releaseDate = item.releaseDate;
  form.season = item.season;
  form.malLink = item.malLink;
  form.aniListLink = item.aniListLink;
  genresText.value = item.genres.join(', ');
  studiosText.value = item.studios.join(', ');
  results.value = [];
  searchQuery.value = '';
  searchMessage.value = '';
  toast.success(`Informations importées depuis ${item.source}.`);
}

/**
 * Téléverse une image choisie dans l'input fichier.
 * @param {Event} event Événement de changement.
 * @returns {Promise<void>}
 */
async function onFileChange(event) {
  const input = event.target;
  const file = input.files?.[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) {
    toast.error('L’image dépasse la limite de 5 Mo.');
    input.value = '';
    return;
  }
  uploading.value = true;
  try {
    form.image = await api.uploadImage(file);
    toast.success('Affiche téléversée.');
  } catch (err) {
    toast.error(err instanceof Error ? err.message : 'Téléversement impossible.');
  } finally {
    uploading.value = false;
    input.value = '';
  }
}

/**
 * Construit le payload d'envoi à partir de l'état du formulaire.
 * @returns {import('@/types/anime').AnimeInput} Payload prêt pour l'API.
 */
function buildPayload() {
  return {
    title: form.title.trim(),
    titleJapanese: form.titleJapanese.trim(),
    image: form.image.trim(),
    synopsis: form.synopsis,
    author: form.author.trim(),
    episodesTotal: Number(form.episodesTotal) || 0,
    episodesWatched: Number(form.episodesWatched) || 0,
    episodeDuration: Number(form.episodeDuration) || 24,
    releaseDate: form.releaseDate,
    dateFinished: form.dateFinished || null,
    season: form.season.trim(),
    status: form.status,
    rating: form.rating === null || form.rating === undefined ? null : Number(form.rating),
    comment: form.comment,
    priority: form.priority,
    platform: form.platform,
    language: form.language,
    malLink: form.malLink.trim(),
    aniListLink: form.aniListLink.trim(),
    genres: splitList(genresText.value),
    studios: splitList(studiosText.value),
    tags: splitList(tagsText.value),
    collections: splitList(collectionsText.value),
  };
}

async function submit() {
  formError.value = null;
  if (!form.title.trim()) {
    formError.value = 'Le titre est obligatoire.';
    document.getElementById('title')?.focus();
    return;
  }
  if (form.rating !== null && (form.rating < 0 || form.rating > 10)) {
    formError.value = 'La note doit être comprise entre 0 et 10.';
    return;
  }
  submitting.value = true;
  try {
    const payload = buildPayload();
    const saved = isEdit.value
      ? await api.updateAnime(animeId.value, payload)
      : await api.createAnime(payload);
    toast.success(
      isEdit.value ? 'Les modifications sont enregistrées.' : 'L’anime rejoint ta bibliothèque.'
    );
    await router.push(`/anime/${saved.id}`);
  } catch (err) {
    formError.value = err instanceof Error ? err.message : 'Enregistrement impossible.';
  } finally {
    submitting.value = false;
  }
}

onMounted(loadAnime);
</script>

<template>
  <div class="page-wrap max-w-6xl">
    <header class="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <RouterLink
          :to="isEdit ? `/anime/${animeId}` : '/library'"
          class="inline-flex items-center gap-1.5 text-xs font-semibold text-inkFaint transition hover:text-brass"
        >
          <ArrowLeft :size="14" /> Retour
        </RouterLink>
        <p class="eyebrow mt-4">{{ isEdit ? 'Édition' : 'Nouvelle histoire' }}</p>
        <h1 class="display-title mt-2">
          {{ isEdit ? 'Modifier la fiche' : 'Ajouter un anime' }}
        </h1>
        <p class="mt-2 text-sm text-inkSoft">
          {{
            isEdit
              ? 'Ajuste les informations, la progression ou tes impressions.'
              : 'Remplis la fiche manuellement ou laisse la recherche automatique préparer le terrain.'
          }}
        </p>
      </div>
      <BaseButton variant="ghost" size="sm" @click="router.back()">Annuler</BaseButton>
    </header>

    <div
      v-if="loadError"
      class="surface-panel flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center"
    >
      <p class="flex-1 text-sm text-rose">{{ loadError }}</p>
      <BaseButton variant="secondary" @click="loadAnime">Réessayer</BaseButton>
    </div>

    <div v-else-if="loading" class="space-y-5">
      <SkeletonBlock class="h-40 rounded-4xl" />
      <SkeletonBlock class="h-96 rounded-4xl" />
    </div>

    <form v-else class="space-y-5" novalidate @submit.prevent="submit">
      <section v-if="!isEdit" class="surface-panel p-5 sm:p-6">
        <div class="flex items-center gap-2">
          <Sparkles :size="16" class="text-brass" aria-hidden="true" />
          <div>
            <h2 class="font-display text-lg font-semibold text-ink">Recherche automatique</h2>
            <p class="text-xs text-inkSoft">Jikan / MyAnimeList, avec relais AniList.</p>
          </div>
        </div>

        <div class="relative mt-4">
          <label for="external-search" class="sr-only">Rechercher un anime en ligne</label>
          <Search
            :size="16"
            class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-inkFaint"
            aria-hidden="true"
          />
          <input
            id="external-search"
            v-model="searchQuery"
            type="search"
            class="input-base rounded-full pl-10 pr-12"
            placeholder="Tape le titre d’un anime…"
            autocomplete="off"
            @keydown.enter.prevent="doSearch(searchQuery)"
          />
          <button
            type="button"
            class="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-brass text-[#1b1408] transition hover:brightness-105"
            aria-label="Lancer la recherche en ligne"
            @click="doSearch(searchQuery)"
          >
            <Loader2 v-if="searchLoading" :size="15" class="animate-spin" />
            <Search v-else :size="15" />
          </button>
        </div>

        <p v-if="searchMessage" class="mt-2 text-xs text-inkSoft">{{ searchMessage }}</p>

        <div
          v-if="results.length"
          class="mt-4 grid max-h-80 grid-cols-2 gap-3 overflow-y-auto pr-1 sm:grid-cols-4"
        >
          <button
            v-for="item in results"
            :key="item.id"
            type="button"
            class="surface-flat overflow-hidden text-left transition hover:-translate-y-0.5 hover:border-brass/30"
            @click="applyExternal(item)"
          >
            <div class="aspect-[2/3]">
              <AnimePoster :image="item.image" :title="item.title" />
            </div>
            <div class="p-2.5">
              <p class="line-clamp-2 text-xs font-semibold text-ink">{{ item.title }}</p>
              <p class="mt-1 text-[10px] text-inkFaint">
                {{ item.source }} · {{ item.episodesTotal || '?' }} ép.
              </p>
            </div>
          </button>
        </div>
      </section>

      <div class="grid gap-5 lg:grid-cols-[280px_1fr]">
        <section class="surface-panel h-fit p-5">
          <p class="eyebrow">Affiche</p>
          <div class="poster-frame mt-3 aspect-[2/3]">
            <AnimePoster :image="form.image" :title="form.title || 'Nouvel anime'" />
            <div
              v-if="uploading"
              class="absolute inset-0 z-10 flex items-center justify-center bg-canvas/70 backdrop-blur-sm"
            >
              <Loader2 :size="24" class="animate-spin text-brass" />
            </div>
          </div>

          <label
            class="btn-base btn-secondary mt-3 w-full cursor-pointer"
            :class="uploading && 'pointer-events-none opacity-60'"
          >
            <Upload :size="15" />
            {{ uploading ? 'Téléversement…' : 'Téléverser une image' }}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              class="sr-only"
              @change="onFileChange"
            />
          </label>
          <p class="mt-2 text-center text-[10px] text-inkFaint">JPEG, PNG, WebP ou GIF · 5 Mo max.</p>

          <div class="mt-4">
            <label for="image-url" class="field-label">URL de l’affiche</label>
            <input
              id="image-url"
              v-model="form.image"
              type="url"
              class="input-base text-xs"
              placeholder="https://…"
            />
          </div>

          <div class="mt-4 flex items-start gap-2 rounded-2xl border border-brass/15 bg-brass/5 p-3">
            <ImagePlus :size="15" class="mt-0.5 shrink-0 text-brass" aria-hidden="true" />
            <p class="text-[10px] leading-relaxed text-inkSoft">
              Les images distantes restent liées à leur source. Les fichiers téléversés sont
              stockés sur ton serveur.
            </p>
          </div>
        </section>

        <div class="space-y-5">
          <section class="surface-panel p-5 sm:p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="eyebrow">Identité</p>
                <h2 class="section-heading mt-1">L’histoire</h2>
              </div>
              <span class="text-[10px] text-inkFaint">* champ obligatoire</span>
            </div>

            <div class="mt-5 grid gap-4 sm:grid-cols-2">
              <div class="sm:col-span-2">
                <label for="title" class="field-label">Titre *</label>
                <input
                  id="title"
                  v-model="form.title"
                  type="text"
                  class="input-base"
                  required
                  maxlength="255"
                  placeholder="One Piece"
                />
              </div>
              <div>
                <label for="title-japanese" class="field-label">Titre japonais</label>
                <input
                  id="title-japanese"
                  v-model="form.titleJapanese"
                  type="text"
                  class="input-base"
                  maxlength="255"
                  placeholder="ワンピース"
                />
              </div>
              <div>
                <label for="author" class="field-label">Auteur / mangaka</label>
                <input
                  id="author"
                  v-model="form.author"
                  type="text"
                  class="input-base"
                  maxlength="255"
                  placeholder="Eiichirō Oda"
                />
              </div>
              <div class="sm:col-span-2">
                <label for="synopsis" class="field-label">Synopsis</label>
                <textarea
                  id="synopsis"
                  v-model="form.synopsis"
                  rows="5"
                  class="textarea-base"
                  placeholder="Résumé de l’histoire…"
                />
              </div>
              <div>
                <label for="genres" class="field-label">Genres</label>
                <input
                  id="genres"
                  v-model="genresText"
                  type="text"
                  class="input-base"
                  placeholder="Action, Aventure"
                />
                <p class="mt-1.5 text-[10px] text-inkFaint">Séparés par des virgules.</p>
              </div>
              <div>
                <label for="studios" class="field-label">Studios</label>
                <input
                  id="studios"
                  v-model="studiosText"
                  type="text"
                  class="input-base"
                  placeholder="Toei Animation"
                />
              </div>
              <div>
                <label for="tags" class="field-label">Tags personnels</label>
                <input
                  id="tags"
                  v-model="tagsText"
                  type="text"
                  class="input-base"
                  placeholder="Chef-d’œuvre, À revoir"
                />
              </div>
              <div>
                <label for="collections" class="field-label">Collections</label>
                <input
                  id="collections"
                  v-model="collectionsText"
                  type="text"
                  class="input-base"
                  placeholder="Shōnen, Été 2024"
                />
              </div>
            </div>
          </section>

          <section class="surface-panel p-5 sm:p-6">
            <p class="eyebrow">Suivi</p>
            <h2 class="section-heading mt-1">Progression & diffusion</h2>

            <div class="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label for="episodes-total" class="field-label">Épisodes total</label>
                <input
                  id="episodes-total"
                  v-model.number="form.episodesTotal"
                  type="number"
                  min="0"
                  max="10000"
                  class="input-base"
                />
              </div>
              <div>
                <label for="episodes-watched" class="field-label">Épisodes vus</label>
                <input
                  id="episodes-watched"
                  v-model.number="form.episodesWatched"
                  type="number"
                  min="0"
                  max="10000"
                  class="input-base"
                />
              </div>
              <div>
                <label for="duration" class="field-label">Durée / épisode</label>
                <input
                  id="duration"
                  v-model.number="form.episodeDuration"
                  type="number"
                  min="1"
                  max="600"
                  class="input-base"
                />
              </div>
              <div>
                <label for="season" class="field-label">Saison</label>
                <input
                  id="season"
                  v-model="form.season"
                  type="text"
                  maxlength="50"
                  class="input-base"
                  placeholder="Automne 2024"
                />
              </div>
              <div>
                <label for="release-date" class="field-label">Date de sortie</label>
                <input
                  id="release-date"
                  v-model="form.releaseDate"
                  type="date"
                  class="input-base"
                />
              </div>
              <div>
                <label for="finished-date" class="field-label">Date de fin</label>
                <input
                  id="finished-date"
                  v-model="form.dateFinished"
                  type="date"
                  class="input-base"
                  :disabled="form.status !== 'termine'"
                />
                <p class="mt-1.5 text-[10px] text-inkFaint">
                  Automatique quand le statut passe à terminé.
                </p>
              </div>
              <BaseSelect
                v-model="form.status"
                :options="STATUS_OPTIONS.map((item) => ({ value: item.value, label: item.label }))"
                label="Statut"
                class="lg:col-span-1"
              />
              <BaseSelect
                v-model="form.priority"
                :options="PRIORITY_OPTIONS.map((item) => ({ value: item.value, label: item.label }))"
                label="Priorité"
              />
            </div>
          </section>

          <section class="surface-panel p-5 sm:p-6">
            <p class="eyebrow">Carnet personnel</p>
            <h2 class="section-heading mt-1">Note, plateforme & liens</h2>

            <div class="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label for="rating" class="field-label">Note / 10</label>
                <input
                  id="rating"
                  v-model.number="form.rating"
                  type="number"
                  min="0"
                  max="10"
                  step="0.5"
                  class="input-base"
                  placeholder="—"
                />
              </div>
              <BaseSelect
                v-model="form.platform"
                :options="PLATFORM_OPTIONS.map((item) => ({ value: item, label: item }))"
                label="Plateforme"
              />
              <BaseSelect
                v-model="form.language"
                :options="LANGUAGE_OPTIONS"
                label="Langue"
              />
              <div>
                <label for="mal-link" class="field-label">Lien MyAnimeList</label>
                <input
                  id="mal-link"
                  v-model="form.malLink"
                  type="url"
                  class="input-base"
                  placeholder="https://myanimelist.net/…"
                />
              </div>
              <div class="sm:col-span-2">
                <label for="anilist-link" class="field-label">Lien AniList</label>
                <input
                  id="anilist-link"
                  v-model="form.aniListLink"
                  type="url"
                  class="input-base"
                  placeholder="https://anilist.co/anime/…"
                />
              </div>
              <div class="sm:col-span-2 lg:col-span-4">
                <label for="comment" class="field-label">Commentaire personnel</label>
                <textarea
                  id="comment"
                  v-model="form.comment"
                  rows="4"
                  class="textarea-base"
                  placeholder="Ce que tu as aimé, ce qu’il faut retenir…"
                />
              </div>
            </div>

            <div v-if="form.malLink || form.aniListLink" class="mt-3 flex flex-wrap gap-3">
              <a
                v-if="form.malLink"
                :href="form.malLink"
                target="_blank"
                rel="noreferrer"
                class="inline-flex items-center gap-1 text-[11px] font-semibold text-brass hover:underline"
              >
                <ExternalLink :size="11" /> Vérifier le lien MyAnimeList
              </a>
              <a
                v-if="form.aniListLink"
                :href="form.aniListLink"
                target="_blank"
                rel="noreferrer"
                class="inline-flex items-center gap-1 text-[11px] font-semibold text-brass hover:underline"
              >
                <ExternalLink :size="11" /> Vérifier le lien AniList
              </a>
            </div>
          </section>
        </div>
      </div>

      <div
        v-if="formError"
        class="rounded-2xl border border-rose/25 bg-rose/8 px-4 py-3 text-sm text-rose"
        role="alert"
      >
        {{ formError }}
      </div>

      <div class="sticky bottom-0 z-20 -mx-4 border-t border-line/10 bg-canvas/85 px-4 py-3 backdrop-blur-xl sm:mx-0 sm:rounded-3xl sm:border">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <p class="text-[11px] text-inkFaint">
            {{ isEdit ? 'Les modifications sont enregistrées dans MySQL.' : 'La fiche sera ajoutée à ta collection.' }}
          </p>
          <div class="flex gap-2">
            <BaseButton type="button" variant="ghost" @click="router.back()">Annuler</BaseButton>
            <BaseButton type="submit" :loading="submitting">
              {{ isEdit ? 'Enregistrer les modifications' : 'Ajouter à ma bibliothèque' }}
            </BaseButton>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>
