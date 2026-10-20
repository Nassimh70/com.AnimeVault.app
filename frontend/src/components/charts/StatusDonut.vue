<script setup>
import { computed } from 'vue';
import { Doughnut } from 'vue-chartjs';
import { useThemeStore } from '@/stores/theme';
import { chartPalette, tooltipOptions } from '@/utils/charts';
import './chartSetup';

const props = defineProps({
  items: { type: Array, required: true },
});

const theme = useThemeStore();
const palette = computed(() => chartPalette(theme.resolved));

const chartData = computed(() => ({
  labels: props.items.map((item) => item.name),
  datasets: [
    {
      data: props.items.map((item) => item.value),
      backgroundColor: props.items.map((item) => item.color),
      borderWidth: 0,
      hoverOffset: 6,
      spacing: 2,
    },
  ],
}));

const options = computed(() => {
  const colors = palette.value;
  return {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    animation: { duration: 700 },
    plugins: {
      legend: { display: false },
      tooltip: tooltipOptions(colors),
    },
  };
});
</script>

<template>
  <div class="relative h-full min-h-[220px] w-full">
    <Doughnut
      :data="chartData"
      :options="options"
      role="img"
      :aria-label="`Répartition par statut : ${items.map((item) => `${item.name} ${item.value}`).join(', ')}`"
    />
  </div>
</template>
