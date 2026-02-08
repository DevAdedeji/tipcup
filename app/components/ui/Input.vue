<script setup lang="ts">
import { cn } from '~/utils/cn'

const modelValue = defineModel<string | number>()

interface Props {
  label?: string
  placeholder?: string
  type?: string
  disabled?: boolean
  error?: string
  hint?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  disabled: false,
})
</script>

<template>
  <div class="div w-full">
    <label v-if="label" class="block text-sm font-medium text-text-primary mb-1">
      {{ label }}
    </label>
    <div class="relative flex items-center">
      <div v-if="$slots.prefix" class="absolute left-3 flex items-center pointer-events-none text-text-secondary">
        <slot name="prefix" />
      </div>
      <input
        v-model="modelValue"
        :type="type"
        :disabled="disabled"
        :placeholder="placeholder"
        :class="cn(
          'flex h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-text-primary transition-colors',
          $slots.prefix ? 'pl-10' : '',
          $slots.suffix ? 'pr-10' : '',
          error ? 'border-error ring-error focus-visible:ring-error' : ''
        )"
      />
      <div v-if="$slots.suffix" class="absolute right-3 flex items-center pointer-events-none text-text-secondary">
        <slot name="suffix" />
      </div>
    </div>
    <p v-if="error" class="mt-1 text-xs text-error">{{ error }}</p>
    <p v-if="hint && !error" class="mt-1 text-xs text-text-secondary">{{ hint }}</p>
  </div>
</template>
