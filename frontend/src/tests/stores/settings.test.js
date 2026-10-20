import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { api } from '@/services/api';
import { useSettingsStore } from '@/stores/settings';

beforeEach(() => {
  setActivePinia(createPinia());
  vi.restoreAllMocks();
});

describe('store de réglages', () => {
  it('charge le profil une seule fois sauf demande explicite', async () => {
    const getSettings = vi.spyOn(api, 'getSettings').mockResolvedValue({ displayName: 'Camille' });
    const settings = useSettingsStore();

    await settings.fetchSettings();
    await settings.fetchSettings();
    expect(getSettings).toHaveBeenCalledTimes(1);
    expect(settings.displayName).toBe('Camille');
    expect(settings.loaded).toBe(true);

    await settings.fetchSettings(true);
    expect(getSettings).toHaveBeenCalledTimes(2);
  });

  it('met à jour le nom affiché', async () => {
    vi.spyOn(api, 'updateSettings').mockResolvedValue({ displayName: 'Nassim' });
    const settings = useSettingsStore();

    await settings.updateDisplayName('  Nassim  ');
    expect(api.updateSettings).toHaveBeenCalledWith('Nassim');
    expect(settings.displayName).toBe('Nassim');
    expect(settings.saving).toBe(false);
  });

  it('conserve le nom par défaut en cas d’échec', async () => {
    vi.spyOn(api, 'getSettings').mockRejectedValue(new Error('Base inaccessible'));
    const settings = useSettingsStore();

    await settings.fetchSettings();
    expect(settings.error).toBe('Base inaccessible');
    expect(settings.displayName).toBe('Nassim');
    expect(settings.loaded).toBe(false);
  });
});
