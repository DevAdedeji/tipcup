<script setup lang="ts">
import Modal from '~/components/ui/Modal.vue'
import Button from '~/components/ui/Button.vue'
import Input from '~/components/ui/Input.vue'
import Select from '~/components/ui/Select.vue'
import AmountInput from '~/components/ui/AmountInput.vue'
import BankModal from '~/components/dashboard/BankModal.vue'
import { ref, computed, onMounted, watch } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { useBankDetails } from '~/composables/useBankDetails'
import { formatCurrency, MIN_WITHDRAWAL_AMOUNT } from '~/utils/format'

const props = defineProps<{
    isOpen: boolean
}>()

const emit = defineEmits(['close', 'success'])

const { user, userProfile, getIdToken } = useAuth()
const { accounts, fetchAccounts, loading: banksLoading } = useBankDetails()
const toast = useToast()

const amount = ref<number | string>(0)
const selectedBankId = ref<string>('')
const submitting = ref(false)
const showBankModal = ref(false)

const currentBalance = computed(() => userProfile.value?.currentBalance || 0)
const validAmount = computed(() => {
    const val = typeof amount.value === 'string' ? parseFloat(amount.value) : amount.value
    return (val || 0) >= MIN_WITHDRAWAL_AMOUNT && (val || 0) <= currentBalance.value
})

onMounted(() => {
    fetchAccounts()
})

// Set default bank if available
watch(() => accounts.value, (newAccounts) => {
    if (newAccounts && newAccounts.length > 0 && !selectedBankId.value) {
        const primary = newAccounts.find(a => a.isPrimary)
        selectedBankId.value = (primary ? primary.id : newAccounts[0]?.id) || ''
    }
}, { immediate: true })

const handleBankAdded = () => {
    showBankModal.value = false
    fetchAccounts()
}

const handleWithdraw = async () => {
    if (!validAmount.value || !selectedBankId.value) return

    const selectedBank = accounts.value.find(a => a.id === selectedBankId.value)
    if (!selectedBank) return

    submitting.value = true
    try {
        // The server identifies the creator from this token, not from a
        // user id in the body.
        const token = await getIdToken()

        const response: any = await $fetch('/api/bachs/withdraw', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: {
                amount: Number(amount.value),
                bankAccountId: selectedBank.id
            }
        })

        if (!response || response.status !== 'success') {
            throw new Error(response?.message || 'Withdrawal failed')
        }

        toast.add({ title: 'Success', description: 'Withdrawal initiated successfully!', type: 'success' })
        emit('success')
        emit('close')
        amount.value = 0
    } catch (e: any) {
        const description =
            e.data?.statusMessage || e.statusMessage || e.message || 'Failed to process withdrawal.'
        toast.add({ title: 'Withdrawal failed', description, type: 'error' })
    } finally {
        submitting.value = false
    }
}
</script>

<template>
    <Modal
        :isOpen="isOpen"
        title="Withdraw"
        description="Money moves to your bank account."
        @close="$emit('close')"
    >
        <div class="space-y-5">
            <div class="border border-border bg-surface-sunken px-4 py-5 text-center">
                <p class="field-label">Available balance</p>
                <p class="amount mt-1 text-3xl font-bold tracking-tight">
                    {{ formatCurrency(currentBalance) }}
                </p>
            </div>

            <div>
                <AmountInput v-model="amount" label="Amount" :min="MIN_WITHDRAWAL_AMOUNT" />
                <div class="mt-1.5 flex items-center justify-between text-xs">
                    <span class="text-text-tertiary">
                        Minimum {{ formatCurrency(MIN_WITHDRAWAL_AMOUNT) }}
                    </span>
                    <button
                        type="button"
                        class="font-medium text-accent hover:underline"
                        @click="amount = currentBalance"
                    >
                        Use full balance
                    </button>
                </div>
            </div>

            <div>
                <label class="mb-1.5 block text-sm font-medium">Destination</label>

                <Select
                    v-if="!banksLoading && accounts.length > 0"
                    v-model="selectedBankId"
                    :options="accounts.map(a => ({
                        value: a.id,
                        label: `${a.bankName} — ${a.accountNumber}`
                    }))"
                    placeholder="Select an account"
                />

                <p v-else-if="banksLoading" class="text-sm text-text-secondary">Loading accounts…</p>

                <div
                    v-else
                    class="flex flex-wrap items-center justify-between gap-3 border border-error/30 bg-error-muted px-3 py-2.5 text-sm text-error"
                >
                    <span>No payout account yet.</span>
                    <Button size="sm" variant="outline" @click="showBankModal = true">Add one</Button>
                </div>
            </div>

            <p class="text-xs text-text-tertiary">
                A flat {{ formatCurrency(100) }} payout fee is deducted by Bachs.
            </p>
        </div>

        <template #footer>
            <Button variant="ghost" @click="$emit('close')">Cancel</Button>
            <Button
                :disabled="!validAmount || !selectedBankId || submitting"
                :loading="submitting"
                @click="handleWithdraw"
            >
                Withdraw
            </Button>
        </template>
    </Modal>

    <BankModal :isOpen="showBankModal" @close="showBankModal = false" @success="handleBankAdded" />
</template>
