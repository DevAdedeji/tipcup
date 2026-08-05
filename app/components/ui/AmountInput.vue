<script setup lang="ts">
import { watch, ref, computed } from 'vue'
import { cn } from '~/utils/cn'
import { MIN_TIP_AMOUNT, validateAmount } from '~/utils/format'

const props = withDefaults(
    defineProps<{
        modelValue: number | string
        placeholder?: string
        label?: string
        hint?: string
        disabled?: boolean
        min?: number
        validate?: boolean
        size?: 'sm' | 'md'
    }>(),
    {
        min: MIN_TIP_AMOUNT,
        validate: true,
        size: 'md',
    }
)

const emit = defineEmits(['update:modelValue'])

const displayValue = ref('')
const touched = ref(false)

const formatNumber = (value: string) => {
    const digits = value.replace(/[^0-9]/g, '')
    if (!digits) return ''
    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

watch(
    () => props.modelValue,
    (newVal) => {
        displayValue.value = newVal ? formatNumber(newVal.toString()) : ''
    },
    { immediate: true }
)

const onInput = (e: Event) => {
    const input = e.target as HTMLInputElement
    const rawValue = input.value.replace(/[^0-9]/g, '')

    displayValue.value = formatNumber(rawValue)
    emit('update:modelValue', rawValue ? parseInt(rawValue, 10) : 0)
}

const error = computed(() => {
    if (!props.validate || !touched.value) return null
    return validateAmount(props.modelValue, props.min)
})
</script>

<template>
    <div class="w-full">
        <label v-if="label" class="mb-1.5 block text-sm font-medium text-text-primary">
            {{ label }}
        </label>

        <div class="relative">
            <span
                class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-text-tertiary"
                aria-hidden="true"
            >
                ₦
            </span>

            <input
                type="text"
                inputmode="numeric"
                :value="displayValue"
                :placeholder="placeholder"
                :disabled="disabled"
                :aria-invalid="!!error"
                @input="onInput"
                @blur="touched = true"
                :class="
                    cn(
                        'tabular w-full border bg-surface pl-8 pr-3 text-text-primary shadow-xs transition-all duration-200',
                        'placeholder:text-text-tertiary',
                        'focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring',
                        'disabled:cursor-not-allowed disabled:opacity-50',
                        size === 'sm' ? 'h-9 text-sm' : 'h-11 text-md',
                        error ? 'border-error focus:border-error focus:ring-error/30' : 'border-input'
                    )
                "
            />
        </div>

        <p v-if="error" class="mt-1.5 text-xs font-medium text-error">{{ error }}</p>
        <p v-else-if="hint" class="mt-1.5 text-xs text-text-tertiary">{{ hint }}</p>
    </div>
</template>
