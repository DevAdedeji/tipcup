<script setup lang="ts">
import { useGoals, type Goal } from '~/composables/useGoals'
import { TransitionRoot, TransitionChild, Dialog, DialogPanel, DialogTitle } from '@headlessui/vue'

const props = defineProps<{
    isOpen: boolean
    goalToEdit: Goal | null
}>()

const emit = defineEmits<{
    (e: 'close'): void
    (e: 'saved'): void
}>()

const { createGoal, updateGoal } = useGoals()
const toast = useToast()

const form = reactive({
    title: '',
    description: '',
    targetAmount: ''
})

watch(() => props.goalToEdit, (newGoal) => {
    if (newGoal) {
        form.title = newGoal.title
        form.description = newGoal.description
        form.targetAmount = newGoal.targetAmount.toString()
    } else {
        form.title = ''
        form.description = ''
        form.targetAmount = ''
    }
}, { immediate: true })

const submitting = ref(false)

const handleSubmit = async () => {
    if (!form.title || !form.targetAmount) {
        toast.add({ title: 'Error', description: 'Please fill in all required fields.', type: 'error' })
        return
    }

    submitting.value = true
    try {
        if (props.goalToEdit) {
            await updateGoal(props.goalToEdit.id, {
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
        emit('saved')
        emit('close')
    } catch (e) {
        toast.add({ title: 'Error', description: 'Something went wrong.', type: 'error' })
    } finally {
        submitting.value = false
    }
}
</script>

<template>
    <TransitionRoot appear :show="isOpen" as="template">
        <Dialog as="div" @close="$emit('close')" class="relative z-50">
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
                                {{ goalToEdit ? 'Edit Goal' : 'Create New Goal' }}
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
                                <Button variant="ghost" @click="$emit('close')">Cancel</Button>
                                <Button :loading="submitting" @click="handleSubmit">
                                    {{ goalToEdit ? 'Update Goal' : 'Create Goal' }}
                                </Button>
                            </div>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </div>
        </Dialog>
    </TransitionRoot>
</template>
