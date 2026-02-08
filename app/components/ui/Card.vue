<script setup lang="ts">
import { cn } from '~/utils/cn'

interface Props {
  class?: string
}

const props = defineProps<Props>()
</script>

<template>
  <div :class="cn('rounded-lg border border-border bg-surface text-text-primary shadow-sm', props.class)">
    <div v-if="$slots.header" class="flex flex-col space-y-1.5 p-6 pb-4 border-b border-border/50">
        <slot name="header" />
    </div>
    <div class="p-6 pt-0 mt-4">
      <slot />
    </div>
    <div v-if="$slots.footer" class="flex items-center p-6 pt-0 mt-4 border-t border-border/50">
      <slot name="footer" />
    </div>
  </div>
</template>
