<script setup>
import { ChevronsLeft, ChevronsRight, Database, Sparkles } from 'lucide-vue-next';
import NavigationLinks from './NavigationLinks.vue';
import { useUiStore } from '@/stores/ui';

const ui = useUiStore();
</script>

<template>
  <aside
    class="sticky top-0 hidden h-screen shrink-0 flex-col border-r border-line/10 bg-canvasSoft/70 px-3 py-5 backdrop-blur-2xl transition-[width] duration-300 ease-vault lg:flex"
    :class="ui.sidebarCollapsed ? 'w-[88px]' : 'w-[276px]'"
  >
    <RouterLink
      to="/"
      class="mb-8 flex items-center gap-3 px-2 text-ink"
      :class="ui.sidebarCollapsed && 'justify-center px-0'"
      aria-label="Anime Vault, retour au tableau de bord"
    >
      <span class="brand-mark h-10 w-12 shrink-0 text-brass" aria-hidden="true" />
      <span v-if="!ui.sidebarCollapsed" class="min-w-0">
        <span class="block font-display text-[17px] font-semibold leading-none tracking-[-0.01em]">
          Anime Vault
        </span>
        <span class="mt-1 block text-[9px] font-semibold uppercase tracking-[0.24em] text-inkFaint">
          Midnight Library
        </span>
      </span>
    </RouterLink>

    <NavigationLinks :collapsed="ui.sidebarCollapsed" />

    <div class="mt-auto space-y-3 pt-5">
      <div
        v-if="!ui.sidebarCollapsed"
        class="rounded-3xl border border-line/10 bg-surface/50 p-4"
      >
        <div class="flex items-center gap-2 text-brass">
          <Database :size="14" aria-hidden="true" />
          <span class="text-[10px] font-semibold uppercase tracking-[0.16em]">Données locales</span>
        </div>
        <p class="mt-2 text-xs leading-relaxed text-inkSoft">
          Ta collection vit sur ton serveur MySQL. Exporte-la régulièrement depuis les paramètres.
        </p>
        <RouterLink
          to="/settings"
          class="mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold text-brass hover:underline"
        >
          <Sparkles :size="12" aria-hidden="true" />
          Gérer mes données
        </RouterLink>
      </div>

      <button
        type="button"
        class="flex w-full items-center gap-2 rounded-2xl border border-line/10 bg-surfaceMuted/35 px-3 py-2.5 text-xs font-medium text-inkSoft transition hover:border-brass/25 hover:text-ink"
        :class="ui.sidebarCollapsed && 'justify-center px-0'"
        :aria-label="ui.sidebarCollapsed ? 'Déplier la navigation' : 'Réduire la navigation'"
        @click="ui.toggleSidebar()"
      >
        <component
          :is="ui.sidebarCollapsed ? ChevronsRight : ChevronsLeft"
          :size="17"
          aria-hidden="true"
        />
        <span v-if="!ui.sidebarCollapsed">Réduire le menu</span>
      </button>
    </div>
  </aside>
</template>
