import { collection, query, getDocs, deleteDoc, doc, Timestamp, onSnapshot, writeBatch } from 'firebase/firestore'
import { db } from '~/firebase'

export interface BankAccount {
    id: string
    bankName: string
    accountNumber: string
    accountName: string
    isPrimary: boolean
    recipient_code?: string
    bank_code?: string
    createdAt: any
}

export const useBankDetails = () => {
    const { user } = useAuth()
    const accounts = ref<BankAccount[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)

    const fetchAccounts = () => {
        if (!user.value) return

        loading.value = true
        const q = query(
            collection(db, 'users', user.value.uid, 'bank_accounts'),
        )

        const unsubscribe = onSnapshot(q, (snapshot) => {
            accounts.value = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as BankAccount[]
            loading.value = false
        }, (err) => {
            console.error(err)
            error.value = 'Failed to fetch bank accounts'
            loading.value = false
        })

        return unsubscribe
    }

    const addAccount = async (account: Omit<BankAccount, 'id' | 'createdAt' | 'isPrimary'>) => {
        if (!user.value) return

        try {
            loading.value = true

            // Query database to check for existing accounts
            const q = query(collection(db, 'users', user.value.uid, 'bank_accounts'))
            const snapshot = await getDocs(q)

            const isFirst = snapshot.empty
            const isPrimary = isFirst

            const newAccountRef = doc(collection(db, 'users', user.value.uid, 'bank_accounts'))
            const batch = writeBatch(db)

            batch.set(newAccountRef, {
                ...account,
                isPrimary,
                createdAt: Timestamp.now()
            })

            await batch.commit()

            loading.value = false
            return true
        } catch (e) {
            console.error(e)
            error.value = 'Failed to add bank account'
            loading.value = false
            return false
        }
    }

    const setPrimaryAccount = async (id: string) => {
        if (!user.value) return

        try {
            const batch = writeBatch(db)

            const q = query(collection(db, 'users', user.value.uid, 'bank_accounts'))
            const snapshot = await getDocs(q)

            snapshot.docs.forEach(d => {
                if (d.id === id) {
                    batch.update(d.ref, { isPrimary: true })
                } else if (d.data().isPrimary) {
                    batch.update(d.ref, { isPrimary: false })
                }
            })

            await batch.commit()
            return true
        } catch (e) {
            console.error(e)
            error.value = 'Failed to set primary account'
            return false
        }
    }

    const deleteAccount = async (id: string) => {
        if (!user.value) return

        try {
            const accountRef = doc(db, 'users', user.value.uid, 'bank_accounts', id)
            await deleteDoc(accountRef)
            return true
        } catch (e) {
            console.error(e)
            error.value = 'Failed to delete bank account'
            return false
        }
    }

    const fetchBanks = async () => {
        try {
            const data: any = await $fetch('/api/bachs/banks')
            return data
        } catch (e) {
            console.error(e)
            return []
        }
    }

    const resolveAccount = async (accountNumber: string, bankCode: string) => {
        try {
            const data: any = await $fetch('/api/bachs/resolve-account', {
                method: 'POST',
                body: {
                    account_number: accountNumber,
                    bank_code: bankCode
                }
            })
            if (data && data.status === 'success' && data.data) {
                return data.data
            }
            return null
        } catch (e) {
            console.error(e)
            throw e
        }
    }

    return {
        accounts,
        loading,
        error,
        fetchAccounts,
        fetchBanks,
        resolveAccount,
        addAccount,
        setPrimaryAccount,
        deleteAccount
    }
}
