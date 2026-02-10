import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore'
import { db } from '~/firebase'
import { useAuth } from './useAuth'

export const usePayments = () => {
    const { user } = useAuth()
    const loading = useState('paymentsLoading', () => false)
    const payments = useState<any[]>('payments', () => [])

    const fetchRecentPayments = async (limitCount = 5) => {
        if (!user.value) return

        loading.value = true
        try {
            const paymentsRef = collection(db, 'payments')
            const q = query(
                paymentsRef,
                where('toUserId', '==', user.value.uid),
                orderBy('createdAt', 'desc'),
                limit(limitCount)
            )

            const snapshot = await getDocs(q)
            payments.value = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                date: doc.data().createdAt ? new Date(doc.data().createdAt.seconds * 1000).toLocaleDateString() : 'Just now'
            }))
        } catch (e) {
            console.error('Error fetching payments:', e)
        } finally {
            loading.value = false
        }
    }

    return {
        payments,
        loading,
        fetchRecentPayments
    }
}
