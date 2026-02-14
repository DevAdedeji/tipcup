<script setup lang="ts">
import { useGoals, type Goal } from '~/composables/useGoals'
import Modal from '~/components/ui/Modal.vue'

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
             toast.add({ title: 'Success', description: 'Goal updated successfully!', type: 'success' })
        } else {
            await createGoal({
                title: form.title,
                description: form.description,
                targetAmount: Number(form.targetAmount)
            })
             toast.add({ title: 'Success', description: 'Goal created successfully!', type: 'success' })
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
    <Modal
        :isOpen="isOpen"
        :title="goalToEdit ? 'Edit Goal' : 'Create New Goal'"
        @close="$emit('close')"
    >
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

        <template #footer>
            <Button variant="ghost" @click="$emit('close')">Cancel</Button>
            <Button :loading="submitting" @click="handleSubmit">
                {{ goalToEdit ? 'Update Goal' : 'Create Goal' }}
            </Button>
        </template>
    </Modal>
</template>
