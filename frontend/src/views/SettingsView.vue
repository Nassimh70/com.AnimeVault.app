<script setup>
import { computed, onMounted, ref } from 'vue';
import {
  Database,
  Download,
  FileJson,
  Monitor,
  Moon,
  Palette,
  ShieldAlert,
  Sun,
  Trash2,
  Upload,
  UserRound,
} from 'lucide-vue-next';
import { api } from '@/services/api';
import { useSettingsStore } from '@/stores/settings';
import { useThemeStore } from '@/stores/theme';
import { useToastStore } from '@/stores/toast';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseCard from '@/components/ui/BaseCard.vue';
import BaseModal from '@/components/ui/BaseModal.vue';
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue';
import { initials } from '@/utils/format';

const settings = useSettingsStore();
const theme = useThemeStore();
const toast = useToastStore();

const name = ref(settings.displayName);
const nameError = ref('');
const importing = ref(false);
const importReport = ref(null);
const fileInput = ref(null);
const clearHistoryOpen = ref(false);
const clearingHistory = ref(false);
const deleteAllOpen = ref(false);
const deleteConfirmation = ref('');
const deletingAll = ref(false);
const totalAnimes = ref(null);

const themes = [
  {
    value: 'dark',
    label: 'Minuit',
    description: 'Le thème historique, profond et feutré.',
    icon: Moon,
  },
  {
    value: 'light',
    label: 'Ivoire',
    description: 'Un papier chaud pour les lectures diurnes.',
    icon: Sun,
  },
  {
    value: 'system',
    label: 'Système',
    description: 'Suit le réglage de ton appareil.',
    icon: Monitor,
  },
];

const canDelete = computed(() => deleteConfirmation.value.trim() === 'SUPPRIMER');

onMounted(async () => {
  if (!settings.loaded) await settings.fetchSettings();
  name.value = settings.displayName;
  try {
    const stats = await api.getStats();
    totalAnimes.value = stats.total;
  } catch {
    totalAnimes.value = null;
  }
});

async function saveName() {
  nameError.value = '';
  if (!name.value.trim()) {
    nameError.value = 'Le nom affiché ne peut pas être vide.';
    return;
  }
  try {
    await settings.updateDisplayName(name.value);
    name.value = settings.displayName;
    toast.success('Nom affiché mis à jour.');
  } catch (err) {
    nameError.value = err instanceof Error ? err.message : 'Enregistrement impossible.';
  }
}

/**
 * Importe un fichier JSON d'animes choisi dans l'input fichier.
 * @param {Event} event Événement de changement.
 * @returns {Promise<void>}
 */
async function handleImport(event) {
  const input = event.target;
  const file = input.files?.[0];
  if (!file) return;
  importing.value = true;
  try {
    const text = await file.text();
    const parsed = JSON.parse(text);
    const animes = Array.isArray(parsed)
      ? parsed
      : parsed && typeof parsed === 'object' && Array.isArray(parsed.animes)
        ? parsed.animes
        : null;
    if (!animes) {
      throw new Error('Le fichier ne contient pas de tableau « animes ».');
    }
    const report = await api.importJSON(animes);
    importReport.value = report;
    toast.success(`${report.imported} anime(s) importé(s) sur ${report.total}.`);
    const stats = await api.getStats();
    totalAnimes.value = stats.total;
  } catch (err) {
    toast.error(err instanceof Error ? err.message : 'Import impossible.');
  } finally {
    importing.value = false;
    input.value = '';
  }
}

async function clearHistory() {
  clearingHistory.value = true;
  try {
    const result = await api.clearHistory();
    toast.success(`Historique vidé (${result.deleted} entrée(s)).`);
    clearHistoryOpen.value = false;
  } catch (err) {
    toast.error(err instanceof Error ? err.message : 'Impossible de vider l’historique.');
  } finally {
    clearingHistory.value = false;
  }
}

async function deleteAll() {
  if (!canDelete.value) return;
  deletingAll.value = true;
  try {
    const result = await api.deleteAllAnimes();
    totalAnimes.value = 0;
    toast.success(`Bibliothèque vidée (${result.deleted} anime(s) supprimé(s)).`);
    deleteAllOpen.value = false;
    deleteConfirmation.value = '';
  } catch (err) {
    toast.error(err instanceof Error ? err.message : 'Impossible de vider la bibliothèque.');
  } finally {
    deletingAll.value = false;
  }
}
</script>

