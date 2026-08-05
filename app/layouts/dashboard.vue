<script setup lang="ts">
import { useAuth } from '~/composables/useAuth'
import Sidebar from '~/components/dashboard/Sidebar.vue'
import Topbar from '~/components/dashboard/Topbar.vue'

const { loading, userProfile, user } = useAuth()

const isLoading = computed(() => loading.value || (user.value && !userProfile.value))
</script>

<template>
  <div class="flex min-h-[100dvh] bg-background text-text-primary">
    <div
      v-if="isLoading"
      class="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-5 bg-background"
    >
      <div class="relative flex h-16 w-16 items-center justify-center">
        <div class="absolute inset-0 animate-spin rounded-full border-2 border-border border-t-accent" />
        <img src="/logo.png" alt="" class="h-8 w-8 object-contain" />
      </div>
      <p class="text-sm font-medium tracking-wide text-text-secondary">Loading your dashboard</p>
    </div>

    <template v-else>
      <Sidebar />

      <div class="flex min-w-0 flex-1 flex-col md:pl-64">
        <Topbar />

        <main class="mx-auto w-full max-w-content flex-1 animate-fade-in-up p-4 md:p-8">
          <slot />
        </main>
      </div>
    </template>
  </div>
</template>
