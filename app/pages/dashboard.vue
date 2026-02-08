<script setup lang="ts">
import { useAuth } from '~/composables/useAuth'

definePageMeta({
  layout: 'dashboard'
})

const { user, logout } = useAuth()
</script>

<template>
  <div class="min-h-screen bg-background text-text-primary p-8">
      <div class="max-w-4xl mx-auto">
          <div class="flex items-center justify-between mb-8">
              <h1 class="text-3xl font-bold">Dashboard</h1>
              <Button @click="logout" variant="outline">Sign Out</Button>
          </div>

          <div class="bg-surface border border-white/5 p-6 rounded-2xl shadow-lg">
              <p class="text-lg mb-4">Welcome back, {{ user?.displayName }}!</p>
              <p class="text-text-secondary">This is your dashboard placeholder.</p>
          </div>
      </div>
  </div>
</template>
