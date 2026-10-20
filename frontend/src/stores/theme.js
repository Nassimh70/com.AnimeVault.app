import { defineStore } from 'pinia';
import { computed, watch } from 'vue';
import { usePreferredDark, useStorage } from '@vueuse/core';

const THEME_COLORS = { dark: '#090c14', light: '#f6f2e9' };

export const useThemeStore = defineStore('theme', () => {
  const mode = useStorage('animevault.theme', 'system');
  const reducedMotion = useStorage('animevault.reduced-motion', false);
  const prefersDark = usePreferredDark();

  const resolved = computed(() => {
    if (mode.value === 'system') return prefersDark.value ? 'dark' : 'light';
    return mode.value;
  });

  watch(
    [resolved, reducedMotion],
    ([theme, reduced]) => {
      if (typeof document === 'undefined') return;
      const root = document.documentElement;
      root.dataset.theme = theme;
      root.classList.toggle('dark', theme === 'dark');
      root.dataset.reducedMotion = String(reduced);
      document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute('content', THEME_COLORS[theme]);
    },
    { immediate: true }
  );

  /**
   * @param {import('@/types/anime').ThemeMode} next
   */
  function setMode(next) {
    mode.value = next;
  }

  /**
   * @param {boolean} next
   */
  function setReducedMotion(next) {
    reducedMotion.value = next;
  }

  return { mode, resolved, reducedMotion, setMode, setReducedMotion };
});
