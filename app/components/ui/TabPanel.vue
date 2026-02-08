<script setup lang="ts">
import { TabPanel as HeadlessTabPanel } from '@headlessui/vue'
import { cn } from '~/utils/cn'

defineOptions({
  inheritAttrs: false
})
</script>

<template>
  <HeadlessTabPanel
    :class="cn(
      'rounded-xl bg-surface p-3',
      $attrs.class as string
    )"
    v-bind="$attrs"
  >
    <slot />
  </HeadlessTabPanel>
</template>
