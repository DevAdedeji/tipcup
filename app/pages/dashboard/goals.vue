<script setup lang="ts">
import { useGoals, type Goal } from '~/composables/useGoals'
import { Plus, Target, MoreVertical, Trash2, Edit2, PlayCircle, PauseCircle, CheckCircle2 } from 'lucide-vue-next'
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'
import Skeleton from '~/components/ui/Skeleton.vue'

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
const form = reactive({
    title: '',
    description: '',
    targetAmount: ''
})

const openCreateModal = () => {
    editingGoal.value = null
    form.title = ''
    form.description = ''
    form.targetAmount = ''
    showCreateModal.value = true
}

const openEditModal = (goal: Goal) => {
    editingGoal.value = goal
    form.title = goal.title
    form.description = goal.description
    form.targetAmount = goal.targetAmount.toString()
    showCreateModal.value = true
}

const submitting = ref(false)

const handleSubmit = async () => {
    if (!form.title || !form.targetAmount) {
        toast.add({ title: 'Error', description: 'Please fill in all required fields.', type: 'error' })
        return
    }

    submitting.value = true
    try {
        if (editingGoal.value) {
            await updateGoal(editingGoal.value.id, {
                title: form.title,
                description: form.description,
                targetAmount: Number(form.targetAmount)
            })
            toast.add({ title: 'Success', description: 'Goal updated successfully!' })
        } else {
            await createGoal({
                title: form.title,
                description: form.description,
                targetAmount: Number(form.targetAmount)
            })
            toast.add({ title: 'Success', description: 'Goal created successfully!' })
        }
        showCreateModal.value = false
    } catch (e) {
        toast.add({ title: 'Error', description: 'Something went wrong.', type: 'error' })
    } finally {
        submitting.value = false
    }
}

const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this goal?')) {
        await deleteGoal(id)
        toast.add({ title: 'Deleted', description: 'Goal removed.' })
    }
}

const toggleStatus = async (goal: Goal) => {
    const newStatus = goal.status === 'active' ? 'paused' : 'active'
    await updateGoal(goal.id, { status: newStatus })
    toast.add({ title: 'Updated', description: `Goal ${newStatus}.` })
}

const getProgress = (current: number, target: number) => {
    return Math.min(Math.round((current / target) * 100), 100)
}
</script>

