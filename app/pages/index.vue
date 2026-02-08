<script setup lang="ts">
import { usePageMeta } from '~/composables/usePageMeta'

usePageMeta({
  title: 'Home',
  description: 'Accept support. Start a membership. Setup a shop. It’s easier than you think.',
})
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-background text-text-primary px-4">
    <div class="text-center max-w-2xl">
      <h1 class="text-5xl font-bold font-sans mb-6 text-primary">TipCup</h1>
      <p class="text-xl text-text-secondary mb-8">
        Accept support. Start a membership. Setup a shop. It’s easier than you think.
      </p>

      <div class="flex gap-4 justify-center">
        <NuxtLink to="/design-system">
          <Button size="lg">View Design System</Button>
        </NuxtLink>
        <Button variant="outline" size="lg">Get Started</Button>
      </div>
    </div>
  </div>
</template>