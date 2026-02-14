<script setup lang="ts">
import { watch, ref, computed } from 'vue'

const props = defineProps<{
    modelValue: number | string
    placeholder?: string
    label?: string
    disabled?: boolean
}>()

const emit = defineEmits(['update:modelValue'])

const displayValue = ref('')

// Format number with commas
const formatNumber = (value: string) => {
    if (!value) return ''
    // Remove non-numeric chars
    const num = value.replace(/[^0-9]/g, '')
    if (!num) return ''
    // Add commas
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// Watch for external model changes
watch(() => props.modelValue, (newVal) => {
    if (newVal) {
        displayValue.value = formatNumber(newVal.toString())
    } else {
        displayValue.value = ''
    }
}, { immediate: true })

const onInput = (e: Event) => {
    const input = e.target as HTMLInputElement
    const rawValue = input.value.replace(/[^0-9]/g, '')

    // Update display value with formatting
    displayValue.value = formatNumber(rawValue)

    // Emit raw number to parent
    const numValue = rawValue ? parseInt(rawValue) : 0
    emit('update:modelValue', numValue)
}
</script>

<template>
    <div class="w-full">
        <label v-if="label" class="block text-sm font-medium mb-1 text-text-secondary">{{ label }}</label>
        <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span class="text-text-secondary">₦</span>
            </div>
            <input
                type="text"
                :value="displayValue"
                @input="onInput"
                :placeholder="placeholder"
                :disabled="disabled"
                class="w-full pl-8 pr-4 py-2 bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-text-primary disabled:opacity-50 disabled:cursor-not-allowed"
            />
        </div>
        <style scoped>
            /* Hide number input spinners just in case type was number, though here it's text */
            input::-webkit-outer-spin-button,
            input::-webkit-inner-spin-button {
                -webkit-appearance: none;
                margin: 0;
            }
            input[type=number] {
                -moz-appearance: textfield;
            }
        </style>
    </div>
</template>
