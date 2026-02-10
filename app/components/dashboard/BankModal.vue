<script setup lang="ts">
import Modal from '~/components/ui/Modal.vue'
import { useBankDetails } from '~/composables/useBankDetails'
import { ref, reactive, watch, onMounted, computed } from 'vue'
import Button from '~/components/ui/Button.vue'
import Input from '~/components/ui/Input.vue'
import Select from '~/components/ui/Select.vue'

const props = defineProps<{
    isOpen: boolean
}>()

const emit = defineEmits(['close'])

const { addAccount } = useBankDetails()
const toast = useToast()

const bankForm = reactive({
    bankName: '',
    bankCode: '',
    accountNumber: '',
    accountName: ''
})
const bankSubmitting = ref(false)
const verifyingAccount = ref(false)
const banks = ref<any[]>([])
const loadingBanks = ref(false)

// Fetch Banks
onMounted(async () => {
    loadingBanks.value = true
    try {
        const data = await $fetch<any>('/api/paystack/banks')
        if (data && data.status === 'success') {
            banks.value = data.data
        }
    } catch (e) {
        console.error('Failed to fetch banks', e)
    } finally {
        loadingBanks.value = false
    }
})

const bankOptions = computed(() => {
    return banks.value.map(bank => ({
        label: bank.name,
        value: bank.code
    }))
})

watch(() => bankForm.bankCode, (newCode) => {
    const bank = banks.value.find(b => b.code === newCode)
    bankForm.bankName = bank ? bank.name : ''
})

// Resolve Account
const resolveAccount = async () => {
    if (bankForm.accountNumber.length < 10 || !bankForm.accountNumber) return
    if (!bankForm.bankCode) return

    verifyingAccount.value = true
    bankForm.accountName = ''

    try {
        const { data } = await $fetch<any>('/api/paystack/resolve', {
            params: {
                account_number: bankForm.accountNumber,
                bank_code: bankForm.bankCode
            }
        })

        if (data.value && data.value.status === 'success') {
            bankForm.accountName = data.value.data.account_name
        } else {
            toast.add({ title: 'Invalid Account', description: 'Could not resolve account details.', type: 'error' })
        }
    } catch (e) {
        toast.add({ title: 'Error', description: 'Failed to resolve account.', type: 'error' })
    } finally {
        verifyingAccount.value = false
    }
}

let resolveTimer: NodeJS.Timeout | null = null

watch(() => [bankForm.accountNumber, bankForm.bankCode], () => {
    if (resolveTimer) {
        clearTimeout(resolveTimer)
    }

    bankForm.accountName = ''

    if (bankForm.accountNumber.length === 10 && bankForm.bankCode) {
        resolveTimer = setTimeout(() => {
            resolveAccount()
        }, 800)
    }
})

const handleAddBank = async () => {
    if (!bankForm.bankCode || !bankForm.accountNumber || !bankForm.accountName) {
         toast.add({ title: 'Missing Details', description: 'Please ensure all fields are filled and valid.', type: 'warning' })
         return
    }

    bankSubmitting.value = true

    // Create Recipient
    try {
        const { data } = await $fetch<any>('/api/paystack/recipient', {
            method: 'POST',
            body: {
                name: bankForm.accountName,
                account_number: bankForm.accountNumber,
                bank_code: bankForm.bankCode
            }
        })

        if (data.value && data.value.status === 'success') {
            const recipientCode = data.value.data.recipient_code

            // Add to Firestore
             const success = await addAccount({
                bankName: bankForm.bankName,
                accountNumber: bankForm.accountNumber,
                accountName: bankForm.accountName,
                bank_code: bankForm.bankCode,
                recipient_code: recipientCode
            })

            if (success) {
                toast.add({ title: 'Success', description: 'Bank account added successfully!' })
                emit('close')
                // Reset form
                bankForm.bankName = ''
                bankForm.bankCode = ''
                bankForm.accountNumber = ''
                bankForm.accountName = ''
            } else {
                toast.add({ title: 'Error', description: 'Failed to save bank account', type: 'error' })
            }
        } else {
             toast.add({ title: 'Error', description: 'Failed to create transfer recipient.', type: 'error' })
        }

    } catch (e) {
         toast.add({ title: 'Error', description: 'Values could not be verified.', type: 'error' })
    } finally {
        bankSubmitting.value = false
    }
}

const handleClose = () => {
    emit('close')
}
</script>

<template>
    <Modal
        :isOpen="isOpen"
        title="Add Payout Method"
        @close="handleClose"
    >
        <div class="space-y-4">
            <div>
                <div v-if="loadingBanks" class="text-sm text-text-secondary h-10 flex items-center">Loading banks...</div>
                <Select
                    v-else
                    v-model="bankForm.bankCode"
                    :options="bankOptions"
                    label="Bank Name"
                    placeholder="Select a bank"
                />
            </div>

            <div>
                <label class="block text-sm font-medium text-text-secondary mb-1">Account Number</label>
                <Input v-model="bankForm.accountNumber" placeholder="User Account Number" maxlength="10" />
            </div>

            <div>
                <label class="block text-sm font-medium text-text-secondary mb-1">Account Name</label>
                <div class="relative">
                    <Input v-model="bankForm.accountName" placeholder="Fetched automatically..." disabled class="opacity-70 cursor-not-allowed bg-black/5" />
                    <div v-if="verifyingAccount" class="absolute right-3 top-2.5">
                        <div class="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                    </div>
                </div>
            </div>
        </div>

        <template #footer>
            <Button variant="ghost" @click="handleClose">Cancel</Button>
            <Button :loading="bankSubmitting" @click="handleAddBank">
                Add Account
            </Button>
        </template>
    </Modal>
</template>
