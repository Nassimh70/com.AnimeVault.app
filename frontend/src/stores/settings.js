import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from '@/services/api';

export const useSettingsStore = defineStore('settings', () => {
  const displayName = ref('Nassim');
  const loaded = ref(false);
  const loading = ref(false);
  const saving = ref(false);
  const error = ref(null);

  /**
   * @param {boolean} [force]
   */
  async function fetchSettings(force = false) {
    if (loading.value || (loaded.value && !force)) return;
    loading.value = true;
    error.value = null;
    try {
      const settings = await api.getSettings();
      displayName.value = settings.displayName || 'Nassim';
      loaded.value = true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Réglages indisponibles.';
    } finally {
      loading.value = false;
    }
  }

  /**
   * @param {string} name
   */
  async function updateDisplayName(name) {
    saving.value = true;
    error.value = null;
    try {
      const settings = await api.updateSettings(name.trim());
      displayName.value = settings.displayName;
      loaded.value = true;
      return settings;
    } finally {
      saving.value = false;
    }
  }

  return { displayName, loaded, loading, saving, error, fetchSettings, updateDisplayName };
});
