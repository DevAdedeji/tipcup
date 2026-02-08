<script setup lang="ts">
import { useAuth } from '~/composables/useAuth'

const { loading, user } = useAuth()
</script>

<template>
  <div class="min-h-screen bg-background text-text-primary">
    <!-- Dashboard Loader -->
    <div v-if="loading" class="fixed inset-0 z-[9999] w-screen h-screen flex flex-col items-center justify-center bg-background">
      <div class="relative flex flex-col items-center gap-6">
          <!-- Logo or Icon -->
          <div class="relative">
              <div class="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary"></div>
              <div class="absolute inset-0 flex items-center justify-center">
                  <img src="/logo.png" alt="TipCup Logo" class="w-10 h-10 object-contain animate-bounce" />
              </div>
          </div>
          <p class="text-xl font-medium text-text-secondary animate-pulse tracking-wide">Loading Dashboard...</p>
      </div>
    </div>

    <!-- Dashboard Content -->
    <slot v-else />
  </div>
</template>
