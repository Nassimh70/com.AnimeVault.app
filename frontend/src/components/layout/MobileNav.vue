<script setup>
import { nextTick, ref, watch } from 'vue';
import { X } from 'lucide-vue-next';
import { useEventListener } from '@vueuse/core';
import NavigationLinks from './NavigationLinks.vue';
import { useUiStore } from '@/stores/ui';

const ui = useUiStore();
const panel = ref(null);
let previousOverflow = '';

watch(
  () => ui.mobileNavOpen,
  async (open) => {
    if (typeof document === 'undefined') return;
    if (open) {
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      await nextTick();
      panel.value?.querySelector('button, a')?.focus();
    } else {
      document.body.style.overflow = previousOverflow;
    }
  }
);

useEventListener(document, 'keydown', (event) => {
  if (event.key === 'Escape' && ui.mobileNavOpen) ui.closeMobileNav();
});
</script>

<template>
  <Teleport to="body">
    <Transition name="drawer">
      <div
        v-if="ui.mobileNavOpen"
        class="fixed inset-0 z-[105] bg-black/60 backdrop-blur-sm lg:hidden"
        @click.self="ui.closeMobileNav()"
      >
        <aside
          ref="panel"
          class="flex h-full w-[min(88vw,340px)] flex-col border-r border-line/10 bg-canvasSoft p-4 shadow-lift"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation mobile"
        >
          <div class="mb-6 flex items-center justify-between px-2">
            <RouterLink to="/" class="flex items-center gap-3" @click="ui.closeMobileNav()">
              <span class="brand-mark h-9 w-11 text-brass" aria-hidden="true" />
              <span>
                <span class="block font-display text-base font-semibold leading-none text-ink">
                  Anime Vault
                </span>
                <span
                  class="mt-1 block text-[8px] font-semibold uppercase tracking-[0.22em] text-inkFaint"
                >
                  Midnight Library
                </span>
              </span>
            </RouterLink>
            <button
              type="button"
              class="icon-button"
              aria-label="Fermer la navigation"
              @click="ui.closeMobileNav()"
            >
              <X :size="17" />
            </button>
          </div>
          <NavigationLinks @navigate="ui.closeMobileNav()" />
          <p class="mt-auto px-3 pt-6 text-[10px] text-inkFaint">
            Anime Vault · bibliothèque privée
          </p>
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 0.25s ease;
}
.drawer-enter-active aside,
.drawer-leave-active aside {
  transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}
.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}
.drawer-enter-from aside,
.drawer-leave-to aside {
  transform: translateX(-100%);
}
</style>