<template>
  <div class="page-wrap max-w-4xl space-y-6">
    <header>
      <p class="eyebrow">Préférences</p>
      <h1 class="display-title mt-2">Paramètres</h1>
      <p class="mt-2 text-sm text-inkSoft">
        Personnalise ton espace et garde la main sur tes données.
      </p>
    </header>

    <BaseCard>
      <div class="flex items-center gap-2">
        <UserRound :size="16" class="text-brass" aria-hidden="true" />
        <div>
          <p class="eyebrow">Profil</p>
          <h2 class="section-heading mt-1">Comment veux-tu être accueilli ?</h2>
        </div>
      </div>

      <div class="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center">
        <span
          class="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brass to-brassStrong font-display text-xl font-bold text-[#1b1408] shadow-glow"
          aria-hidden="true"
        >
          {{ initials(name || settings.displayName) }}
        </span>
        <div class="min-w-0 flex-1">
          <label for="display-name" class="field-label">Nom affiché</label>
          <div class="flex flex-col gap-2 sm:flex-row">
            <input
              id="display-name"
              v-model="name"
              type="text"
              maxlength="40"
              class="input-base"
              placeholder="Ton prénom"
              @keydown.enter.prevent="saveName"
            />
            <BaseButton :loading="settings.saving" @click="saveName">Enregistrer</BaseButton>
          </div>
          <p v-if="nameError" class="mt-2 text-xs text-rose" role="alert">{{ nameError }}</p>
          <p v-else class="mt-1.5 text-[10px] text-inkFaint">
            Ce nom apparaît dans l’en-tête et sur le tableau de bord.
          </p>
        </div>
      </div>
    </BaseCard>

    <BaseCard>
      <div class="flex items-center gap-2">
        <Palette :size="16" class="text-brass" aria-hidden="true" />
        <div>
          <p class="eyebrow">Apparence</p>
          <h2 class="section-heading mt-1">Choisir une ambiance</h2>
        </div>
      </div>

      <div class="mt-5 grid gap-3 sm:grid-cols-3">
        <button
          v-for="option in themes"
          :key="option.value"
          type="button"
          class="relative overflow-hidden rounded-3xl border p-4 text-left transition duration-200"
          :class="
            theme.mode === option.value
              ? 'border-brass/45 bg-brass/8 shadow-glow'
              : 'border-line/12 bg-surfaceMuted/35 hover:border-brass/25'
          "
          :aria-pressed="theme.mode === option.value"
          @click="theme.setMode(option.value)"
        >
          <span
            class="flex h-9 w-9 items-center justify-center rounded-xl border border-line/10 bg-surface/60 text-brass"
          >
            <component :is="option.icon" :size="16" />
          </span>
          <span class="mt-3 block text-sm font-semibold text-ink">{{ option.label }}</span>
          <span class="mt-1 block text-[10px] leading-relaxed text-inkSoft">
            {{ option.description }}
          </span>
          <span
            v-if="theme.mode === option.value"
            class="absolute right-3 top-3 h-2 w-2 rounded-full bg-brass shadow-[0_0_10px_rgb(var(--color-brass))]"
            aria-hidden="true"
          />
        </button>
      </div>

      <label
        class="mt-5 flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-line/10 bg-surfaceMuted/35 p-4"
      >
        <span>
          <span class="block text-sm font-medium text-ink">Réduire les animations</span>
          <span class="mt-0.5 block text-[10px] text-inkSoft">
            Limite les transitions et les effets de mouvement.
          </span>
        </span>
        <input
          type="checkbox"
          class="peer sr-only"
          :checked="theme.reducedMotion"
          @change="theme.setReducedMotion($event.target.checked)"
        />
        <span
          class="relative h-6 w-11 shrink-0 rounded-full bg-line/15 transition peer-checked:bg-brass after:absolute after:left-1 after:top-1 after:h-4 after:w-4 after:rounded-full after:bg-ink after:transition peer-checked:after:translate-x-5 peer-checked:after:bg-[#1b1408]"
          aria-hidden="true"
        />
      </label>
    </BaseCard>

    <BaseCard>
      <div class="flex items-center gap-2">
        <Database :size="16" class="text-brass" aria-hidden="true" />
        <div>
          <p class="eyebrow">Données</p>
          <h2 class="section-heading mt-1">Sauvegarde & portabilité</h2>
        </div>
      </div>

      <p class="muted-copy mt-3">
        Ta bibliothèque est stockée dans MySQL.
        <span v-if="totalAnimes !== null" class="text-ink">
          {{ totalAnimes }} anime(s) actuellement enregistré(s).
        </span>
        Exporte régulièrement une copie pour ne rien perdre.
      </p>

      <div class="mt-5 flex flex-wrap gap-2.5">
        <BaseButton variant="secondary" :href="api.exportJsonUrl" download>
          <template #icon><FileJson :size="15" /></template>
          Exporter en JSON
        </BaseButton>
        <BaseButton variant="secondary" :href="api.exportCsvUrl" download>
          <template #icon><Download :size="15" /></template>
          Exporter en CSV
        </BaseButton>
        <BaseButton
          variant="outline"
          :loading="importing"
          @click="fileInput?.click()"
        >
          <template #icon><Upload :size="15" /></template>
          Importer un JSON
        </BaseButton>
        <input
          ref="fileInput"
          type="file"
          accept="application/json,.json"
          class="sr-only"
          @change="handleImport"
        />
      </div>

      <div class="mt-4 grid gap-3 sm:grid-cols-2">
        <div class="rounded-2xl border border-line/10 bg-surfaceMuted/30 p-4">
          <p class="text-xs font-semibold text-ink">Format d’import</p>
          <p class="mt-1 text-[10px] leading-relaxed text-inkSoft">
            Un export Anime Vault complet, ou un tableau d’animes. Les doublons titre + date de
            sortie sont ignorés.
          </p>
        </div>
        <div class="rounded-2xl border border-line/10 bg-surfaceMuted/30 p-4">
          <p class="text-xs font-semibold text-ink">Sécurité</p>
          <p class="mt-1 text-[10px] leading-relaxed text-inkSoft">
            Aucun fichier n’est envoyé à un service tiers : l’import reste sur ton serveur local.
          </p>
        </div>
      </div>
    </BaseCard>

    <BaseCard class="!border-rose/20">
      <div class="flex items-center gap-2 text-rose">
        <ShieldAlert :size="16" aria-hidden="true" />
        <div>
          <p class="eyebrow !text-rose/75">Zone sensible</p>
          <h2 class="section-heading mt-1">Effacer des données</h2>
        </div>
      </div>

      <div class="mt-5 divide-y divide-line/10">
        <div class="flex flex-col gap-3 pb-4 sm:flex-row sm:items-center">
          <div class="flex-1">
            <p class="text-sm font-medium text-ink">Vider l’historique</p>
            <p class="mt-0.5 text-[11px] leading-relaxed text-inkSoft">
              Supprime toutes les entrées du journal d’activité. Les animes restent intacts.
            </p>
          </div>
          <BaseButton variant="secondary" size="sm" @click="clearHistoryOpen = true">
            <template #icon><Trash2 :size="14" /></template>
            Vider l’historique
          </BaseButton>
        </div>
        <div class="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center">
          <div class="flex-1">
            <p class="text-sm font-medium text-ink">Supprimer toute la bibliothèque</p>
            <p class="mt-0.5 text-[11px] leading-relaxed text-inkSoft">
              Retire tous les animes, leurs relations et leurs images locales. Cette action est
              irréversible.
            </p>
          </div>
          <BaseButton variant="danger" size="sm" @click="deleteAllOpen = true">
            <template #icon><Trash2 :size="14" /></template>
            Tout supprimer
          </BaseButton>
        </div>
      </div>
    </BaseCard>

    <ConfirmDialog
      :open="clearHistoryOpen"
      title="Vider tout l’historique ?"
      message="Les entrées du journal seront définitivement supprimées. Les fiches animes et ta progression resteront en place."
      confirm-label="Vider l’historique"
      :loading="clearingHistory"
      @confirm="clearHistory"
      @cancel="clearHistoryOpen = false"
    />

    <BaseModal
      :open="deleteAllOpen"
      title="Supprimer toute la bibliothèque ?"
      description="Tous les animes seront retirés. Exporte d’abord une sauvegarde si tu veux pouvoir revenir en arrière."
      size="sm"
      @close="
        deleteAllOpen = false;
        deleteConfirmation = '';
      "
    >
      <label for="delete-confirmation" class="field-label">
        Tape <span class="text-rose">SUPPRIMER</span> pour confirmer
      </label>
      <input
        id="delete-confirmation"
        v-model="deleteConfirmation"
        type="text"
        class="input-base"
        autocomplete="off"
        placeholder="SUPPRIMER"
      />
      <template #footer>
        <BaseButton
          variant="ghost"
          :disabled="deletingAll"
          @click="
            deleteAllOpen = false;
            deleteConfirmation = '';
          "
        >
          Annuler
        </BaseButton>
        <BaseButton
          variant="danger"
          :disabled="!canDelete"
          :loading="deletingAll"
          @click="deleteAll"
        >
          Supprimer définitivement
        </BaseButton>
      </template>
    </BaseModal>

    <BaseModal
      :open="Boolean(importReport)"
      title="Rapport d’import"
      :description="
        importReport
          ? `${importReport.imported} anime(s) importé(s), ${importReport.skipped} ignoré(s) sur ${importReport.total}.`
          : ''
      "
      size="md"
      @close="importReport = null"
    >
      <div v-if="importReport && importReport.errors.length" class="max-h-64 space-y-2 overflow-y-auto">
        <p class="text-xs font-semibold uppercase tracking-[0.14em] text-inkFaint">
          Entrées ignorées
        </p>
        <p
          v-for="error in importReport.errors"
          :key="error.index"
          class="rounded-xl border border-line/10 bg-surfaceMuted/35 px-3 py-2 text-xs text-inkSoft"
        >
          <span class="font-semibold text-ink">#{{ error.index + 1 }}</span> — {{ error.message }}
        </p>
      </div>
      <p v-else class="text-sm text-inkSoft">Toutes les entrées ont été importées.</p>
      <template #footer>
        <BaseButton variant="secondary" @click="importReport = null">Fermer</BaseButton>
      </template>
    </BaseModal>
  </div>
</template>
