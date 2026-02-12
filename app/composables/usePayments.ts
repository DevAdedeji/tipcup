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
    const cursorStack = useState<any[]>('paymentsCursorStack', () => [null]) // Stack of startAfter cursors. index 0 is null (page 1)
    const itemsPerPage = 5 // Configurable
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

    const fetchPaymentsPage = async (direction: 'next' | 'prev' | 'first' = 'first') => {
        if (!user.value) return

        loading.value = true

        try {
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
                    // Ensure we don't push duplicates if we rapid fire. Check if current page index matches stack length
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

            const snapshot = await getDocs(q)

            paginatedPayments.value = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                date: doc.data().createdAt ? new Date(doc.data().createdAt.seconds * 1000).toLocaleDateString() : 'Just now',
                doc: doc // Store doc for cursor
            }))

            // Update hasNextPage
            // We can check if we got full page. If less, then no more next.
            // Even if full, we might check one more ahead, but for simple UI, length < limit is enough.
            hasNextPage.value = snapshot.docs.length === itemsPerPage

        } catch (error) {
            console.error('Error fetching paginated payments:', error)
        } finally {
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
