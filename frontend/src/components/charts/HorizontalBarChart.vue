<script setup>
import { computed } from 'vue';
import { Bar } from 'vue-chartjs';
import { useThemeStore } from '@/stores/theme';
import { chartPalette, tooltipOptions } from '@/utils/charts';
import './chartSetup';

const props = defineProps({
  items: { type: Array, required: true },
  color: { type: String, default: '#e8b86d' },
  label: { type: String, required: true },
});

const theme = useThemeStore();
const palette = computed(() => chartPalette(theme.resolved));
const height = computed(() => `${Math.max(240, props.items.length * 38)}px`);

const chartData = computed(() => ({
  labels: props.items.map((item) => item.name),
  datasets: [
    {
      label: props.label,
      data: props.items.map((item) => item.value),
      backgroundColor: props.color,
      hoverBackgroundColor: props.color,
      borderRadius: 8,
      maxBarThickness: 18,
    },
  ],
}));

const options = computed(() => {
  const colors = palette.value;
  return {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    animation: { duration: 650 },
    plugins: {
      legend: { display: false },
      tooltip: tooltipOptions(colors),
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: { color: colors.muted, precision: 0, font: { family: 'Outfit Variable', size: 11 } },
        grid: { color: colors.grid, drawTicks: false },
        border: { display: false },
      },
      y: {
        ticks: {
          color: colors.muted,
          font: { family: 'Outfit Variable', size: 11 },
          autoSkip: false,
        },
        grid: { display: false },
        border: { display: false },
      },
    },
  };
});
</script>

<template>
  <div :style="{ height }" class="w-full">
    <Bar
      :data="chartData"
      :options="options"
      role="img"
      :aria-label="`${label} : ${items.map((item) => `${item.name} ${item.value}`).join(', ')}`"
    />
  </div>
</template>
