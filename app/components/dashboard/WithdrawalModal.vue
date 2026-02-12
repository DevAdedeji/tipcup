<script setup lang="ts">
import Modal from '~/components/ui/Modal.vue'
import Button from '~/components/ui/Button.vue'
import Input from '~/components/ui/Input.vue'
import Select from '~/components/ui/Select.vue'
import BankModal from '~/components/dashboard/BankModal.vue'
import { ref, computed, onMounted, watch } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { useBankDetails } from '~/composables/useBankDetails'
import { formatCurrency } from '~/utils/format'

const props = defineProps<{
    isOpen: boolean
}>()

const emit = defineEmits(['close', 'success'])

const { user, userProfile } = useAuth()
const { accounts, fetchAccounts, loading: banksLoading } = useBankDetails()
const toast = useToast()

const amount = ref<string>('')
const selectedBankId = ref<string>('')
const submitting = ref(false)
const showBankModal = ref(false)

const currentBalance = computed(() => userProfile.value?.currentBalance || 0)
const validAmount = computed(() => {
    const val = parseFloat(amount.value)
    return !isNaN(val) && val >= 1000 && val <= currentBalance.value
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
        const response: any = await $fetch('/api/paystack/withdraw', {
            method: 'POST',
            body: {
                userId: user.value?.uid,
                amount: parseFloat(amount.value),
                recipientCode: selectedBank.recipient_code
            }
        })

        if (!response || response.status !== 'success') {
            throw new Error(response?.message || 'Withdrawal failed')
        }

        toast.add({ title: 'Success', description: 'Withdrawal initiated successfully!', type: 'success' })
        emit('success')
        emit('close')
        amount.value = ''
    } catch (e: any) {
        toast.add({ title: 'Error', description: e.message || 'Failed to process withdrawal.', type: 'error' })
    } finally {
        submitting.value = false
    }
}
</script>

<template>
    <Modal :isOpen="isOpen" @close="$emit('close')" title="Request Payout">
        <div class="space-y-6">
            <div class="bg-primary/10 text-center flex flex-col items-center justify-center p-4 rounded-xl border border-border">
                <div class="text-sm text-text-secondary mb-1">Available Balance</div>
                <div class="text-3xl font-bold text-primary">{{ formatCurrency(currentBalance) }}</div>
            </div>

            <!-- Manual Processing Notice -->
             <div class="bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg flex items-start gap-3">
                <div class="p-1 bg-blue-500 rounded-full mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                </div>
                <div class="text-sm text-blue-200">
                    <span class="font-bold block text-blue-100">Manual Processing</span>
                    Your payout request will be processed manually within 24-48 hours.
                </div>
            </div>

            <div>
                <label class="block text-sm font-medium mb-2">Amount to Withdraw</label>
                <div class="relative">
                     <span class="absolute left-3 top-2.5 text-text-secondary">₦</span>
                    <Input
                        v-model="amount"
                        type="number"
                        placeholder="0.00"
                        class="pl-8"
                        :min="1000"
                        :max="currentBalance"
                    />
                </div>
                <div class="flex justify-between mt-1 text-xs text-text-secondary">
                    <span>Min: ₦1,000</span>
                    <button
                        @click="amount = currentBalance.toString()"
                        class="text-primary hover:underline"
                    >
                        Max: {{ formatCurrency(currentBalance) }}
                    </button>
                </div>
            </div>

            <div>
                <label class="block text-sm font-medium mb-2">Select Bank Account</label>
                <Select
                    v-if="!banksLoading && accounts.length > 0"
                    v-model="selectedBankId"
                    :options="accounts.map(a => ({
                        value: a.id,
                        label: `${a.bankName} - ${a.accountNumber} (${a.accountName})`
                    }))"
                    placeholder="Select Bank"
                />
                <div v-else-if="banksLoading" class="text-sm text-text-secondary">Loading accounts...</div>
                <div v-else class="flex items-center justify-between text-sm text-red-500 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                    <span>No bank accounts found.</span>
                    <Button size="sm" variant="outline" class="text-xs h-8" @click="showBankModal = true">
                        Add Bank
                    </Button>
                </div>
            </div>

            <div class="pt-4 flex justify-end gap-3">
                <Button variant="ghost" @click="$emit('close')">Cancel</Button>
                <Button
                    @click="handleWithdraw"
                    :disabled="!validAmount || !selectedBankId || submitting"
                    :loading="submitting"
                >
                    {{ submitting ? 'Processing...' : 'Submit Request' }}
                </Button>
            </div>
        </div>
    </Modal>

    <BankModal
        :isOpen="showBankModal"
        @close="showBankModal = false"
        @success="handleBankAdded"
    />
</template>
