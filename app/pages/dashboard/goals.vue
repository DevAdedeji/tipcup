<script setup lang="ts">
import { useGoals, type Goal } from '~/composables/useGoals'
import { Plus, Target } from 'lucide-vue-next'
import Skeleton from '~/components/ui/Skeleton.vue'
import GoalModal from '~/components/dashboard/GoalModal.vue'
import GoalCard from '~/components/dashboard/GoalCard.vue'

definePageMeta({
  layout: 'dashboard',
  title: 'Goals',
  subtitle: 'Manage your fundraising campaigns'
})

usePageMeta({
    title: 'Goals'
})

const { goals, loading, fetchGoals, createGoal, updateGoal, deleteGoal } = useGoals()
const toast = useToast()

onMounted(() => {
    fetchGoals()
})

// Create Modal State
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
    if (confirm('Are you sure you want to delete this goal?')) {
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
    <div class="min-h-screen bg-background text-text-primary pb-24">
        <div class="mx-auto space-y-8">

            <!-- Header Action -->
            <div class="flex justify-between items-center bg-surface border border-primary/20 p-6 rounded-2xl">
                <div>
                    <h2 class="text-xl font-bold flex items-center gap-2">
                        <Target class="w-6 h-6 text-primary" />
                        Active Campaigns
                    </h2>
                    <p class="text-text-secondary text-sm mt-1">Create goals to encourage your supporters.</p>
                </div>
                <Button @click="openCreateModal" class="gap-2">
                    <Plus class="w-4 h-4" />
                    <span class="md:block hidden">New Goal</span>
                </Button>
            </div>

            <!-- Loading State -->
            <div v-if="loading" class="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
                <div v-for="i in 3" :key="i" class="bg-surface border border-white/5 p-6 rounded-2xl h-48 flex flex-col justify-between">
                    <div>
                         <div class="flex justify-between mb-4">
                             <Skeleton class="h-6 w-32" />
                             <Skeleton class="h-8 w-8 rounded-full" />
                         </div>
                         <Skeleton class="h-4 w-full mb-2" />
                         <Skeleton class="h-4 w-2/3" />
                    </div>
                    <div>
                        <Skeleton class="h-2 w-full rounded-full mb-2" />
                        <div class="flex justify-between">
                            <Skeleton class="h-4 w-12" />
                            <Skeleton class="h-4 w-12" />
                        </div>
                    </div>
                </div>
            </div>

            <div v-else-if="goals.length === 0" class="text-center py-24 bg-surface/30 border border-white/5 rounded-2xl border-dashed">
                <div class="bg-surface inline-block p-4 rounded-full mb-4">
                    <Target class="w-8 h-8 text-text-secondary" />
                </div>
                <h3 class="text-xl font-bold mb-2">No goals yet</h3>
                <p class="text-text-secondary mb-6 max-w-sm mx-auto">Start your first fundraising campaign to show your supporters what you're working towards.</p>
                <Button @click="openCreateModal" variant="outline">Create your first goal</Button>
            </div>

            <div v-else class="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
                <GoalCard
                    v-for="goal in goals"
                    :key="goal.id"
                    :goal="goal"
                    @edit="openEditModal"
                    @delete="handleDelete"
                    @toggleStatus="toggleStatus"
                />
            </div>
        </div>
        <GoalModal
            :isOpen="showCreateModal"
            :goalToEdit="editingGoal"
            @close="showCreateModal = false"
            @saved="showCreateModal = false"
        />
    </div>
</template>


