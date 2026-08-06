<script setup lang="ts">
import { cn } from '~/utils/cn'

interface Props {
  label: string
  value: string | number
  caption?: string
  icon?: any
  /** Renders the figure as the headline of the card. */
  emphasis?: boolean
  class?: string
}

const props = withDefaults(defineProps<Props>(), { emphasis: false })
</script>

<template>
  <div
    :class="
      cn(
        'flex flex-col border border-border bg-surface p-5 shadow-xs',
        props.class
      )
    "
  >
    <div class="flex items-start justify-between gap-3">
      <p class="field-label">{{ label }}</p>
      <component v-if="icon" :is="icon" class="h-4 w-4 shrink-0 text-text-tertiary" />
    </div>

    <p
      :class="
        cn(
          'amount mt-3 break-all font-bold tracking-tight text-text-primary',
          emphasis ? 'text-4xl' : 'text-3xl'
        )
      "
    >
      {{ value }}
    </p>

    <p v-if="caption || $slots.caption" class="mt-1.5 text-xs text-text-tertiary">
      <slot name="caption">{{ caption }}</slot>
    </p>

    <div v-if="$slots.action" class="mt-auto pt-4">
      <slot name="action" />
    </div>
  </div>
</template>
