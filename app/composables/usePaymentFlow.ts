const processingPayment = ref(false)
const verifyingPayment = ref(false)

export const usePaymentFlow = () => {
    const { user, userProfile } = useAuth()
    const toast = useToast()

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
            toast.add({ title: 'Email required', description: 'Please enter your email address.', type: 'error' })
            return
        }

        processingPayment.value = true
        try {
            const supporterName =
                user.value?.displayName || userProfile.value?.displayName || 'Anonymous'

            const returnUrl = new URL(window.location.href)
            returnUrl.searchParams.delete('checkout_id')

            const session: any = await $fetch('/api/bachs/initialize', {
                method: 'POST',
                body: {
                    email,
                    name: supporterName,
                    amount,
                    successUrl: returnUrl.toString(),
                    cancelUrl: returnUrl.toString(),
                    metadata: {
                        toUserId,
                        goalId,
                        tier,
                        message,
                        fromUserId: user.value?.uid,
                        fromName: supporterName
                    }
                }
            })

            if (session?.checkout_url) {
                window.location.href = session.checkout_url
            } else {
                throw new Error('Could not start checkout')
            }
        } catch (e: any) {
            console.error(e)
            const msg = e.statusMessage || e.data?.statusMessage || e.message || 'Could not start payment.'
            toast.add({ title: 'Payment error', description: msg, type: 'error' })
        } finally {
            processingPayment.value = false
        }
    }

    const verifyPayment = async (checkoutId: string) => {
        verifyingPayment.value = true
        try {
            const data: any = await $fetch('/api/bachs/verify', {
                method: 'POST',
                body: { checkout_id: checkoutId }
            })

            if (data.status === 'success') return true

            toast.add({
                title: 'Payment processing',
                description: 'We are still confirming this payment. It will appear shortly.',
                type: 'info'
            })
            return false
        } catch (e) {
            console.error('Verify error', e)
            toast.add({ title: 'Error', description: 'Failed to confirm payment.', type: 'error' })
            return false
        } finally {
            verifyingPayment.value = false
        }
    }

    const checkPaymentCallback = async () => {
        const route = useRoute()
        const router = useRouter()
        const checkoutId = route.query.checkout_id as string | undefined

        if (!checkoutId) return null

        const success = await verifyPayment(checkoutId)
        router.replace({ query: {} })

        return success
            ? { status: 'success', checkoutId }
            : { status: 'pending', checkoutId }
    }

    return {
        processingPayment,
        verifyingPayment,
        initiatePayment,
        verifyPayment,
        checkPaymentCallback
    }
}
