<script setup lang="ts">
import { TabGroup, TabList, Tab, TabPanels, TabPanel } from '@headlessui/vue'
import { cn } from '~/utils/cn'

interface TabItem {
  key: string
  label: string
  content?: string
}

const selectedIndex = defineModel<number>({ default: 0 })

interface Props {
  items: (string | TabItem)[]
}

const props = defineProps<Props>()

const normalizedItems = computed(() => {
  return props.items.map((item, index) => {
    if (typeof item === 'string') {
      return { key: String(index), label: item }
    }
    return item
  })
})
</script>

<template>
  <div class="w-full">
    <TabGroup :selectedIndex="selectedIndex" @change="selectedIndex = $event">
      <TabList class="flex gap-1 border border-border bg-surface-sunken p-1">
        <Tab
          v-for="item in normalizedItems"
          as="template"
          :key="item.key"
          v-slot="{ selected }"
        >
          <button
            :class="cn(
              'w-full py-2 text-sm font-medium leading-5 transition-all duration-200 outline-none',
              'focus-visible:ring-2 focus-visible:ring-ring/40',
              selected
                ? 'bg-surface text-text-primary shadow-xs'
                : 'text-text-secondary hover:text-text-primary'
            )"
          >
            {{ item.label }}
          </button>
        </Tab>
      </TabList>

      <TabPanels class="mt-2">
        <slot />
          <!-- If no slots, optional default content rendering if items have content -->
           <TabPanel
            v-for="(item, idx) in normalizedItems"
            :key="idx"
            :class="cn(
              ' bg-surface p-3',
              'focus:outline-none'
            )"
            v-if="!$slots.default"
          >
             {{ item.content }}
          </TabPanel>
      </TabPanels>
    </TabGroup>
  </div>
</template>
