<script setup lang="ts">
import { cn } from '~/utils/cn'

interface Props {
  label: string
  value: string | number
  caption?: string
  icon?: any
  tone?: 'neutral' | 'accent' | 'success' | 'info'
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  tone: 'neutral',
})

const tones = {
  neutral: 'bg-muted text-text-secondary',
  accent: 'bg-accent-muted text-accent',
  success: 'bg-success-muted text-success',
  info: 'bg-info-muted text-info',
}
</script>

<template>
  <div
    :class="
      cn(
        ' border border-border bg-surface p-5 shadow-xs transition-colors',
        props.class
      )
    "
  >
    <div class="flex items-start justify-between gap-3">
      <p class="text-sm font-medium text-text-secondary">{{ label }}</p>
      <span
        v-if="icon"
        :class="cn('flex h-8 w-8 shrink-0 items-center justify-center', tones[tone])"
      >
        <component :is="icon" class="h-4 w-4" />
      </span>
    </div>

    <p class="tabular mt-3 break-all text-3xl font-semibold tracking-tight text-text-primary">
      {{ value }}
    </p>

    <p v-if="caption || $slots.caption" class="mt-1.5 text-xs text-text-tertiary">
      <slot name="caption">{{ caption }}</slot>
    </p>

    <div v-if="$slots.action" class="mt-4">
      <slot name="action" />
    </div>
  </div>
</template>
