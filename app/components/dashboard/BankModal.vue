<script setup lang="ts">
import { useBankDetails } from '~/composables/useBankDetails'
import Modal from '~/components/ui/Modal.vue'
import Button from '~/components/ui/Button.vue'
import Input from '~/components/ui/Input.vue'
import Select from '~/components/ui/Select.vue'

const props = defineProps<{
    isOpen: boolean
}>()

const emit = defineEmits(['close', 'success'])

const { addAccount, error: bankError, fetchBanks, resolveAccount } = useBankDetails()

const loading = ref(false)
const listLoading = ref(false)
const banks = ref<{ label: string, value: string }[]>([])

const form = reactive({
    bankCode: '',
    accountNumber: '',
    accountName: ''
})

const error = ref('')

// Fetch banks on mount
onMounted(async () => {
    listLoading.value = true
    try {
        const response: any = await fetchBanks()
        if (response && response.status === 'success' && Array.isArray(response.data)) {
            banks.value = response.data.map((b: any) => ({
                label: b.name,
                value: b.code
            }))
            // Auto-select Access Bank for test mode
            const accessBank = banks.value.find((b: any) => b.value === '044' || b.label.toLowerCase().includes('access'))
            if (accessBank) {
                form.bankCode = accessBank.value
                form.accountNumber = '0690000032'
            }
        }
    } catch (e) {
        console.error('Failed to load banks', e)
    } finally {
        listLoading.value = false
    }
})

const resolveLoading = ref(false)

const handleResolve = async () => {
    if (form.accountNumber.length !== 10 || !form.bankCode) return

    resolveLoading.value = true
    error.value = ''
    form.accountName = ''

    try {
        const result = await resolveAccount(form.accountNumber, form.bankCode)
        if (result && result.account_name) {
             form.accountName = result.account_name
        } else {
             error.value = 'Could not resolve account name'
        }
    } catch (e: any) {
        console.error(e)
        error.value = e.statusMessage || 'Could not verify account name'
    } finally {
        resolveLoading.value = false
    }
}

// Watch for changes to trigger resolution
watch(() => [form.accountNumber, form.bankCode], () => {
    if (form.accountNumber.length === 10 && form.bankCode) {
        handleResolve()
    } else {
        form.accountName = ''
        error.value = ''
    }
})


const handleSubmit = async () => {
    if (!form.accountName) return

    loading.value = true
    error.value = ''

    try {
        const bank = banks.value.find(b => b.value === form.bankCode)
        const success = await addAccount({
            bankName: bank?.label || 'Unknown Bank',
            accountNumber: form.accountNumber,
            accountName: form.accountName,
            bank_code: form.bankCode
        })

        if (success) {
            emit('success')
            // Reset form
            form.bankCode = ''
            form.accountNumber = ''
            form.accountName = ''
             emit('close')
        } else {
            error.value = bankError.value || 'Failed to add account'
        }
    } catch (e) {
        console.error(e)
        error.value = 'An error occurred'
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <Modal
        :isOpen="isOpen"
        title="Add payout account"
        description="Where your withdrawals will land."
        @close="$emit('close')"
    >
        <form class="space-y-4" @submit.prevent="handleSubmit">
            <Select
                v-model="form.bankCode"
                label="Bank"
                placeholder="Select a bank"
                :options="banks"
                :disabled="listLoading"
                searchable
            />

            <Input
                v-model="form.accountNumber"
                label="Account number"
                inputmode="numeric"
                maxlength="10"
                placeholder="0123456789"
            />

            <p v-if="resolveLoading" class="flex items-center gap-2 text-sm text-text-secondary">
                <span class="h-3.5 w-3.5 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                Verifying account…
            </p>

            <div v-else-if="form.accountName" class="border border-success/30 bg-success-muted px-4 py-3">
                <p class="field-label text-success">Account name</p>
                <p class="mt-0.5 font-semibold text-success">{{ form.accountName }}</p>
            </div>

            <p v-if="error" role="alert" class="border border-error/30 bg-error-muted px-3 py-2 text-sm text-error">
                {{ error }}
            </p>
        </form>

        <template #footer>
            <Button variant="ghost" @click="$emit('close')">Cancel</Button>
            <Button
                :loading="loading"
                :disabled="!form.accountName || resolveLoading"
                @click="handleSubmit"
            >
                Save account
            </Button>
        </template>
    </Modal>
</template>
