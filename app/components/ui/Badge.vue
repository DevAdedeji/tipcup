<script setup lang="ts">
import { cn } from '~/utils/cn'

interface Props {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
})

const variants = {
  default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
  secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
  destructive: 'border-transparent bg-error text-white hover:bg-error/80',
  outline: 'text-text-primary',
  success: 'border-transparent bg-success text-white hover:bg-success/80',
  warning: 'border-transparent bg-warning text-text-primary hover:bg-warning/80',
}
</script>

<template>
  <div :class="cn(
    'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
    variants[variant]
  )">
    <slot />
  </div>
</template>
