<script setup lang="ts">
import { Target } from 'lucide-vue-next'
import type { Goal } from '~/composables/useGoals'
import { formatCurrency } from '~/utils/format'

const props = defineProps<{
    goal: Goal
}>()

const percentage = computed(() => {
    if (!props.goal.targetAmount) return 0
    return Math.min(Math.round((props.goal.currentAmount / props.goal.targetAmount) * 100), 100)
})
</script>

<template>
    <div class="w-full max-w-lg mx-auto mb-8 animate-fade-in-up">
        <div class="bg-surface border border-primary/20 rounded-2xl p-6 relative overflow-hidden shadow-lg transition-colors group">
            <!-- Background Glow -->
            <div class="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full -mr-10 -mt-10 group-hover:bg-primary/10 transition-colors"></div>

            <div class="relative z-10">
                <div class="flex items-center gap-3 mb-3">
                    <div class="p-2 bg-primary/10 rounded-lg text-primary">
                        <Target class="w-5 h-5" />
                    </div>
                    <div>
                        <h3 class="font-bold text-lg leading-tight">{{ goal.title }}</h3>
                         <p v-if="goal.description" class="text-xs text-text-secondary line-clamp-1">{{ goal.description }}</p>
                    </div>
                </div>

                <div class="space-y-3">
                    <div class="flex flex-wrap justify-between items-end gap-2">
                        <div class="text-2xl font-bold break-all">
                            {{ formatCurrency(goal.currentAmount) }}
                            <span class="text-sm text-text-secondary font-normal whitespace-normal">raised of {{ formatCurrency(goal.targetAmount) }}</span>
                        </div>
                        <div class="text-primary font-bold whitespace-nowrap">{{ percentage }}%</div>
                    </div>

                    <!-- Progress Bar -->
                    <div class="h-3 w-full bg-black/20 rounded-full overflow-hidden border border-white/5">
                        <div
                            class="h-full bg-gradient-to-r from-primary to-accent relative transition-all duration-1000 ease-out rounded-full"
                            :style="{ width: `${percentage}%` }"
                        >
                            <!-- Shimmer Effect -->
                            <div class="absolute inset-0 bg-white/20 skew-x-12 animate-shimmer"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
@keyframes shimmer {
    from { transform: translateX(-100%) skewX(-12deg); }
    to { transform: translateX(200%) skewX(-12deg); }
}
.animate-shimmer {
    animation: shimmer 2s infinite;
}
</style>
