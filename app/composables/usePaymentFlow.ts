export const usePaymentFlow = () => {
    const { user, userProfile } = useAuth()
    const toast = useToast()
    const processingPayment = ref(false)
    const verifyingPayment = ref(false)

    const initiatePayment = async ({
        email,
        amount,
        toUserId,
        goalId,
        tier,
        message
    }: {
        email: string
        amount: number
        toUserId: string
        goalId?: string
        tier: any
        message: string
    }) => {
        if (!email) {
            toast.add({ title: 'Email Required', description: 'Please enter your email address.', type: 'error' })
            return
        }

        processingPayment.value = true
        try {
            const initData: any = await $fetch('/api/flutterwave/initialize', {
                method: 'POST',
                body: {
                    email,
                    amount,
                    callback_url: window.location.href,
                    metadata: {
                        toUserId,
                        goalId,
                        tier,
                        message,
                        fromUserId: user.value?.uid,
                        fromName: user.value?.displayName || userProfile.value?.displayName || 'Anonymous'
                    }
                }
            })

            if (initData && initData.authorization_url) {
                window.location.href = initData.authorization_url
            } else {
                throw new Error('Initialization failed')
            }
        } catch (e: any) {
            console.error(e)
            const msg = e.statusMessage || e.message || 'Could not start payment.'
            toast.add({ title: 'Error', description: msg, type: 'error' })
        } finally {
            processingPayment.value = false
        }
    }

    const verifyPayment = async (transactionId: string) => {
        verifyingPayment.value = true
        try {
            const data: any = await $fetch('/api/flutterwave/verify', {
                method: 'POST',
                body: { transaction_id: transactionId }
            })

            if (data.status === 'success') {
                return true
            } else {
                toast.add({ title: 'Verification Failed', description: 'Payment verification failed.', type: 'warning' })
                return false
            }
        } catch (e) {
            console.error('Verify error', e)
            toast.add({ title: 'Error', description: 'Failed to verify payment.', type: 'error' })
            return false
        } finally {
            verifyingPayment.value = false
        }
    }

    const checkPaymentCallback = async () => {
        const route = useRoute()
        const router = useRouter()
        const { status, transaction_id } = route.query

        if (status && (status === 'successful' || status === 'completed') && transaction_id) {
            const success = await verifyPayment(transaction_id as string)
            if (success) {
                // Clear query params
                router.replace({ query: {} })
                return { status: 'success', transactionId: transaction_id }
            }
        } else if (status === 'cancelled') {
            toast.add({ title: 'Payment Cancelled', description: 'You cancelled the payment.', type: 'info' })
            router.replace({ query: {} })
            return { status: 'cancelled' }
        }
        return null
    }

    return {
        processingPayment,
        verifyingPayment,
        initiatePayment,
        verifyPayment,
        checkPaymentCallback
    }
}
