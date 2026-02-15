<script setup lang="ts">
import type { Goal } from '~/composables/useGoals'
import { MoreVertical, Trash2, Edit2, PlayCircle, PauseCircle, Target } from 'lucide-vue-next'
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'
import { formatCurrency } from '~/utils/format'

const props = defineProps<{
    goal: Goal
}>()

const emit = defineEmits<{
    (e: 'edit', goal: Goal): void
    (e: 'delete', id: string): void
    (e: 'toggleStatus', goal: Goal): void
}>()

const percentage = computed(() => {
    if (!props.goal.targetAmount) return 0
    return Math.min(Math.round((props.goal.currentAmount / props.goal.targetAmount) * 100), 100)
})
</script>

<template>
    <div class="bg-surface border p-6 rounded-2xl relative group border-primary/20 transition-all shadow-sm overflow-hidden">
        <div class="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full -mr-10 -mt-10 group-hover:bg-primary/10 transition-colors"></div>

        <div class="relative z-10">
            <div class="flex justify-between items-start mb-4">
                <div>
                     <!-- Status Badge -->
                    <div v-if="goal.status === 'active'" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 text-xs font-bold mb-2">
                        <span class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                        ACTIVE
                    </div>
                    <div v-else-if="goal.status === 'paused'" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-500 text-xs font-bold mb-2">
                        PAUSED
                    </div>
                    <div v-else class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 text-xs font-bold mb-2">
                        COMPLETED
                    </div>

                    <h3 class="text-lg font-bold line-clamp-1 flex items-center gap-2" :title="goal.title">
                        {{ goal.title }}
                    </h3>
                </div>

                <!-- Dropdown Menu -->
                <Menu as="div" class="relative ml-3">
                    <MenuButton class="p-1.5 hover:bg-white/5 rounded-lg text-text-secondary transition-colors">
                        <MoreVertical class="w-5 h-5" />
                    </MenuButton>
                    <transition
                        enter-active-class="transition duration-100 ease-out"
                        enter-from-class="transform scale-95 opacity-0"
                        enter-to-class="transform scale-100 opacity-100"
                        leave-active-class="transition duration-75 ease-in"
                        leave-from-class="transform scale-100 opacity-100"
                        leave-to-class="transform scale-95 opacity-0"
                    >
                        <MenuItems class="absolute right-0 mt-2 w-40 origin-top-right divide-y divide-white/5 rounded-xl bg-surface border border-white/10 shadow-lg focus:outline-none z-10 p-1">
                            <div class="px-1 py-1">
                                    <MenuItem v-slot="{ active }">
                                    <button @click="$emit('edit', goal)" :class="[active ? 'bg-primary/10 text-primary' : 'text-text-primary', 'group flex w-full items-center rounded-lg px-2 py-2 text-sm']">
                                        <Edit2 class="mr-2 h-4 w-4" /> Edit
                                    </button>
                                </MenuItem>
                                <MenuItem v-slot="{ active }">
                                    <button @click="$emit('toggleStatus', goal)" :class="[active ? 'bg-primary/10 text-primary' : 'text-text-primary', 'group flex w-full items-center rounded-lg px-2 py-2 text-sm']">
                                        <component :is="goal.status === 'active' ? PauseCircle : PlayCircle" class="mr-2 h-4 w-4" />
                                        {{ goal.status === 'active' ? 'Pause' : 'Activate' }}
                                    </button>
                                </MenuItem>
                            </div>
                            <div class="px-1 py-1">
                                <MenuItem v-slot="{ active }">
                                    <button @click="$emit('delete', goal.id)" :class="[active ? 'bg-red-500/10 text-red-500' : 'text-red-500', 'group flex w-full items-center rounded-lg px-2 py-2 text-sm']">
                                        <Trash2 class="mr-2 h-4 w-4" /> Delete
                                    </button>
                                </MenuItem>
                            </div>
                        </MenuItems>
                    </transition>
                </Menu>
            </div>

            <p class="text-text-secondary text-sm mb-6 line-clamp-2 h-10">{{ goal.description || 'No description provided.' }}</p>

            <div class="space-y-2">
                <div class="flex flex-wrap justify-between items-end text-sm font-medium gap-2">
                    <span class="text-primary text-base font-bold break-all">{{ formatCurrency(goal.currentAmount) }} <span class="text-xs text-text-secondary font-normal whitespace-normal">of {{ formatCurrency(goal.targetAmount) }}</span></span>
                    <span class="text-primary font-bold whitespace-nowrap">{{ percentage }}%</span>
                </div>

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
