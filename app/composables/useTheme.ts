export type ThemePreference = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'tipcup-theme'

export const useTheme = () => {
    const preference = useState<ThemePreference>('theme-preference', () => 'system')
    const systemPrefersDark = useState<boolean>('theme-system-dark', () => false)

    const isDark = computed(() =>
        preference.value === 'system' ? systemPrefersDark.value : preference.value === 'dark'
    )

    const apply = () => {
        if (!import.meta.client) return
        document.documentElement.classList.toggle('dark', isDark.value)
        document.documentElement.style.colorScheme = isDark.value ? 'dark' : 'light'
    }

    const set = (value: ThemePreference) => {
        preference.value = value
        if (import.meta.client) {
            if (value === 'system') {
                localStorage.removeItem(STORAGE_KEY)
            } else {
                localStorage.setItem(STORAGE_KEY, value)
            }
            apply()
        }
    }

    const toggle = () => {
        set(isDark.value ? 'light' : 'dark')
    }

    const init = () => {
        if (!import.meta.client) return

        const stored = localStorage.getItem(STORAGE_KEY) as ThemePreference | null
        const media = window.matchMedia('(prefers-color-scheme: dark)')

        systemPrefersDark.value = media.matches
        preference.value = stored === 'light' || stored === 'dark' ? stored : 'system'
        apply()

        const onChange = (e: MediaQueryListEvent) => {
            systemPrefersDark.value = e.matches
            if (preference.value === 'system') apply()
        }

        media.addEventListener('change', onChange)
        if (getCurrentScope()) {
            onScopeDispose(() => media.removeEventListener('change', onChange))
        }
    }

    return { preference, isDark, set, toggle, init }
}
