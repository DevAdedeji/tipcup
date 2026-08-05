<script setup lang="ts">
import { computed } from 'vue'
import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from '@headlessui/vue'
import { Check, ChevronDown, X } from 'lucide-vue-next'
import { cn } from '~/utils/cn'

interface Option {
  label: string
  value: string | number | object
}

const modelValue = defineModel<(string | number | object)[]>({ default: () => [] })

interface Props {
  options: (Option | string)[]
  label?: string
  placeholder?: string
  error?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Select options',
  disabled: false,
})

const normalizedOptions = computed(() => {
  return props.options.map(opt => {
    if (typeof opt === 'string') {
      return { label: opt, value: opt }
    }
    return opt
  })
})

const selectedLabels = computed(() => {
  return modelValue.value.map(val => {
     const found = normalizedOptions.value.find(opt => JSON.stringify(opt.value) === JSON.stringify(val))
     return found ? found.label : String(val)
  })
})

const removeOption = (val: string | number | object) => {
    modelValue.value = modelValue.value.filter(v => JSON.stringify(v) !== JSON.stringify(val))
}
</script>

<template>
  <div class="w-full">
    <label v-if="label" class="mb-1.5 block text-sm font-medium text-text-primary">
      {{ label }}
    </label>
    <Listbox
      v-model="modelValue"
      :disabled="disabled"
      as="div"
      class="relative"
      multiple
    >
      <ListboxButton
        :class="cn(
          'relative min-h-[44px] w-full cursor-pointer bg-surface py-2 pl-3 pr-10 text-left text-md border shadow-xs transition-all duration-200',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:border-ring',
          error ? 'border-error' : 'border-input',
          disabled ? 'cursor-not-allowed opacity-50' : 'hover:border-border-strong'
        )"
      >
        <div v-if="modelValue.length > 0" class="flex flex-wrap gap-1">
            <span v-for="(val, idx) in modelValue" :key="idx" class="inline-flex items-center gap-1 bg-accent-muted px-2 py-0.5 text-xs font-medium text-accent">
                {{ selectedLabels[idx] }}
                <X class="h-3 w-3 cursor-pointer transition-opacity hover:opacity-70" @click.stop.prevent="removeOption(val)" />
            </span>
        </div>
        <span v-else class="block truncate text-text-tertiary">
          {{ placeholder }}
        </span>
        <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          <ChevronDown class="h-4 w-4 text-text-tertiary" aria-hidden="true" />
        </span>
      </ListboxButton>

      <transition
        leave-active-class="transition duration-100 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <ListboxOptions
          class="absolute z-50 mt-1.5 max-h-60 w-full overflow-auto border border-border bg-surface p-1 text-md shadow-lg focus:outline-none"
        >
          <ListboxOption
            v-for="option in normalizedOptions"
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
              <span
                :class="[
                  selected ? 'font-medium text-text-primary' : 'font-normal',
                  'block truncate',
                ]"
              >
                {{ option.label }}
              </span>
              <span
                v-if="selected"
                class="absolute inset-y-0 left-0 flex items-center pl-2.5 text-accent"
              >
                <Check class="h-4 w-4" aria-hidden="true" />
              </span>
            </li>
          </ListboxOption>
        </ListboxOptions>
      </transition>
    </Listbox>
    <p v-if="error" class="mt-1 text-xs text-error">{{ error }}</p>
  </div>
</template>
