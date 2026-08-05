<script setup lang="ts">
import { useId } from 'vue'
import { cn } from '~/utils/cn'

const modelValue = defineModel<string | number>()

interface Props {
  label?: string
  placeholder?: string
  type?: string
  disabled?: boolean
  error?: string
  hint?: string
  size?: 'sm' | 'md'
  autocomplete?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  disabled: false,
  size: 'md',
})

const id = useId()
</script>

<template>
  <div class="w-full">
    <label v-if="label" :for="id" class="mb-1.5 block text-sm font-medium text-text-primary">
      {{ label }}
    </label>

    <div class="relative flex items-center">
      <div
        v-if="$slots.prefix"
        class="pointer-events-none absolute left-3 flex items-center text-text-tertiary"
      >
        <slot name="prefix" />
      </div>

      <input
        :id="id"
        v-model="modelValue"
        :type="type"
        :disabled="disabled"
        :placeholder="placeholder"
        :autocomplete="autocomplete"
        :aria-invalid="!!error"
        :aria-describedby="error || hint ? `${id}-desc` : undefined"
        :class="
          cn(
            'w-full border bg-surface px-3 text-text-primary shadow-xs transition-all duration-200',
            'placeholder:text-text-tertiary',
            'focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring',
            'disabled:cursor-not-allowed disabled:opacity-50',
            size === 'sm' ? 'h-9 text-sm' : 'h-11 text-md',
            $slots.prefix && 'pl-10',
            $slots.suffix && 'pr-10',
            error ? 'border-error focus:border-error focus:ring-error/30' : 'border-input'
          )
        "
      />

      <div
        v-if="$slots.suffix"
        class="pointer-events-none absolute right-3 flex items-center text-text-tertiary"
      >
        <slot name="suffix" />
      </div>
    </div>

    <p v-if="error" :id="`${id}-desc`" class="mt-1.5 text-xs font-medium text-error">
      {{ error }}
    </p>
    <p v-else-if="hint" :id="`${id}-desc`" class="mt-1.5 text-xs text-text-tertiary">
      {{ hint }}
    </p>
  </div>
</template>
