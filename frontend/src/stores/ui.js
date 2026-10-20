import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useStorage } from '@vueuse/core';

export const useUiStore = defineStore('ui', () => {
  const sidebarCollapsed = useStorage('animevault.sidebar-collapsed', false);
  const mobileNavOpen = ref(false);
  const searchOpen = ref(false);

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value;
  }

  function openMobileNav() {
    mobileNavOpen.value = true;
  }

  function closeMobileNav() {
    mobileNavOpen.value = false;
  }

  function openSearch() {
    searchOpen.value = true;
  }

  function closeSearch() {
    searchOpen.value = false;
  }

  return {
    sidebarCollapsed,
    mobileNavOpen,
    searchOpen,
    toggleSidebar,
    openMobileNav,
    closeMobileNav,
    openSearch,
    closeSearch,
  };
});
