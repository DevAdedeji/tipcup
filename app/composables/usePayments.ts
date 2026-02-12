import { collection, query, where, orderBy, limit, onSnapshot, getDocs, startAfter, type DocumentData, type QueryDocumentSnapshot } from 'firebase/firestore'
import { db } from '~/firebase'
import { useAuth } from './useAuth'

export const usePayments = () => {
    const { user } = useAuth()
    const loading = useState('paymentsLoading', () => false)
    const payments = useState<any[]>('payments', () => [])

    // Pagination state
    const paginatedPayments = useState<any[]>('paginatedPayments', () => [])
    const lastVisible = useState<QueryDocumentSnapshot<DocumentData> | null>('paymentsLastVisible', () => null)
    const hasMore = useState<boolean>('paymentsHasMore', () => true)
    const loadingMore = useState<boolean>('paymentsLoadingMore', () => false)

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

        // Set up real-time listener for dashboard (recent only)
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

    // Cursor-based pagination for full list
    const fetchPaymentsPage = async (isNext = false, pageSize = 5) => {
        if (!user.value) return

        if (!isNext) {
            loading.value = true
            lastVisible.value = null
            paginatedPayments.value = []
        } else {
            loadingMore.value = true
        }

        try {
            const paymentsRef = collection(db, 'payments')
            let q = query(
                paymentsRef,
                where('toUserId', '==', user.value.uid),
                orderBy('createdAt', 'desc'),
                limit(pageSize)
            )

            if (isNext && lastVisible.value) {
                q = query(q, startAfter(lastVisible.value))
            }

            const snapshot = await getDocs(q)

            const newPayments = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                date: doc.data().createdAt ? new Date(doc.data().createdAt.seconds * 1000).toLocaleDateString() : 'Just now'
            }))

            if (isNext) {
                paginatedPayments.value = [...paginatedPayments.value, ...newPayments]
            } else {
                paginatedPayments.value = newPayments
            }

            lastVisible.value = snapshot.docs[snapshot.docs.length - 1] || null
            hasMore.value = snapshot.docs.length === pageSize

        } catch (error) {
            console.error('Error fetching paginated payments:', error)
        } finally {
            loading.value = false
            loadingMore.value = false
        }
    }

    return {
        payments,
        paginatedPayments,
        loading,
        loadingMore,
        hasMore,
        fetchRecentPayments,
        fetchPaymentsPage
    }
}
