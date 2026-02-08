<script setup lang="ts">
import { useAuth } from '~/composables/useAuth'

const { initAuth } = useAuth()

onMounted(() => {
  initAuth()
})
</script>
<template>
  <div>
    <NuxtPage />
    <Toast />
  </div>
</template>
