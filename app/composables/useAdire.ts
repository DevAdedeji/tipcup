export interface Cloth {
    motif: number
    scale: number
    className: string
    style: Record<string, string>
}

const MOTIFS = 6

const hash = (seed: string): number => {
    let h = 2166136261
    for (let i = 0; i < seed.length; i++) {
        h ^= seed.charCodeAt(i)
        h = Math.imul(h, 16777619)
    }
    return Math.abs(h)
}

const FALLBACK_SEED = 'tipcup'

export const useAdire = (seed?: MaybeRefOrGetter<string | undefined>) => {
    const cloth = computed<Cloth>(() => {
        const resolved = seed === undefined ? '' : toValue(seed)
        const value = (resolved || FALLBACK_SEED).toLowerCase()
        const h = hash(value)

        const motif = (h % MOTIFS) + 1
        const scale = 26 + ((h >> 8) % 5) * 6

        return {
            motif,
            scale,
            className: `cloth cloth-${motif}`,
            style: { '--cloth-scale': `${scale}px` },
        }
    })

    return { cloth }
}
