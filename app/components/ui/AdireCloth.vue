<script setup lang="ts">
import { cn } from '~/utils/cn'

const props = withDefaults(
  defineProps<{
    seed?: string
    class?: string
    subtle?: boolean
  }>(),
  { subtle: false }
)

const { cloth } = useAdire(() => props.seed)
</script>

<template>
  <div
    :class="cn(cloth.className, subtle && 'opacity-25', props.class)"
    :style="cloth.style"
    aria-hidden="true"
  />
</template>
