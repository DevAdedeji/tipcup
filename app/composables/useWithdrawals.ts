import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore'
import { db } from '~/firebase'
import { useAuth } from './useAuth'

export const useWithdrawals = () => {
    const { user } = useAuth()
    const loading = useState('withdrawalsLoading', () => false)
    const withdrawals = useState<any[]>('withdrawals', () => [])

    const fetchWithdrawals = () => {
        if (!user.value) return

        loading.value = true
        const withdrawalsRef = collection(db, 'withdrawals')
        const q = query(
            withdrawalsRef,
            where('userId', '==', user.value.uid),
            orderBy('createdAt', 'desc')
        )

        const unsubscribe = onSnapshot(q, (snapshot) => {
            withdrawals.value = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                date: doc.data().createdAt ? new Date(doc.data().createdAt.seconds * 1000).toLocaleDateString() : 'Just now',
                // Add relative time or format properly
            }))
            loading.value = false
        }, (error) => {
            console.error('Error fetching withdrawals:', error)
            loading.value = false
        })

        return unsubscribe
    }

    return {
        withdrawals,
        loading,
        fetchWithdrawals
    }
}
