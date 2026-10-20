<script setup>
import { computed } from 'vue';
import { Monitor, Moon, Sun } from 'lucide-vue-next';
import { useThemeStore } from '@/stores/theme';

const theme = useThemeStore();

const order = ['dark', 'light', 'system'];
const labels = {
  dark: 'sombre',
  light: 'clair',
  system: 'système',
};
const icons = { dark: Moon, light: Sun, system: Monitor };

const currentIndex = computed(() => order.indexOf(theme.mode));
const nextMode = computed(() => order[(currentIndex.value + 1) % order.length]);
const icon = computed(() => icons[theme.mode]);

function cycle() {
  theme.setMode(nextMode.value);
}
</script>

<template>
  <button
    type="button"
    class="icon-button"
    :aria-label="`Thème ${labels[theme.mode]}. Passer au thème ${labels[nextMode]}.`"
    :title="`Thème : ${labels[theme.mode]}`"
    @click="cycle"
  >
    <component :is="icon" :size="17" aria-hidden="true" />
  </button>
</template>
