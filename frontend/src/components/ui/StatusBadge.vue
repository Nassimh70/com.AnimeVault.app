<script setup>
import { computed } from 'vue';
import { STATUS_COLORS, STATUS_LABELS } from '@/constants/anime';
import BaseBadge from './BaseBadge.vue';

const props = defineProps({
  status: { type: String, required: true },
  dot: { type: Boolean, default: false },
});
const color = computed(() => STATUS_COLORS[props.status]);
</script>

<template>
  <BaseBadge :color="color" :dot="dot">
    {{ STATUS_LABELS[status] }}
  </BaseBadge>
</template>
