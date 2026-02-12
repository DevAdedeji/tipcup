<script setup lang="ts">
import { computed, ref, watch } from 'vue'
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
</script>

<template>
  <div class="w-full">
    <label v-if="label" class="block text-sm font-medium text-text-primary mb-1">
      {{ label }}
    </label>
    <Listbox
      v-model="modelValue"
      :disabled="disabled"
      as="div"
      class="relative"
    >
      <ListboxButton
        :class="cn(
          'relative w-full cursor-default rounded-md bg-surface py-2 pl-3 pr-10 text-left border border-border focus:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm h-10 transition-colors',
          error ? 'border-error ring-error' : '',
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        )"
      >
        <span class="block truncate" :class="!modelValue ? 'text-text-secondary' : 'text-text-primary'">
          {{ selectedLabel }}
        </span>
        <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
          <ChevronDown class="h-4 w-4 text-gray-400" aria-hidden="true" />
        </span>
      </ListboxButton>

      <transition
        leave-active-class="transition duration-100 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <ListboxOptions
          class="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm z-50 flex flex-col"
        >
          <!-- Search Input -->
          <div v-if="searchable && normalizedOptions.length > 5" class="sticky top-0 bg-white p-2 border-b border-gray-100 z-10">
              <div class="relative">
                  <Search class="absolute left-2 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    v-model="searchQuery"
                    class="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    placeholder="Search..."
                    @keydown.stop
                  />
              </div>
          </div>

          <div class="overflow-y-auto flex-1">
              <ListboxOption
                v-for="option in filteredOptions"
                :key="String(option.value)"
                :value="option.value"
                as="template"
                v-slot="{ active, selected }"
              >
                <li
                  :class="[
                    active ? 'bg-secondary/10 text-secondary' : 'text-text-primary',
                    'relative cursor-default select-none py-2 pl-10 pr-4',
                  ]"
                >
                  <span
                    :class="[
                      selected ? 'font-medium' : 'font-normal',
                      'block truncate',
                    ]"
                  >
                    {{ option.label }}
                  </span>
                  <span
                    v-if="selected"
                    class="absolute inset-y-0 left-0 flex items-center pl-3 text-secondary"
                  >
                    <Check class="h-4 w-4" aria-hidden="true" />
                  </span>
                </li>
              </ListboxOption>

              <div v-if="filteredOptions.length === 0" class="p-3 text-sm text-gray-500 text-center">
                  No results found
              </div>
          </div>
        </ListboxOptions>
      </transition>
    </Listbox>
    <p v-if="error" class="mt-1 text-xs text-error">{{ error }}</p>
  </div>
</template>
