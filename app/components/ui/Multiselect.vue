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
    <label v-if="label" class="block text-sm font-medium text-text-primary mb-1">
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
          'relative w-full cursor-default rounded-md bg-surface py-2 pl-3 pr-10 text-left border border-border focus:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:text-sm min-h-[40px] transition-colors',
          error ? 'border-error ring-error' : '',
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        )"
      >
        <div v-if="modelValue.length > 0" class="flex flex-wrap gap-1">
            <span v-for="(val, idx) in modelValue" :key="idx" class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-secondary/10 text-secondary">
                {{ selectedLabels[idx] }}
                <X class="w-3 h-3 ml-1 cursor-pointer hover:text-secondary/80" @click.stop.prevent="removeOption(val)" />
            </span>
        </div>
        <span v-else class="block truncate text-text-secondary">
          {{ placeholder }}
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
          class="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm z-50"
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
        </ListboxOptions>
      </transition>
    </Listbox>
    <p v-if="error" class="mt-1 text-xs text-error">{{ error }}</p>
  </div>
</template>