<template>
    <div class="min-h-screen bg-background text-text-primary pb-24">
        <div class="mx-auto space-y-8">

            <!-- Header Action -->
            <div class="flex justify-between items-center bg-surface border border-white/5 p-6 rounded-2xl">
                <div>
                    <h2 class="text-xl font-bold flex items-center gap-2">
                        <Target class="w-6 h-6 text-primary" />
                        Active Campaigns
                    </h2>
                    <p class="text-text-secondary text-sm mt-1">Create goals to encourage your supporters.</p>
                </div>
                <Button @click="openCreateModal" class="gap-2">
                    <Plus class="w-4 h-4" /> New Goal
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

            <!-- Empty State -->
            <div v-else-if="goals.length === 0" class="text-center py-24 bg-surface/30 border border-white/5 rounded-2xl border-dashed">
                <div class="bg-surface inline-block p-4 rounded-full mb-4">
                    <Target class="w-8 h-8 text-text-secondary" />
                </div>
                <h3 class="text-xl font-bold mb-2">No goals yet</h3>
                <p class="text-text-secondary mb-6 max-w-sm mx-auto">Start your first fundraising campaign to show your supporters what you're working towards.</p>
                <Button @click="openCreateModal" variant="outline">Create your first goal</Button>
            </div>

            <!-- Goals Grid -->
            <div v-else class="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
                <div v-for="goal in goals" :key="goal.id" class="bg-surface border border-white/5 p-6 rounded-2xl relative group hover:border-primary/20 transition-all shadow-sm">

                    <div class="flex justify-between items-start mb-4">
                        <div>
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
                            <h3 class="text-lg font-bold line-clamp-1" :title="goal.title">{{ goal.title }}</h3>
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
                                            <button @click="openEditModal(goal)" :class="[active ? 'bg-primary/10 text-primary' : 'text-text-primary', 'group flex w-full items-center rounded-lg px-2 py-2 text-sm']">
                                                <Edit2 class="mr-2 h-4 w-4" /> Edit
                                            </button>
                                        </MenuItem>
                                        <MenuItem v-slot="{ active }">
                                            <button @click="toggleStatus(goal)" :class="[active ? 'bg-primary/10 text-primary' : 'text-text-primary', 'group flex w-full items-center rounded-lg px-2 py-2 text-sm']">
                                                <component :is="goal.status === 'active' ? PauseCircle : PlayCircle" class="mr-2 h-4 w-4" />
                                                {{ goal.status === 'active' ? 'Pause' : 'Activate' }}
                                            </button>
                                        </MenuItem>
                                    </div>
                                    <div class="px-1 py-1">
                                        <MenuItem v-slot="{ active }">
                                            <button @click="handleDelete(goal.id)" :class="[active ? 'bg-red-500/10 text-red-500' : 'text-red-500', 'group flex w-full items-center rounded-lg px-2 py-2 text-sm']">
                                                <Trash2 class="mr-2 h-4 w-4" /> Delete
                                            </button>
                                        </MenuItem>
                                    </div>
                                </MenuItems>
                            </transition>
                        </Menu>
                    </div>

                    <p class="text-text-secondary text-sm mb-6 line-clamp-2 h-10">{{ goal.description || 'No description provided.' }}</p>

                    <!-- Progress -->
                    <div class="space-y-2">
                        <div class="flex justify-between text-sm font-medium">
                            <span class="text-primary">${{ goal.currentAmount }}</span>
                            <span class="text-text-secondary">of ${{ goal.targetAmount }}</span>
                        </div>
                        <div class="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                            <div
                                class="h-full bg-primary transition-all duration-1000 ease-out rounded-full"
                                :style="{ width: `${getProgress(goal.currentAmount, goal.targetAmount)}%` }"
                            ></div>
                        </div>
                        <div class="text-right text-xs text-text-secondary font-mono">
                            {{ getProgress(goal.currentAmount, goal.targetAmount) }}%
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Create/Edit Modal -->
        <TransitionRoot appear :show="showCreateModal" as="template">
            <Dialog as="div" @close="showCreateModal = false" class="relative z-50">
                <TransitionChild
                    as="template"
                    enter="duration-300 ease-out"
                    enter-from="opacity-0"
                    enter-to="opacity-100"
                    leave="duration-200 ease-in"
                    leave-from="opacity-100"
                    leave-to="opacity-0"
                >
                    <div class="fixed inset-0 bg-black/80 backdrop-blur-sm" />
                </TransitionChild>

                <div class="fixed inset-0 overflow-y-auto">
                    <div class="flex min-h-full items-center justify-center p-4 text-center">
                        <TransitionChild
                            as="template"
                            enter="duration-300 ease-out"
                            enter-from="opacity-0 scale-95"
                            enter-to="opacity-100 scale-100"
                            leave="duration-200 ease-in"
                            leave-from="opacity-100 scale-100"
                            leave-to="opacity-0 scale-95"
                        >
                            <DialogPanel class="w-full max-w-md transform overflow-hidden rounded-2xl bg-surface border border-white/10 p-6 text-left align-middle shadow-xl transition-all">
                                <DialogTitle as="h3" class="text-lg font-bold leading-6 text-text-primary mb-4">
                                    {{ editingGoal ? 'Edit Goal' : 'Create New Goal' }}
                                </DialogTitle>

                                <div class="space-y-4">
                                    <div>
                                        <label class="block text-sm font-medium text-text-secondary mb-1">Goal Title</label>
                                        <Input v-model="form.title" placeholder="e.g. New Camera Lens" auto-focus />
                                    </div>

                                    <div>
                                        <label class="block text-sm font-medium text-text-secondary mb-1">Target Amount ($)</label>
                                        <Input v-model="form.targetAmount" type="number" placeholder="500" min="1" />
                                    </div>

                                    <div>
                                        <label class="block text-sm font-medium text-text-secondary mb-1">Description (Optional)</label>
                                        <Textarea v-model="form.description" placeholder="Explain why you are raising this money..." />
                                    </div>
                                </div>

                                <div class="mt-6 flex justify-end gap-3">
                                    <Button variant="ghost" @click="showCreateModal = false">Cancel</Button>
                                    <Button :disabled="submitting" @click="handleSubmit">
                                        <span v-if="submitting" class="animate-spin mr-2">⏳</span>
                                        {{ editingGoal ? 'Update Goal' : 'Create Goal' }}
                                    </Button>
                                </div>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </TransitionRoot>
    </div>
</template>

<script lang="ts">
import { TransitionRoot, TransitionChild, Dialog, DialogPanel, DialogTitle } from '@headlessui/vue'
</script>
