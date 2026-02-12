import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp, orderBy, onSnapshot } from 'firebase/firestore'
import { db } from '~/firebase'
import { useAuth } from './useAuth'

export interface Goal {
    id: string
    title: string
    description: string
    targetAmount: number
    currentAmount: number
    status: 'active' | 'paused' | 'completed'
    createdAt: any
}

export const useGoals = () => {
    const { user } = useAuth()
    const goals = ref<Goal[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)

    const fetchGoals = () => {
        if (!user.value) return

        loading.value = true
        const q = query(
            collection(db, 'users', user.value.uid, 'goals'),
            orderBy('createdAt', 'desc')
        )

        const unsubscribe = onSnapshot(q, (snapshot) => {
            goals.value = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Goal[]
            loading.value = false
        }, (err) => {
            console.error(err)
            error.value = 'Failed to fetch goals'
            loading.value = false
        })

        return unsubscribe
    }

    const createGoal = async (goal: Omit<Goal, 'id' | 'createdAt' | 'currentAmount' | 'status'>) => {
        if (!user.value) return

        try {
            loading.value = true

            const q = query(
                collection(db, 'users', user.value.uid, 'goals'),
                where('status', '==', 'active')
            )
            const snapshot = await getDocs(q)

            // Batch writes for atomicity
            const { writeBatch } = await import('firebase/firestore')
            const batch = writeBatch(db)

            snapshot.docs.forEach(doc => {
                batch.update(doc.ref, { status: 'paused' })
            })

            const newGoalRef = doc(collection(db, 'users', user.value.uid, 'goals'))
            batch.set(newGoalRef, {
                ...goal,
                currentAmount: 0,
                status: 'active',
                createdAt: Timestamp.now()
            })

            await batch.commit()

            loading.value = false
            return true
        } catch (e) {
            console.error(e)
            error.value = 'Failed to create goal'
            loading.value = false
            return false
        }
    }

    const updateGoal = async (id: string, data: Partial<Goal>) => {
        if (!user.value) return

        try {
            // If setting status to active, pause others
            if (data.status === 'active') {
                const q = query(
                    collection(db, 'users', user.value.uid, 'goals'),
                    where('status', '==', 'active')
                )
                const snapshot = await getDocs(q)

                const { writeBatch } = await import('firebase/firestore')
                const batch = writeBatch(db)

                snapshot.docs.forEach(d => {
                    if (d.id !== id) {
                        batch.update(d.ref, { status: 'paused' })
                    }
                })

                const goalRef = doc(db, 'users', user.value.uid, 'goals', id)
                batch.update(goalRef, data)

                await batch.commit()
            } else {
                // Normal update
                const goalRef = doc(db, 'users', user.value.uid, 'goals', id)
                await updateDoc(goalRef, data)
            }
            return true
        } catch (e) {
            console.error(e)
            error.value = 'Failed to update goal'
            return false
        }
    }

    const deleteGoal = async (id: string) => {
        if (!user.value) return

        try {
            const goalRef = doc(db, 'users', user.value.uid, 'goals', id)
            await deleteDoc(goalRef)
            return true
        } catch (e) {
            console.error(e)
            error.value = 'Failed to delete goal'
            return false
        }
    }

    return {
        goals,
        loading,
        error,
        fetchGoals,
        createGoal,
        updateGoal,
        deleteGoal
    }
}
