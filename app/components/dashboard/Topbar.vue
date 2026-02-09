<script setup lang="ts">
const route = useRoute()
const title = computed(() => route.meta.title || 'Dashboard')
const subtitle = computed(() => route.meta.subtitle || '')
</script>

<template>
    <header class="h-auto py-4 flex items-center justify-between px-6 md:px-8 border-b border-gray-100 bg-background sticky top-0 z-30">
        <div class="ml-10 md:ml-0">
             <h1 class="text-xl font-bold">{{ title }}</h1>
             <p v-if="subtitle" class="text-sm text-text-secondary mt-0.5">{{ subtitle }}</p>
        </div>

        <div class="flex items-center gap-4">
            <!-- Placeholders for future topbar items (Theme toggle, Notifications, etc.) -->
        </div>
    </header>
</template>
