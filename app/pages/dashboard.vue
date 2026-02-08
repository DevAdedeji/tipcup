<script setup lang="ts">
import { useAuth } from '~/composables/useAuth'
import { usePageMeta } from '~/composables/usePageMeta'

definePageMeta({
  layout: 'dashboard'
})


usePageMeta({
  title: 'Dashboard'
})

const { user, userProfile, logout } = useAuth()
const toast = useToast()

const profileUrl = computed(() => {
    if (!userProfile.value?.username) return ''
    const baseUrl = window.location.origin
    return `${baseUrl}/${userProfile.value.username}`
})

const copyLink = async () => {
    try {
        await navigator.clipboard.writeText(profileUrl.value)
        toast.add({ title: 'Copied!', description: 'Profile link copied to clipboard.', type: 'success' })
    } catch (e) {
        toast.add({ title: 'Error', description: 'Could not copy link.', type: 'error' })
    }
}
</script>

<template>
  <div class="min-h-screen bg-background text-text-primary p-6 md:p-12 pb-24">
      <div class="max-w-6xl mx-auto space-y-8">

          <!-- Header -->
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                  <h1 class="text-3xl font-bold">Dashboard</h1>
                  <p class="text-text-secondary">Welcome back, {{ userProfile?.displayName || user?.displayName }}!</p>
              </div>
              <div class="flex items-center gap-3">
                  <Button to="/dashboard/settings" variant="outline">Settings</Button>
                  <Button @click="logout" variant="ghost" class="text-red-400 hover:text-red-300">Sign Out</Button>
              </div>
          </div>

          <!-- Stats Grid -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <!-- Total Views -->
              <div class="bg-surface border border-white/5 p-6 rounded-2xl shadow-sm hover:border-primary/20 transition-colors">
                  <div class="flex items-center justify-between mb-4">
                      <span class="text-text-secondary font-medium">Total Views</span>
                      <span class="text-2xl">👀</span>
                  </div>
                  <div class="text-4xl font-bold">{{ userProfile?.views || 0 }}</div>
                  <div class="text-sm text-text-secondary mt-1">
                      All time page visits
                  </div>
              </div>

              <!-- Earnings -->
              <div class="bg-surface border border-white/5 p-6 rounded-2xl shadow-sm hover:border-primary/20 transition-colors">
                  <div class="flex items-center justify-between mb-4">
                      <span class="text-text-secondary font-medium">Earnings</span>
                      <span class="text-2xl">💰</span>
                  </div>
                  <div class="text-4xl font-bold">${{ userProfile?.totalEarnings || '0.00' }}</div>
                  <div class="text-sm text-text-secondary mt-1">
                      Total received support
                  </div>
              </div>

              <!-- Supporters -->
              <div class="bg-surface border border-white/5 p-6 rounded-2xl shadow-sm hover:border-primary/20 transition-colors">
                  <div class="flex items-center justify-between mb-4">
                      <span class="text-text-secondary font-medium">Supporters</span>
                      <span class="text-2xl">❤️</span>
                  </div>
                  <div class="text-4xl font-bold">{{ userProfile?.supporterCount || 0 }}</div>
                  <div class="text-sm text-text-secondary mt-1">
                      Unique people who supported
                  </div>
              </div>
          </div>

          <!-- Main Content Grid -->
          <div class="grid lg:grid-cols-3 gap-8">

              <!-- Left: Chart & Activity -->
              <div class="lg:col-span-2 space-y-8">
                  <!-- Views Chart -->
                  <div class="bg-surface border border-white/5 p-6 rounded-2xl shadow-sm">
                      <h2 class="text-xl font-bold mb-6">Views Overview</h2>
                      <ViewsChart :analytics="userProfile?.analytics" />
                  </div>

                  <!-- Quick Actions -->
                  <div class="grid sm:grid-cols-2 gap-4">
                      <div class="bg-surface border border-white/5 p-6 rounded-2xl shadow-sm hover:bg-white/5 transition-colors cursor-pointer group" @click="navigateTo('/dashboard/settings')">
                        <div class="flex items-center gap-4">
                            <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">⚙️</div>
                            <div>
                                <h3 class="font-bold">Edit Profile</h3>
                                <p class="text-sm text-text-secondary">Update bio & tiers</p>
                            </div>
                        </div>
                      </div>

                       <div class="bg-surface border border-white/5 p-6 rounded-2xl shadow-sm opacity-50 cursor-not-allowed">
                        <div class="flex items-center gap-4">
                            <div class="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-xl">📝</div>
                            <div>
                                <h3 class="font-bold">Create Post</h3>
                                <p class="text-sm text-text-secondary">Coming soon...</p>
                            </div>
                        </div>
                      </div>
                  </div>
              </div>

              <!-- Right: Share & Profile Card -->
              <div class="space-y-6">
                  <!-- Share Card -->
                  <div class="bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/20 p-6 rounded-2xl shadow-lg relative overflow-hidden">
                      <div class="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full -mr-10 -mt-10"></div>

                      <h2 class="text-xl font-bold mb-2 relative">Share your page</h2>
                      <p class="text-sm text-text-secondary mb-6 relative">Start getting support by sharing your unique link.</p>

                      <div class="flex gap-2 relative">
                          <Input :model-value="profileUrl" readonly class="bg-background/80" />
                          <Button @click="copyLink" size="icon" variant="secondary">
                              📋
                          </Button>
                      </div>
                      <div class="mt-4 flex justify-center">
                          <Button :to="`/${userProfile?.username}`" target="_blank" variant="link" class="text-primary text-sm">
                              Open Public Page ↗
                          </Button>
                      </div>
                  </div>
              </div>

          </div>
      </div>
  </div>
</template>
