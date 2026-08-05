<script setup lang="ts">
import { Moon, Sun } from 'lucide-vue-next'
import { cn } from '~/utils/cn'

withDefaults(defineProps<{ class?: string }>(), {})

const { isDark, toggle } = useTheme()
</script>

<template>
  <button
    type="button"
    :aria-label="isDark ? 'Switch to light theme' : 'Switch to dark theme'"
    :title="isDark ? 'Switch to light theme' : 'Switch to dark theme'"
    :class="
      cn(
        'relative flex h-9 w-9 items-center justify-center border border-border bg-surface text-text-secondary shadow-xs transition-all duration-200',
        'hover:bg-surface-hover hover:text-text-primary',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
        $props.class
      )
    "
    @click="toggle"
  >
    <Sun
      class="absolute h-4 w-4 transition-all duration-300"
      :class="isDark ? 'scale-0 rotate-90 opacity-0' : 'scale-100 rotate-0 opacity-100'"
    />
    <Moon
      class="absolute h-4 w-4 transition-all duration-300"
      :class="isDark ? 'scale-100 rotate-0 opacity-100' : 'scale-0 -rotate-90 opacity-0'"
    />
  </button>
</template>
