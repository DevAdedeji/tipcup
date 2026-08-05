<script setup lang="ts">
import { cn } from '~/utils/cn'

interface Props {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info' | 'accent'
  size?: 'sm' | 'md'
  dot?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'sm',
})

const variants = {
  default: 'text-text-secondary ring-border-strong',
  secondary: 'text-secondary-foreground ring-border-strong',
  outline: 'text-text-secondary ring-border-strong',
  accent: 'text-accent ring-accent/50',
  success: 'text-success ring-success/50',
  warning: 'text-warning ring-warning/50',
  destructive: 'text-error ring-error/50',
  info: 'text-info ring-info/50',
}

const dotColors = {
  default: 'bg-text-tertiary',
  secondary: 'bg-text-tertiary',
  outline: 'bg-text-tertiary',
  accent: 'bg-accent',
  success: 'bg-success',
  warning: 'bg-warning',
  destructive: 'bg-error',
  info: 'bg-info',
}

const sizes = {
  sm: 'px-1.5 py-0.5 text-2xs gap-1',
  md: 'px-2 py-0.5 text-xs gap-1.5',
}
</script>

<template>
  <span
    :class="
      cn(
        'inline-flex items-center whitespace-nowrap',
        'font-mono font-semibold uppercase tracking-label',
        'ring-1 ring-inset',
        variants[variant],
        sizes[size]
      )
    "
  >
    <span v-if="dot" :class="cn('h-1.5 w-1.5 shrink-0 rounded-full', dotColors[variant])" />
    <slot />
  </span>
</template>
