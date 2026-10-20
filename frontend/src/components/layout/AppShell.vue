<script setup>
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';
import AppSidebar from './AppSidebar.vue';
import AppHeader from './AppHeader.vue';
import MobileNav from './MobileNav.vue';
import { useSettingsStore } from '@/stores/settings';

const settings = useSettingsStore();
const route = useRoute();

onMounted(() => {
  void settings.fetchSettings();
});
</script>

<template>
  <a
    href="#contenu"
    class="fixed left-4 top-3 z-[200] -translate-y-20 rounded-xl bg-brass px-4 py-2 text-sm font-semibold text-[#1b1408] transition focus:translate-y-0"
  >
    Aller au contenu
  </a>

  <div class="relative flex min-h-screen">
    <AppSidebar />
    <MobileNav />
    <div class="relative z-10 flex min-w-0 flex-1 flex-col">
      <AppHeader />
      <main id="contenu" class="min-h-[calc(100vh-74px)] flex-1" tabindex="-1">
        <RouterView v-slot="{ Component }">
          <Transition name="page" mode="out-in">
            <component :is="Component" :key="route.path" />
          </Transition>
        </RouterView>
      </main>
    </div>
  </div>
</template>

<style scoped>
.page-enter-active,
.page-leave-active {
  transition: opacity 0.22s ease, transform 0.22s ease;
}
.page-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.page-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
