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
import { formatCurrency, formatCompactCurrency } from '~/utils/format'

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
  transactions?: any[]
}>()

const { theme } = useChartTheme()

const chartData = computed(() => {
  const dates = []
  const dataPoints = []
  const today = new Date()

  const dailyTotals: Record<string, number> = {}

  if (props.transactions) {
      props.transactions.forEach(tx => {
          let date;
          if (tx.createdAt?.seconds) {
              date = new Date(tx.createdAt.seconds * 1000)
          } else if (tx.date) {
              date = new Date(tx.date)
          } else {
              return
          }

          if (!isNaN(date.getTime())) {
              const dateStr = date.toISOString().split('T')[0] as string
              dailyTotals[dateStr] = (dailyTotals[dateStr] || 0) + (tx.amount || 0)
          }
      })
  }

  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(today.getDate() - i)
    const dateStr = d.toISOString().split('T')[0] as string
    dates.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))

    const earnings = dailyTotals[dateStr] || 0
    dataPoints.push(earnings)
  }

  const t = theme.value

  return {
    labels: dates,
    datasets: [
      {
        label: 'Earnings',
        backgroundColor: (context: any) => {
          const { ctx, chartArea } = context.chart
          if (!chartArea) return t.successFill

          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
          gradient.addColorStop(0, t.successFill)
          gradient.addColorStop(1, t.successFade)
          return gradient
        },
        borderColor: t.success,
        borderWidth: 2,
        pointBackgroundColor: t.success,
        pointBorderColor: t.surface,
        pointBorderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: t.success,
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
          label: (context: any) => formatCurrency(context.parsed.y)
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
          maxTicksLimit: 5,
          padding: 8,
          callback: (value) => formatCompactCurrency(Number(value))
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
