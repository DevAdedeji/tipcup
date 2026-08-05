<script setup lang="ts">
import { computed, ref, watch, onUnmounted } from 'vue'
import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from '@headlessui/vue'
import { Check, ChevronDown, Search } from 'lucide-vue-next'
import { cn } from '~/utils/cn'

interface Option {
  label: string
  value: string | number | object
}

const modelValue = defineModel<string | number | object | null>()

interface Props {
  options: (Option | string)[]
  label?: string
  placeholder?: string
  error?: string
  disabled?: boolean
  searchable?: boolean
  maxVisibleOptions?: number // Limit rendered options for performance
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Select an option',
  disabled: false,
  searchable: true,
  maxVisibleOptions: 100 // Default: render max 100 options at once
})

const searchQuery = ref('')
const debouncedSearch = ref('')
let debounceTimeout: NodeJS.Timeout | null = null

const normalizedOptions = computed(() => {
  return props.options.map(opt => {
    if (typeof opt === 'string') {
      return { label: opt, value: opt }
    }
    return opt
  })
})

const filteredOptions = computed(() => {
  if (!debouncedSearch.value) {
    // Limit initial render to maxVisibleOptions for performance
    return normalizedOptions.value.slice(0, props.maxVisibleOptions)
  }
  const query = debouncedSearch.value.toLowerCase()
  const filtered = normalizedOptions.value.filter(opt =>
    opt.label.toLowerCase().includes(query)
  )
  // Also limit filtered results
  return filtered.slice(0, props.maxVisibleOptions)
})

const selectedLabel = computed(() => {
  if (!modelValue.value) return props.placeholder
  const selected = normalizedOptions.value.find(opt => JSON.stringify(opt.value) === JSON.stringify(modelValue.value))
  return selected ? selected.label : props.placeholder
})

// Debounce search input for better performance
watch(searchQuery, (newVal) => {
  if (debounceTimeout) clearTimeout(debounceTimeout)
  debounceTimeout = setTimeout(() => {
    debouncedSearch.value = newVal
  }, 150) // 150ms debounce
})

// Reset search when closed or value changes
watch(modelValue, () => {
  searchQuery.value = ''
  debouncedSearch.value = ''
})

onUnmounted(() => {
  if (debounceTimeout) clearTimeout(debounceTimeout)
})
</script>

<template>
  <div class="w-full">
    <label v-if="label" class="mb-1.5 block text-sm font-medium text-text-primary">
      {{ label }}
    </label>

    <Listbox v-model="modelValue" :disabled="disabled" as="div" class="relative">
      <ListboxButton
        :class="cn(
          'relative h-11 w-full cursor-pointer border bg-surface py-2 pl-3 pr-10 text-left text-md shadow-xs transition-all duration-200',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:border-ring',
          error ? 'border-error' : 'border-input',
          disabled ? 'cursor-not-allowed opacity-50' : 'hover:border-border-strong'
        )"
      >
        <span class="block truncate" :class="!modelValue ? 'text-text-tertiary' : 'text-text-primary'">
          {{ selectedLabel }}
        </span>
        <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          <ChevronDown class="h-4 w-4 text-text-tertiary" aria-hidden="true" />
        </span>
      </ListboxButton>

      <transition
        enter-active-class="transition duration-150 ease-out"
        enter-from-class="opacity-0 -translate-y-1 scale-98"
        enter-to-class="opacity-100 translate-y-0 scale-100"
        leave-active-class="transition duration-100 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <ListboxOptions
          class="absolute z-[60] mt-1.5 flex max-h-64 w-full flex-col overflow-hidden border border-border bg-surface py-1 text-md shadow-lg focus:outline-none"
        >
          <!-- Search Input -->
          <div
            v-if="searchable && normalizedOptions.length > 5"
            class="sticky top-0 z-10 border-b border-border bg-surface p-2"
          >
            <div class="relative">
              <Search class="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-text-tertiary" />
              <input
                v-model="searchQuery"
                type="text"
                class="w-full border border-input bg-surface py-1.5 pl-8 pr-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring/40"
                placeholder="Search..."
                @keydown.stop
              />
            </div>
          </div>

          <div class="flex-1 overflow-y-auto p-1">
            <ListboxOption
              v-for="option in filteredOptions"
              :key="String(option.value)"
              :value="option.value"
              as="template"
              v-slot="{ active, selected }"
            >
              <li
                :class="[
                  active ? 'bg-surface-hover text-text-primary' : 'text-text-secondary',
                  'relative cursor-pointer select-none py-2 pl-9 pr-3 transition-colors',
                ]"
              >
                <span :class="[selected ? 'font-medium text-text-primary' : 'font-normal', 'block truncate']">
                  {{ option.label }}
                </span>
                <span v-if="selected" class="absolute inset-y-0 left-0 flex items-center pl-2.5 text-accent">
                  <Check class="h-4 w-4" aria-hidden="true" />
                </span>
              </li>
            </ListboxOption>

            <div v-if="filteredOptions.length === 0" class="p-4 text-center text-sm text-text-tertiary">
              No results found
            </div>

            <!-- Show message when results are limited -->
            <div
              v-else-if="!debouncedSearch && normalizedOptions.length > maxVisibleOptions"
              class="sticky bottom-0 border-t border-border bg-info-muted px-2 py-1.5 text-center text-2xs text-info"
            >
              Showing {{ filteredOptions.length }} of {{ normalizedOptions.length }}. Search to narrow down.
            </div>
          </div>
        </ListboxOptions>
      </transition>
    </Listbox>

    <p v-if="error" class="mt-1.5 text-xs font-medium text-error">{{ error }}</p>
  </div>
</template>
