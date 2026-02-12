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

const chartData = computed(() => {
  // Get last 7 days dates
  const dates = []
  const dataPoints = []

  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0] as string
    dates.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))

    // Get view count for this date, default to 0
    const views = props.analytics?.[dateStr]?.views || 0
    dataPoints.push(views)
  }

  return {
    labels: dates,
    datasets: [
      {
        label: 'Profile Views',
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 400);
          gradient.addColorStop(0, 'rgba(255, 107, 53, 0.5)');
          gradient.addColorStop(1, 'rgba(255, 107, 53, 0)');
          return gradient;
        },
        borderColor: '#FF6B35',
        pointBackgroundColor: '#FF6B35',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#FF6B35',
        fill: true,
        tension: 0.4, // Smooth curve
        data: dataPoints
      }
    ]
  }
})

const chartOptions: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      backgroundColor: '#1E1E1E',
      titleColor: '#fff',
      bodyColor: '#ccc',
      borderColor: 'rgba(255,255,255,0.1)',
      borderWidth: 1,
      padding: 10,
      displayColors: false,
      callbacks: {
        label: (context: any) => `${context.parsed.y} Views`
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(255, 255, 255, 0.05)'
      },
      ticks: {
        color: '#888',
        stepSize: 1,
        callback: (value) => Math.floor(Number(value))
      }
    },
    x: {
      grid: {
        display: false
      },
      ticks: {
        color: '#888'
      }
    }
  },
  interaction: {
      intersect: false,
      mode: 'index'
  }
}
</script>

<template>
  <div class="w-full h-[300px]">
    <Line :data="chartData" :options="chartOptions" />
  </div>
</template>
