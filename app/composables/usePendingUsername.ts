const STORAGE_KEY = 'tipcup-pending-username'

export const usePendingUsername = () => {
    const pending = useState<string>('pending-username', () => '')

    const claimUsername = (username: string) => {
        pending.value = username
        if (import.meta.client) {
            // Private browsing can refuse storage; the in-memory value still works.
            try {
                sessionStorage.setItem(STORAGE_KEY, username)
            } catch {}
        }
    }

    const consumeUsername = (): string => {
        if (pending.value) return pending.value
        if (!import.meta.client) return ''

        try {
            return sessionStorage.getItem(STORAGE_KEY) || ''
        } catch {
            return ''
        }
    }

    const clearUsername = () => {
        pending.value = ''
        if (import.meta.client) {
            try {
                sessionStorage.removeItem(STORAGE_KEY)
            } catch {}
        }
    }

    return { claimUsername, consumeUsername, clearUsername }
}
