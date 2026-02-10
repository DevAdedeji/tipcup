import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore'
import { db } from '~/firebase'
import { useAuth } from './useAuth'

export const usePayments = () => {
    const { user } = useAuth()
    const loading = useState('paymentsLoading', () => false)
    const payments = useState<any[]>('payments', () => [])

    const fetchRecentPayments = (limitCount = 5) => {
        if (!user.value) return

        loading.value = true
        const paymentsRef = collection(db, 'payments')
        const q = query(
            paymentsRef,
            where('toUserId', '==', user.value.uid),
            orderBy('createdAt', 'desc'),
            limit(limitCount)
        )

        // Set up real-time listener
        const unsubscribe = onSnapshot(q, (snapshot) => {
            payments.value = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                date: doc.data().createdAt ? new Date(doc.data().createdAt.seconds * 1000).toLocaleDateString() : 'Just now'
            }))
            loading.value = false
        }, (error) => {
            console.error('Error fetching payments:', error)
            loading.value = false
        })

        return unsubscribe
    }

    return {
        payments,
        loading,
        fetchRecentPayments
    }
}
