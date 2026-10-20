<script setup>
import { computed, ref, watch } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { ChevronDown, Plus, Sparkles } from 'lucide-vue-next';
import { COLLECTION_LINKS, NAV_ITEMS } from '@/constants/anime';
import { cn } from '@/utils/format';

const props = defineProps({
  collapsed: { type: Boolean, default: false },
});
const emit = defineEmits(['navigate']);
const route = useRoute();

const collectionsOpen = ref(route.path === '/library');

watch(
  () => route.path,
  (path) => {
    if (path === '/library') collectionsOpen.value = true;
  }
);

const collectionActive = computed(() => route.path === '/library');

/**
 * @param {string} to
 * @param {boolean} [exact]
 */
function isNavActive(to, exact) {
  if (exact) return route.path === to;
  return route.path === to || route.path.startsWith(`${to}/`);
}

/**
 * @param {string} to
 */
function isCollectionLinkActive(to) {
  const [path, query = ''] = to.split('?');
  if (route.path !== path) return false;
  const expected = new URLSearchParams(query);
  return [...expected.entries()].every(([key, value]) => route.query[key] === value);
}
</script>

<template>
  <div class="flex min-h-0 flex-1 flex-col gap-1">
    <nav aria-label="Navigation principale" class="flex flex-col gap-1">
      <RouterLink
        v-for="item in NAV_ITEMS"
        :key="item.to"
        :to="item.to"
        class="nav-link group"
        :class="
          cn(
            isNavActive(item.to, item.exact) && 'nav-link-active',
            props.collapsed && 'justify-center px-0'
          )
        "
        :aria-current="isNavActive(item.to, item.exact) ? 'page' : undefined"
        :title="props.collapsed ? item.label : undefined"
        @click="emit('navigate')"
      >
        <span
          class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line/10 bg-surfaceMuted/50 text-inkSoft transition group-hover:border-brass/25 group-hover:text-brass"
          :class="isNavActive(item.to, item.exact) && 'border-brass/25 bg-brass/10 text-brass'"
        >
          <component :is="item.icon" :size="16" aria-hidden="true" />
        </span>
        <span v-if="!props.collapsed" class="truncate">{{ item.label }}</span>
      </RouterLink>

      <div class="mt-1">
        <button
          type="button"
          class="nav-link group w-full"
          :class="
            cn(
              collectionActive && 'nav-link-active',
              props.collapsed && 'justify-center px-0'
            )
          "
          :aria-expanded="collectionsOpen"
          :title="props.collapsed ? 'Collections' : undefined"
          @click="collectionsOpen = !collectionsOpen"
        >
          <span
            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line/10 bg-surfaceMuted/50 text-inkSoft transition"
            :class="collectionActive && 'border-brass/25 bg-brass/10 text-brass'"
          >
            <Sparkles :size="16" aria-hidden="true" />
          </span>
          <template v-if="!props.collapsed">
            <span class="flex-1 truncate text-left">Collections</span>
            <ChevronDown
              :size="15"
              class="transition-transform duration-200"
              :class="collectionsOpen && 'rotate-180'"
              aria-hidden="true"
            />
          </template>
        </button>

        <div
          v-if="collectionsOpen && !props.collapsed"
          class="ml-5 mt-2 flex flex-col gap-1 border-l border-line/10 pl-4"
        >
          <RouterLink
            v-for="link in COLLECTION_LINKS"
            :key="link.to"
            :to="link.to"
            class="group flex items-center gap-3 rounded-xl px-2.5 py-2 text-xs font-medium text-inkSoft transition hover:bg-surfaceMuted/55 hover:text-ink"
            :class="isCollectionLinkActive(link.to) && 'bg-brass/10 text-brass'"
            @click="emit('navigate')"
          >
            <component :is="link.icon" :size="14" aria-hidden="true" />
            {{ link.label }}
          </RouterLink>
        </div>
      </div>
    </nav>
  </div>
  <RouterLink
    to="/anime/new"
    class="btn-base btn-primary mt-5"
    :class="props.collapsed && 'aspect-square px-0'"
    :title="props.collapsed ? 'Ajouter un anime' : undefined"
    @click="emit('navigate')"
  >
    <Plus :size="17" aria-hidden="true" />
    <span v-if="!props.collapsed">Ajouter un anime</span>
  </RouterLink>
</template>
