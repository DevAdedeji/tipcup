<script setup lang="ts">
import type { Goal } from '~/composables/useGoals'
import { MoreVertical, Trash2, Edit2, PlayCircle, PauseCircle } from 'lucide-vue-next'
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'
import { formatCurrency } from '~/utils/format'
import { useAuth } from '~/composables/useAuth'

const props = defineProps<{ goal: Goal }>()

defineEmits<{
    (e: 'edit', goal: Goal): void
    (e: 'delete', id: string): void
    (e: 'toggleStatus', goal: Goal): void
}>()

const { userProfile } = useAuth()

const percentage = computed(() => {
    if (!props.goal.targetAmount) return 0
    return Math.min(Math.round(((props.goal.currentAmount || 0) / props.goal.targetAmount) * 100), 100)
})

const status = computed(() => {
    if (props.goal.status === 'active') return { label: 'Active', tone: 'bg-success-muted text-success' }
    if (props.goal.status === 'paused') return { label: 'Paused', tone: 'bg-warning-muted text-warning' }
    return { label: 'Complete', tone: 'bg-info-muted text-info' }
})
</script>

<template>
    <div class="flex flex-col border border-border bg-surface shadow-xs">
        <div class="flex items-start justify-between gap-3 p-5 pb-3">
            <div class="min-w-0">
                <span
                    class="inline-flex items-center gap-1.5 px-2 py-0.5 text-2xs font-semibold uppercase tracking-label"
                    :class="status.tone"
                >
                    <span
                        v-if="goal.status === 'active'"
                        class="h-1.5 w-1.5 rounded-full bg-success"
                    />
                    {{ status.label }}
                </span>

                <h3 class="mt-2 line-clamp-1 font-display text-lg font-semibold tracking-tight" :title="goal.title">
                    {{ goal.title }}
                </h3>
            </div>

            <Menu as="div" class="relative shrink-0">
                <MenuButton
                    class="flex h-8 w-8 items-center justify-center text-text-tertiary transition-colors hover:bg-surface-hover hover:text-text-primary"
                >
                    <span class="sr-only">Goal actions</span>
                    <MoreVertical class="h-4 w-4" />
                </MenuButton>

                <transition
                    enter-active-class="transition duration-100 ease-out"
                    enter-from-class="scale-95 opacity-0"
                    leave-active-class="transition duration-75 ease-in"
                    leave-to-class="scale-95 opacity-0"
                >
                    <MenuItems
                        class="absolute right-0 z-20 mt-1 w-40 origin-top-right border border-border bg-surface p-1 shadow-lg focus:outline-none"
                    >
                        <MenuItem v-slot="{ active }">
                            <button
                                :class="[active ? 'bg-surface-hover' : '', 'flex w-full items-center gap-2 px-2 py-2 text-sm text-text-primary']"
                                @click="$emit('edit', goal)"
                            >
                                <Edit2 class="h-4 w-4" /> Edit
                            </button>
                        </MenuItem>

                        <MenuItem v-slot="{ active }">
                            <button
                                :class="[active ? 'bg-surface-hover' : '', 'flex w-full items-center gap-2 px-2 py-2 text-sm text-text-primary']"
                                @click="$emit('toggleStatus', goal)"
                            >
                                <component :is="goal.status === 'active' ? PauseCircle : PlayCircle" class="h-4 w-4" />
                                {{ goal.status === 'active' ? 'Pause' : 'Activate' }}
                            </button>
                        </MenuItem>

                        <div class="my-1 h-px bg-border" />

                        <MenuItem v-slot="{ active }">
                            <button
                                :class="[active ? 'bg-error-muted' : '', 'flex w-full items-center gap-2 px-2 py-2 text-sm text-error']"
                                @click="$emit('delete', goal.id)"
                            >
                                <Trash2 class="h-4 w-4" /> Delete
                            </button>
                        </MenuItem>
                    </MenuItems>
                </transition>
            </Menu>
        </div>

        <p class="line-clamp-2 min-h-[2.5rem] px-5 text-sm text-text-secondary">
            {{ goal.description || 'No description yet.' }}
        </p>

        <div class="mt-auto space-y-2 p-5 pt-4">
            <div class="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1">
                <p class="amount text-lg font-bold">
                    {{ formatCurrency(goal.currentAmount || 0) }}
                    <span class="text-xs font-normal text-text-tertiary">
                        of {{ formatCurrency(goal.targetAmount) }}
                    </span>
                </p>
                <span class="amount text-sm font-bold text-accent">{{ percentage }}%</span>
            </div>

            <!-- The bar fills with the creator's own cloth. -->
            <div
                class="h-3.5 w-full border border-border-strong bg-surface p-[2px]"
                role="progressbar"
                :aria-valuenow="percentage"
                aria-valuemin="0"
                aria-valuemax="100"
                :aria-label="goal.title"
            >
                <AdireCloth
                    :seed="userProfile?.username"
                    :style="{ width: `${percentage}%` }"
                    class="h-full transition-all duration-700 ease-out"
                />
            </div>
        </div>
    </div>
</template>
