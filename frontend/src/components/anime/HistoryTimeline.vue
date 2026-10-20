<script setup>
import { ACTION_ICONS, ACTION_LABELS } from '@/constants/anime';
import { formatRelative } from '@/utils/format';
import EmptyState from '@/components/ui/EmptyState.vue';
import { History } from 'lucide-vue-next';

defineProps({
  entries: { type: Array, required: true },
  compact: { type: Boolean, default: false },
});
</script>

<template>
  <div v-if="entries.length === 0" class="py-2">
    <EmptyState
      compact
      title="Aucune activité"
      subtitle="Les ajouts, progressions et modifications apparaîtront ici."
    >
      <template #icon><History :size="24" /></template>
    </EmptyState>
  </div>
  <ol v-else class="relative space-y-4" :class="compact ? 'text-xs' : 'text-sm'">
    <li
      v-for="entry in entries"
      :key="entry.id"
      class="relative flex gap-3 before:absolute before:left-[15px] before:top-8 before:h-[calc(100%-14px)] before:w-px before:bg-line/10 last:before:hidden"
    >
      <span
        class="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line/12 bg-surfaceMuted/70 text-inkSoft"
        aria-hidden="true"
      >
        <component :is="ACTION_ICONS[entry.action]" :size="13" />
      </span>
      <div class="min-w-0 flex-1 pb-1">
        <div class="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <p class="font-medium text-ink">
            {{ ACTION_LABELS[entry.action] }}
            <span v-if="!compact" class="font-normal text-inkSoft">· {{ entry.animeTitle }}</span>
          </p>
          <time
            :datetime="entry.createdAt"
            class="shrink-0 text-[10px] text-inkFaint"
            :title="entry.createdAt"
          >
            {{ formatRelative(entry.createdAt) }}
          </time>
        </div>
        <p class="mt-0.5 text-[11px] leading-relaxed text-inkSoft">
          <span v-if="compact" class="text-inkFaint">{{ entry.animeTitle }} · </span>
          {{ entry.details }}
        </p>
      </div>
    </li>
  </ol>
</template>
