<script setup lang="ts">
import { Analytics } from '@vercel/analytics/nuxt'

const { init } = useTheme()
onMounted(init)
</script>

<template>
  <div>
    <Analytics />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <Toast />
  </div>
</template>
