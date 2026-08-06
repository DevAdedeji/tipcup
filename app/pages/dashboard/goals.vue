<script setup lang="ts">
import { useGoals, type Goal } from '~/composables/useGoals'
import { Plus, Target } from 'lucide-vue-next'
import Skeleton from '~/components/ui/Skeleton.vue'
import GoalModal from '~/components/dashboard/GoalModal.vue'
import GoalCard from '~/components/dashboard/GoalCard.vue'

definePageMeta({
  layout: 'dashboard',
  title: 'Goals',
  subtitle: 'Give people something specific to fund',
})

usePageMeta({ title: 'Goals' })

const { goals, loading, fetchGoals, updateGoal, deleteGoal } = useGoals()
const toast = useToast()

onMounted(fetchGoals)

const showCreateModal = ref(false)
const editingGoal = ref<Goal | null>(null)

const openCreateModal = () => {
    editingGoal.value = null
    showCreateModal.value = true
}

const openEditModal = (goal: Goal) => {
    editingGoal.value = goal
    showCreateModal.value = true
}

const handleDelete = async (id: string) => {
    if (confirm('Delete this goal? This cannot be undone.')) {
        await deleteGoal(id)
        toast.add({ title: 'Deleted', description: 'Goal removed.', type: 'success' })
    }
}

const toggleStatus = async (goal: Goal) => {
    const newStatus = goal.status === 'active' ? 'paused' : 'active'
    await updateGoal(goal.id, { status: newStatus })
    toast.add({ title: 'Updated', description: `Goal ${newStatus}.`, type: 'success' })
}
</script>

<template>
    <div class="space-y-6 pb-8">
        <div class="flex flex-wrap items-center justify-between gap-3">
            <p class="max-w-md text-md text-text-secondary">
                A goal turns "support me" into something specific. Every tip moves the bar on your
                public page.
            </p>
            <Button @click="openCreateModal">
                <template #prefix><Plus class="h-4 w-4" /></template>
                New goal
            </Button>
        </div>

        <div v-if="loading" class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Skeleton v-for="i in 3" :key="i" class="h-56" />
        </div>

        <div
            v-else-if="goals.length === 0"
            class="flex flex-col items-center border border-dashed border-border-strong px-6 py-16 text-center"
        >
            <div class="flex h-12 w-12 items-center justify-center bg-accent-muted text-accent">
                <Target class="h-5 w-5" />
            </div>
            <h3 class="mt-4 font-display text-xl font-semibold tracking-tight">No goals yet</h3>
            <p class="mt-2 max-w-sm text-md text-text-secondary">
                Set a target and share the progress — a new camera, a studio month, next term's fees.
            </p>
            <Button class="mt-6" @click="openCreateModal">Create your first goal</Button>
        </div>

        <div v-else class="stagger grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <GoalCard
                v-for="goal in goals"
                :key="goal.id"
                :goal="goal"
                @edit="openEditModal"
                @delete="handleDelete"
                @toggleStatus="toggleStatus"
            />
        </div>

        <GoalModal
            :isOpen="showCreateModal"
            :goalToEdit="editingGoal"
            @close="showCreateModal = false"
            @saved="showCreateModal = false"
        />
    </div>
</template>
