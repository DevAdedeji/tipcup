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
      <TabList class="flex space-x-1 rounded-xl bg-secondary/10 p-1">
        <Tab
          v-for="item in normalizedItems"
          as="template"
          :key="item.key"
          v-slot="{ selected }"
        >
          <button
            :class="cn(
              'w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-all outline-none',
              selected
                ? 'bg-surface text-primary shadow-sm font-bold'
                : 'text-text-secondary hover:bg-white/[0.12] hover:text-primary'
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
              'rounded-xl bg-surface p-3',
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
