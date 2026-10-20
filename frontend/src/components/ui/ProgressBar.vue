<script setup>
import { computed } from 'vue';
import { progressPercent } from '@/utils/format';

const props = defineProps({
  watched: { type: Number, required: true },
  total: { type: Number, required: true },
  label: { type: String, default: undefined },
  size: { type: String, default: 'md' },
});

const percent = computed(() => progressPercent(props.watched, props.total));
</script>

<template>
  <div
    class="progress-track"
    :class="props.size === 'sm' ? 'h-1' : 'h-1.5'"
    role="progressbar"
    :aria-valuenow="Math.round(percent)"
    aria-valuemin="0"
    aria-valuemax="100"
    :aria-label="props.label ?? `Progression : ${props.watched} sur ${props.total || '?'} épisodes`"
  >
    <div class="progress-fill" :style="{ width: `${percent}%` }" />
  </div>
</template>
