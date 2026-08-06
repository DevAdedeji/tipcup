<script setup lang="ts">
import { Target } from 'lucide-vue-next'
import type { Goal } from '~/composables/useGoals'
import { formatCurrency } from '~/utils/format'

const props = defineProps<{
    goal: Goal
}>()

const { userProfile } = useAuth()

const percentage = computed(() => {
    if (!props.goal.targetAmount) return 0
    return Math.min(Math.round(((props.goal.currentAmount || 0) / props.goal.targetAmount) * 100), 100)
})

const isComplete = computed(() => percentage.value >= 100)
</script>

<template>
    <div class="w-full">
        <div class=" border border-border bg-surface p-5 shadow-xs">
            <div class="mb-4 flex items-start gap-3">
                <div
                    class="flex h-9 w-9 shrink-0 items-center justify-center bg-accent-muted text-accent"
                >
                    <Target class="h-4 w-4" />
                </div>
                <div class="min-w-0 flex-1">
                    <h3 class="truncate font-display text-md font-semibold leading-tight text-text-primary">
                        {{ goal.title }}
                    </h3>
                    <p v-if="goal.description" class="mt-0.5 line-clamp-1 text-xs text-text-secondary">
                        {{ goal.description }}
                    </p>
                </div>
                <Badge v-if="isComplete" variant="success" dot>Funded</Badge>
            </div>

            <div class="space-y-2.5">
                <div class="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1">
                    <p class="amount text-xl font-bold tracking-tight text-text-primary">
                        {{ formatCurrency(goal.currentAmount || 0) }}
                        <span class="text-sm font-normal text-text-tertiary">
                            of {{ formatCurrency(goal.targetAmount) }}
                        </span>
                    </p>
                    <span class="amount text-sm font-bold text-accent">
                        {{ percentage }}%
                    </span>
                </div>

                <div
                    class="h-3.5 w-full border border-border-strong bg-surface p-[2px]"
                    role="progressbar"
                    :aria-valuenow="percentage"
                    aria-valuemin="0"
                    aria-valuemax="100"
                    :aria-label="`${goal.title} progress`"
                >
                    <AdireCloth
                        :seed="userProfile?.username"
                        :style="{ width: `${percentage}%` }"
                        class="h-full transition-all duration-700 ease-out"
                    />
                </div>
            </div>
        </div>
    </div>
</template>
