import { collection, query, where, orderBy, limit, onSnapshot, getDocs, startAfter, type DocumentData, type QueryDocumentSnapshot } from 'firebase/firestore'
import { db } from '~/firebase'
import { useAuth } from './useAuth'

export const usePayments = () => {
    const { user } = useAuth()
    const loading = useState('paymentsLoading', () => false)
    const payments = useState<any[]>('payments', () => [])

    // Page-based pagination state
    const paginatedPayments = useState<any[]>('paginatedPayments', () => [])
    const currentPage = useState<number>('paymentsCurrentPage', () => 1)
    const cursorStack = useState<any[]>('paymentsCursorStack', () => [null])
    const itemsPerPage = 5
    const hasNextPage = useState<boolean>('paymentsHasNextPage', () => true)
    const hasPrevPage = computed(() => currentPage.value > 1)

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

    let unsubscribePaginated: (() => void) | undefined

    const fetchPaymentsPage = async (direction: 'next' | 'prev' | 'first' = 'first') => {
        if (!user.value) return

        loading.value = true

        try {
            // Unsubscribe from previous listener if exists
            if (unsubscribePaginated) {
                unsubscribePaginated()
            }

            const paymentsRef = collection(db, 'payments')
            let q = query(
                paymentsRef,
                where('toUserId', '==', user.value.uid),
                orderBy('createdAt', 'desc'),
                limit(itemsPerPage)
            )

            // Calculate cursor based on direction
            let cursor = null;

            if (direction === 'first') {
                currentPage.value = 1
                cursorStack.value = [null]
                cursor = null
            } else if (direction === 'next') {
                // Cursor is the last doc of current page
                if (paginatedPayments.value.length > 0) {
                    const lastDoc = paginatedPayments.value[paginatedPayments.value.length - 1].doc
                    cursor = lastDoc
                    if (cursorStack.value.length === currentPage.value) {
                        cursorStack.value.push(cursor)
                    }
                    currentPage.value++
                }
            } else if (direction === 'prev') {
                if (currentPage.value > 1) {
                    currentPage.value--
                    cursor = cursorStack.value[currentPage.value - 1]
                }
            }

            // Apply cursor if exists
            if (cursor) {
                q = query(q, startAfter(cursor))
            }

            unsubscribePaginated = onSnapshot(q, (snapshot) => {
                paginatedPayments.value = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    date: doc.data().createdAt ? new Date(doc.data().createdAt.seconds * 1000).toLocaleDateString() : 'Just now',
                    doc: doc
                }))

                hasNextPage.value = snapshot.docs.length === itemsPerPage
                loading.value = false
            }, (error) => {
                console.error('Error fetching paginated payments:', error)
                loading.value = false
            })

        } catch (error) {
            console.error('Error setting up payments listener:', error)
            loading.value = false
        }
    }

    return {
        payments,
        paginatedPayments,
        loading,
        currentPage,
        hasNextPage,
        hasPrevPage,
        fetchRecentPayments,
        fetchPaymentsPage
    }
}
