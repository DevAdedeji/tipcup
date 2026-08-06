const STORAGE_KEY = 'tipcup-pending-username'

/**
 * Carries the username claimed at signup through to onboarding.
 *
 * Deliberately not written to Firestore at signup: a profile document is what
 * marks onboarding complete, so creating one early would skip tier and payout
 * setup entirely. Availability is re-checked before the profile is written.
 */
export const usePendingUsername = () => {
    const pending = useState<string>('pending-username', () => '')

    const claimUsername = (username: string) => {
        pending.value = username
        if (import.meta.client) {
            try {
                sessionStorage.setItem(STORAGE_KEY, username)
            } catch {
                // Private browsing can refuse storage; the in-memory value still works.
            }
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
            } catch {
                // Nothing to clean up if storage was never available.
            }
        }
    }

    return { claimUsername, consumeUsername, clearUsername }
}
