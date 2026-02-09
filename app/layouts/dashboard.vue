<script setup lang="ts">
import { useAuth } from '~/composables/useAuth'
import Sidebar from '~/components/dashboard/Sidebar.vue'
import Topbar from '~/components/dashboard/Topbar.vue'

const { loading, userProfile } = useAuth()

const isLoading = computed(() => {
  return loading.value || !userProfile.value
})
</script>

<template>
  <div class="min-h-screen bg-background text-text-primary flex">
    <!-- Dashboard Loader -->
    <div v-if="isLoading" class="fixed inset-0 z-[9999] w-screen h-screen flex flex-col items-center justify-center bg-background">
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

    <!-- Layout Structure -->
    <template v-else>
        <!-- Sidebar -->
        <Sidebar />

        <!-- Main Area -->
        <div class="flex-1 flex flex-col min-w-0 md:pl-64 transition-all duration-300">
            <Topbar />

            <main class="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full animate-fade-in-up">
                <slot />
            </main>
        </div>
    </template>
  </div>
</template>
