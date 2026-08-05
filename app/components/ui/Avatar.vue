<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { cn } from '~/utils/cn'

interface Props {
  src?: string
  alt?: string
  fallback?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  alt: 'Avatar',
})

const hasError = ref(false)

watch(
  () => props.src,
  () => {
    hasError.value = false
  }
)

const sizes = {
  xs: 'h-6 w-6 text-2xs',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
  '2xl': 'h-24 w-24 text-2xl',
}

const initials = computed(() => {
  if (props.fallback) return props.fallback.slice(0, 2).toUpperCase()

  const parts = (props.alt || '').trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()

  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase()
})
</script>

<template>
  <div
    :class="
      cn(
        'relative flex shrink-0 items-center justify-center overflow-hidden bg-muted ring-1 ring-inset ring-border',
        sizes[size]
      )
    "
  >
    <img
      v-if="src && !hasError"
      :src="src"
      :alt="alt"
      loading="lazy"
      class="aspect-square h-full w-full object-cover"
      @error="hasError = true"
    />
    <span
      v-else
      class="flex h-full w-full select-none items-center justify-center bg-muted font-mono font-semibold tracking-tight text-text-tertiary"
      aria-hidden="true"
    >
      {{ initials }}
    </span>
  </div>
</template>
