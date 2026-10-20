<script setup>
import { computed } from 'vue';
import { Line } from 'vue-chartjs';
import { useThemeStore } from '@/stores/theme';
import { chartPalette, tooltipOptions } from '@/utils/charts';
import { formatMonth } from '@/utils/format';
import './chartSetup';

const props = defineProps({
  items: { type: Array, required: true },
});
const theme = useThemeStore();
const palette = computed(() => chartPalette(theme.resolved));

const chartData = computed(() => ({
  labels: props.items.map((item) => formatMonth(item.month)),
  datasets: [
    {
      label: 'Activité',
      data: props.items.map((item) => item.count),
      borderColor: palette.value.brass,
      backgroundColor: theme.resolved === 'dark' ? 'rgba(232, 184, 109, 0.12)' : 'rgba(138, 91, 32, 0.1)',
      pointBackgroundColor: palette.value.brass,
      pointBorderColor: palette.value.brass,
      pointRadius: 3,
      pointHoverRadius: 5,
      borderWidth: 2,
      tension: 0.38,
      fill: true,
    },
  ],
}));

const options = computed(() => {
  const colors = palette.value;
  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 700 },
    plugins: {
      legend: { display: false },
      tooltip: tooltipOptions(colors),
    },
    scales: {
      x: {
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
    <Line
      :data="chartData"
      :options="options"
      role="img"
      :aria-label="`Activité mensuelle : ${items.map((item) => `${formatMonth(item.month)} ${item.count}`).join(', ')}`"
    />
  </div>
</template>
