export const useChartTheme = () => {
    const { isDark } = useTheme()

    const readToken = (name: string, alpha = 1): string => {
        if (!import.meta.client) return alpha === 1 ? '#888888' : `rgba(136, 136, 136, ${alpha})`

        const raw = getComputedStyle(document.documentElement).getPropertyValue(`--${name}`).trim()
        if (!raw) return alpha === 1 ? '#888888' : `rgba(136, 136, 136, ${alpha})`

        return `hsl(${raw} / ${alpha})`
    }

    const theme = computed(() => {
        void isDark.value

        return {
            accent: readToken('accent'),
            accentFill: readToken('accent', 0.28),
            accentFade: readToken('accent', 0),
            success: readToken('success'),
            successFill: readToken('success', 0.28),
            successFade: readToken('success', 0),
            surface: readToken('surface'),
            grid: readToken('border', 0.7),
            tick: readToken('text-tertiary'),
            tooltipBg: readToken('text-primary'),
            tooltipText: readToken('background'),
            border: readToken('border'),
        }
    })

    return { theme, isDark }
}
