<script setup>
import { computed } from 'vue';
import { Bar } from 'vue-chartjs';
import { useThemeStore } from '@/stores/theme';
import { chartPalette, tooltipOptions } from '@/utils/charts';
import './chartSetup';

const props = defineProps({
  items: { type: Array, required: true },
});
const theme = useThemeStore();
const palette = computed(() => chartPalette(theme.resolved));

const chartData = computed(() => ({
  labels: props.items.map((item) => `${item.rating}`),
  datasets: [
    {
      label: 'Animes notés',
      data: props.items.map((item) => item.count),
      backgroundColor: palette.value.jade,
      borderRadius: 7,
      maxBarThickness: 32,
    },
  ],
}));

const options = computed(() => {
  const colors = palette.value;
  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 650 },
    plugins: {
      legend: { display: false },
      tooltip: tooltipOptions(colors),
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Note sur 10',
          color: colors.muted,
          font: { family: 'Outfit Variable', size: 11 },
        },
        ticks: { color: colors.muted, font: { family: 'Outfit Variable', size: 11 } },
        grid: { display: false },
        border: { display: false },
      },
      y: {
        beginAtZero: true,
        ticks: { color: colors.muted, precision: 0, font: { family: 'Outfit Variable', size: 11 } },
        grid: { color: colors.grid, drawTicks: false },
        border: { display: false },
      },
    },
  };
});
</script>

<template>
  <div class="h-[260px] w-full">
    <Bar
      :data="chartData"
      :options="options"
      role="img"
      :aria-label="`Répartition des notes : ${items.map((item) => `${item.rating} sur 10 : ${item.count}`).join(', ')}`"
    />
  </div>
</template>
