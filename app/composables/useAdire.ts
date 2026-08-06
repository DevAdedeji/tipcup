export interface Cloth {
    motif: number
    scale: number
    className: string
    style: Record<string, string>
}

const MOTIFS = 6

/**
 * Adire is resist-dyed: the pattern emerges where the cloth was tied, so no two
 * pieces are identical. Each creator's cloth is derived from their username, so
 * their page is woven a particular way and stays that way.
 *
 * Deterministic and dependency-free, so the server and the client always agree
 * and SSR never hydrates to a different pattern.
 */
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
        // Keep the weave legible: too fine reads as noise, too coarse as wallpaper.
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
