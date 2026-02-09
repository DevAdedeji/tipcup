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
            // Assuming a top-level 'payments' collection where 'toUserId' matches current user
            // Indexing might be required: 'toUserId' Asc/Desc, 'createdAt' Desc
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
                // Format timestamp if needed, or do it in the component
                date: doc.data().createdAt ? new Date(doc.data().createdAt.seconds * 1000).toLocaleDateString() : 'Just now'
            }))
        } catch (e) {
            console.error('Error fetching payments:', e)
            // Fallback to empty if error (e.g. missing index) or simple mock for now if requested
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
