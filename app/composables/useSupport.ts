import { formatCurrency } from '~/utils/format'
import { usePaymentFlow } from './usePaymentFlow'
import { useAuth } from './useAuth'

export const useSupport = () => {
    const toast = useToast()
    const { user } = useAuth()
    const { initiatePayment, processingPayment, verifyingPayment } = usePaymentFlow()

    const selectedTier = ref<any>(null)
    const supportMessage = ref('')
    const tipperEmail = ref('')

    const handleSupport = async (profile: any) => {
        if (!selectedTier.value) {
            toast.add({ title: 'Select a Tier', description: 'Please select an amount to support.', type: 'error' })
            return
        }

        const email = user.value?.email || tipperEmail.value

        await initiatePayment({
            email,
            amount: selectedTier.value.price,
            toUserId: profile.uid,
            goalId: profile.fundraisingGoal?.id,
            tier: selectedTier.value,
            message: supportMessage.value
        })
    }

    const tierLabel = computed(() => selectedTier.value ? formatCurrency(selectedTier.value.price) : '...')

    return {
        selectedTier,
        supportMessage,
        tipperEmail,
        handleSupport,
        processingPayment,
        verifyingPayment,
        tierLabel
    }
}
