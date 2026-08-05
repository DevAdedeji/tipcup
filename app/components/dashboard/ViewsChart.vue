<script setup lang="ts">
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  type ChartOptions
} from 'chart.js'
import { Line } from 'vue-chartjs'
import { computed } from 'vue'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const props = defineProps<{
  analytics?: Record<string, { views: number }>
}>()

const { theme } = useChartTheme()

const chartData = computed(() => {
  const dates: string[] = []
  const dataPoints: number[] = []

  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0] as string
    dates.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))

    dataPoints.push(props.analytics?.[dateStr]?.views || 0)
  }

  const t = theme.value

  return {
    labels: dates,
    datasets: [
      {
        label: 'Profile views',
        backgroundColor: (context: any) => {
          const { ctx, chartArea } = context.chart
          if (!chartArea) return t.accentFill

          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
          gradient.addColorStop(0, t.accentFill)
          gradient.addColorStop(1, t.accentFade)
          return gradient
        },
        borderColor: t.accent,
        borderWidth: 2,
        pointBackgroundColor: t.accent,
        pointBorderColor: t.surface,
        pointBorderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: t.accent,
        pointHoverBorderColor: t.surface,
        fill: true,
        tension: 0.4,
        data: dataPoints
      }
    ]
  }
})

const chartOptions = computed<ChartOptions<'line'>>(() => {
  const t = theme.value

  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: t.tooltipBg,
        titleColor: t.tooltipText,
        bodyColor: t.tooltipText,
        borderColor: t.border,
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: (context: any) => `${context.parsed.y} views`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        border: { display: false },
        grid: { color: t.grid },
        ticks: {
          color: t.tick,
          stepSize: 1,
          padding: 8,
          callback: (value) => Math.floor(Number(value))
        }
      },
      x: {
        border: { display: false },
        grid: { display: false },
        ticks: { color: t.tick, padding: 8 }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  }
})
</script>

<template>
  <div class="h-[280px] w-full">
    <Line :data="chartData" :options="chartOptions" />
  </div>
</template>
