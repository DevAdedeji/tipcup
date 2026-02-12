import { collection, query, where, orderBy, limit, onSnapshot, getDocs, startAfter } from 'firebase/firestore'
import { db } from '~/firebase'
import { useAuth } from './useAuth'

export const useWithdrawals = () => {
    const { user } = useAuth()
    const loading = useState('withdrawalsLoading', () => false)
    const withdrawals = useState<any[]>('withdrawals', () => [])

    // Page-based pagination state
    const paginatedWithdrawals = useState<any[]>('paginatedWithdrawals', () => [])
    const currentPage = useState<number>('withdrawalsCurrentPage', () => 1)
    const cursorStack = useState<any[]>('withdrawalsCursorStack', () => [null])
    const itemsPerPage = 5
    const hasNextPage = useState<boolean>('withdrawalsHasNextPage', () => true)
    const hasPrevPage = computed(() => currentPage.value > 1)

    const fetchRecentWithdrawals = (limitCount = 5) => {
        if (!user.value) return

        loading.value = true
        const withdrawalsRef = collection(db, 'withdrawals')
        const q = query(
            withdrawalsRef,
            where('userId', '==', user.value.uid),
            orderBy('createdAt', 'desc'),
            limit(limitCount)
        )

        const unsubscribe = onSnapshot(q, (snapshot) => {
            withdrawals.value = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                date: doc.data().createdAt ? new Date(doc.data().createdAt.seconds * 1000).toLocaleDateString() : 'Just now'
            }))
            loading.value = false
        }, (error) => {
            console.error('Error fetching withdrawals:', error)
            loading.value = false
        })

        return unsubscribe
    }

    let unsubscribePaginated: (() => void) | undefined

    const fetchWithdrawalsPage = async (direction: 'next' | 'prev' | 'first' = 'first') => {
        if (!user.value) return

        loading.value = true

        try {
            // Unsubscribe from previous listener if exists
            if (unsubscribePaginated) {
                unsubscribePaginated()
            }

            const withdrawalsRef = collection(db, 'withdrawals')
            let q = query(
                withdrawalsRef,
                where('userId', '==', user.value.uid),
                orderBy('createdAt', 'desc'),
                limit(itemsPerPage)
            )

            // Calculate cursor based on direction
            let cursor = null

            if (direction === 'first') {
                currentPage.value = 1
                cursorStack.value = [null]
                cursor = null
            } else if (direction === 'next') {
                // Cursor is the last doc of current page
                if (paginatedWithdrawals.value.length > 0) {
                    const lastDoc = paginatedWithdrawals.value[paginatedWithdrawals.value.length - 1].doc
                    cursor = lastDoc
                    // Ensure we don't push duplicates
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
                paginatedWithdrawals.value = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    date: doc.data().createdAt ? new Date(doc.data().createdAt.seconds * 1000).toLocaleDateString() : 'Just now',
                    doc: doc
                }))

                // Update hasNextPage
                hasNextPage.value = snapshot.docs.length === itemsPerPage
                loading.value = false
            }, (error) => {
                console.error('Error fetching paginated withdrawals:', error)
                loading.value = false
            })

        } catch (error) {
            console.error('Error setting up withdrawals listener:', error)
            loading.value = false
        }
    }

    return {
        withdrawals,
        paginatedWithdrawals,
        loading,
        currentPage,
        hasNextPage,
        hasPrevPage,
        fetchRecentWithdrawals,
        fetchWithdrawalsPage
    }
}
