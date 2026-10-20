<script setup>
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Menu, Plus, Search } from 'lucide-vue-next';
import { useEventListener } from '@vueuse/core';
import ThemeToggle from '@/components/ui/ThemeToggle.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import { useSettingsStore } from '@/stores/settings';
import { useUiStore } from '@/stores/ui';
import { initials } from '@/utils/format';

const router = useRouter();
const route = useRoute();
const ui = useUiStore();
const settings = useSettingsStore();
const search = ref(typeof route.query.search === 'string' ? route.query.search : '');
const searchInput = ref(null);

watch(
  () => route.query.search,
  (value) => {
    search.value = typeof value === 'string' ? value : '';
  }
);

function submitSearch() {
  const query = search.value.trim();
  router.push({ path: '/library', query: query ? { search: query } : {} });
}

useEventListener(document, 'keydown', (event) => {
  if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) return;
  const target = event.target;
  if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
  event.preventDefault();
  searchInput.value?.focus();
});
</script>

<template>
  <header
    class="sticky top-0 z-40 flex h-[74px] items-center gap-3 border-b border-line/10 bg-canvas/70 px-4 backdrop-blur-2xl sm:px-6 lg:px-8"
  >
    <button
      type="button"
      class="icon-button lg:hidden"
      aria-label="Ouvrir la navigation"
      @click="ui.openMobileNav()"
    >
      <Menu :size="18" />
    </button>

    <form class="hidden max-w-md flex-1 md:block" role="search" @submit.prevent="submitSearch">
      <label for="global-search" class="sr-only">Rechercher dans la bibliothèque</label>
      <div class="relative">
        <Search
          :size="16"
          class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-inkFaint"
          aria-hidden="true"
        />
        <input
          id="global-search"
          ref="searchInput"
          v-model="search"
          type="search"
          class="input-base h-11 rounded-full pl-10 pr-16 text-sm"
          placeholder="Rechercher un titre, un studio…"
          autocomplete="off"
        />
        <kbd
          class="pointer-events-none absolute right-4 top-1/2 hidden -translate-y-1/2 rounded-md border border-line/15 px-1.5 py-0.5 text-[10px] font-medium text-inkFaint lg:block"
        >
          /
        </kbd>
      </div>
    </form>

    <div class="ml-auto flex items-center gap-2">
      <RouterLink
        to="/library"
        class="icon-button md:hidden"
        aria-label="Rechercher dans la bibliothèque"
      >
        <Search :size="17" />
      </RouterLink>
      <ThemeToggle />
      <BaseButton to="/anime/new" size="sm" class="hidden sm:inline-flex">
        <template #icon><Plus :size="15" /></template>
        <span class="hidden lg:inline">Ajouter un anime</span>
        <span class="lg:hidden">Ajouter</span>
      </BaseButton>
      <RouterLink
        to="/settings"
        class="flex items-center gap-2 rounded-full border border-line/12 bg-surfaceRaised/55 py-1 pl-1 pr-3 transition hover:border-brass/30"
        :aria-label="`Profil de ${settings.displayName}, ouvrir les paramètres`"
      >
        <span
          class="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brass to-brassStrong text-xs font-bold text-[#1b1408]"
        >
          {{ initials(settings.displayName) }}
        </span>
        <span class="hidden max-w-24 truncate text-xs font-semibold text-ink sm:block">
          {{ settings.displayName }}
        </span>
      </RouterLink>
    </div>
  </header>
</template>
