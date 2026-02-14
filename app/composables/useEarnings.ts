import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore'
import { db } from '~/firebase'
import { useAuth } from '~/composables/useAuth'

export const useEarnings = () => {
    const { user } = useAuth()
    const chartData = ref<any[]>([])
    const chartLoading = ref(false)
    let unsubscribe: (() => void) | undefined

    const useEarningsChart = (limitCount: number = 50) => {
        if (!user.value) return

        chartLoading.value = true
        try {
            const paymentsRef = collection(db, 'payments')
            const q = query(
                paymentsRef,
                where('toUserId', '==', user.value.uid),
                orderBy('createdAt', 'desc'),
                limit(limitCount)
            )

            unsubscribe = onSnapshot(q, (snapshot) => {
                chartData.value = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }))
                chartLoading.value = false
            }, (error) => {
                console.error('Failed to fetch chart data', error)
                chartLoading.value = false
            })
        } catch (e) {
            console.error('Failed to setup chart listener', e)
            chartLoading.value = false
        }

        return unsubscribe
    }

    onUnmounted(() => {
        if (unsubscribe) {
            unsubscribe()
        }
    })

    return {
        chartData,
        chartLoading,
        useEarningsChart
    }
}
