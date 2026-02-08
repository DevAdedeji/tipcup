<script setup lang="ts">
import { computed, ref } from 'vue'
import { cn } from '~/utils/cn'

interface Props {
  src?: string
  alt?: string
  fallback?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  alt: 'Avatar'
})

const hasError = ref(false)

const sizes = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
}

const onError = () => {
    hasError.value = true
}
</script>

<template>
  <div :class="cn('relative flex shrink-0 overflow-hidden rounded-full bg-slate-100', sizes[size])">
    <img
      v-if="src && !hasError"
      :src="src"
      :alt="alt"
      class="aspect-square h-full w-full object-cover"
      @error="onError"
    />
    <div v-else class="flex h-full w-full items-center justify-center rounded-full bg-secondary/10 text-secondary font-medium">
      {{ fallback || alt.charAt(0).toUpperCase() }}
    </div>
  </div>
</template>
