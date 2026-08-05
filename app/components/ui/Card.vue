<script setup lang="ts">
import { cn } from '~/utils/cn'

interface Props {
  class?: string
  flush?: boolean
  interactive?: boolean
  padding?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  padding: 'md',
})

const paddings = {
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
}
</script>

<template>
  <div
    :class="
      cn(
        ' border border-border bg-surface text-text-primary shadow-xs',
        interactive &&
          'cursor-pointer transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-border-strong hover:shadow-md',
        props.class
      )
    "
  >
    <div
      v-if="$slots.header"
      :class="cn('flex flex-col gap-1 border-b border-border', paddings[padding])"
    >
      <slot name="header" />
    </div>

    <div :class="cn(!flush && paddings[padding])">
      <slot />
    </div>

    <div
      v-if="$slots.footer"
      :class="cn('flex items-center border-t border-border', paddings[padding])"
    >
      <slot name="footer" />
    </div>
  </div>
</template>
