<script setup lang="ts">
import { computed, useId } from 'vue'
import { cn } from '~/utils/cn'

const modelValue = defineModel<string>()

interface Props {
  label?: string
  placeholder?: string
  rows?: number
  disabled?: boolean
  error?: string
  hint?: string
  maxlength?: number
}

const props = withDefaults(defineProps<Props>(), {
  rows: 4,
  disabled: false,
})

const id = useId()

const remaining = computed(() =>
  props.maxlength ? props.maxlength - (modelValue.value?.length || 0) : null
)
</script>

<template>
  <div class="w-full">
    <div v-if="label || maxlength" class="mb-1.5 flex items-baseline justify-between gap-3">
      <label v-if="label" :for="id" class="block text-sm font-medium text-text-primary">
        {{ label }}
      </label>
      <span
        v-if="maxlength"
        class="tabular text-2xs"
        :class="remaining !== null && remaining < 20 ? 'text-warning' : 'text-text-tertiary'"
      >
        {{ remaining }}
      </span>
    </div>

    <textarea
      :id="id"
      v-model="modelValue"
      :rows="rows"
      :disabled="disabled"
      :placeholder="placeholder"
      :maxlength="maxlength"
      :aria-invalid="!!error"
      :class="
        cn(
          'w-full resize-y border bg-surface px-3 py-2.5 text-md text-text-primary shadow-xs transition-all duration-200',
          'placeholder:text-text-tertiary',
          'focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring',
          'disabled:cursor-not-allowed disabled:opacity-50',
          error ? 'border-error focus:border-error focus:ring-error/30' : 'border-input'
        )
      "
    />

    <p v-if="error" class="mt-1.5 text-xs font-medium text-error">{{ error }}</p>
    <p v-else-if="hint" class="mt-1.5 text-xs text-text-tertiary">{{ hint }}</p>
  </div>
</template>
