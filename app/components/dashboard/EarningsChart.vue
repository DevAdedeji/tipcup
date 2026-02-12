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
import { formatCurrency } from '~/utils/format'

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

const chartData = computed(() => {
  // Get last 7 days dates
  const dates = []
  const dataPoints = []
  const today = new Date()

  // Prepare a map of date strings to total amounts
  const dailyTotals: Record<string, number> = {}

  if (props.transactions) {
      props.transactions.forEach(tx => {
          // Assuming tx.createdAt is a Firestore timestamp or date string
          let date;
          if (tx.createdAt?.seconds) {
              date = new Date(tx.createdAt.seconds * 1000)
          } else if (tx.date) {
               // Try to parse 'MM/DD/YYYY' or similar
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

    // Get earnings for this date, default to 0
    const earnings = dailyTotals[dateStr] || 0
    dataPoints.push(earnings)
  }

  return {
    labels: dates,
    datasets: [
      {
        label: 'Earnings',
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 400);
          gradient.addColorStop(0, 'rgba(34, 197, 94, 0.5)');
          gradient.addColorStop(1, 'rgba(34, 197, 94, 0)');
          return gradient;
        },
        borderColor: '#22c55e',
        pointBackgroundColor: '#22c55e',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#22c55e',
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
        label: (context: any) => formatCurrency(context.parsed.y)
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
        maxTicksLimit: 5,
        callback: (value) => {
            const val = Number(value)
            if (val >= 1000) return '₦' + (val/1000).toFixed(1) + 'k'
            return '₦' + val
        }
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
