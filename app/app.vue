<script setup lang="ts">
import { useAuth } from '~/composables/useAuth'

const { initAuth, loading } = useAuth()

onMounted(() => {
  initAuth()
})
</script>
<template>
  <div>
    <div v-if="loading" class="w-full h-screen flex items-center justify-center bg-surface">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
    <template v-else>
      <NuxtPage />
    </template>
    <Toast />
  </div>
</template>
