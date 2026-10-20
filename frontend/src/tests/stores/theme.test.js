import { beforeEach, describe, expect, it } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { nextTick } from 'vue';
import { useThemeStore } from '@/stores/theme';

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute('data-theme');
  document.documentElement.removeAttribute('data-reduced-motion');
  setActivePinia(createPinia());
});

describe('store de thème', () => {
  it('suit le système quand le mode est « system »', async () => {
    const theme = useThemeStore();
    await nextTick();
    expect(theme.mode).toBe('system');
    expect(theme.resolved).toBe('light');
    expect(document.documentElement.dataset.theme).toBe('light');
  });

  it('applique et persiste le thème sombre', async () => {
    const theme = useThemeStore();
    theme.setMode('dark');
    await nextTick();

    expect(theme.resolved).toBe('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('animevault.theme')).toBe('dark');
  });

  it('applique le thème clair et l’option animations réduites', async () => {
    const theme = useThemeStore();
    theme.setMode('light');
    theme.setReducedMotion(true);
    await nextTick();

    expect(document.documentElement.dataset.theme).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(document.documentElement.dataset.reducedMotion).toBe('true');
  });
});
