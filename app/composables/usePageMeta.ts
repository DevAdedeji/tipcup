import type { Ref, ComputedRef } from 'vue'

type MaybeRef<T> = T | Ref<T> | ComputedRef<T>

export interface PageMeta {
    title: MaybeRef<string>
    description?: MaybeRef<string | undefined>
    image?: MaybeRef<string | undefined>
    url?: MaybeRef<string | undefined>
    type?: 'website' | 'article' | 'profile'
    twitterCard?: 'summary' | 'summary_large_image'
}

const DEFAULT_DESCRIPTION = 'TipCup - accept support from your community.'

export const usePageMeta = (meta: PageMeta) => {
    const route = useRoute()
    const config = useRuntimeConfig()

    const siteUrl = (config.public.siteUrl as string) || 'https://tipcup.adedeji.xyz'

    const absolute = (value?: string) => {
        if (!value) return undefined
        return value.startsWith('http') ? value : `${siteUrl}${value.startsWith('/') ? '' : '/'}${value}`
    }

    useSeoMeta({
        title: () => toValue(meta.title),
        ogTitle: () => toValue(meta.title),
        twitterTitle: () => toValue(meta.title),

        description: () => toValue(meta.description) || DEFAULT_DESCRIPTION,
        ogDescription: () => toValue(meta.description) || DEFAULT_DESCRIPTION,
        twitterDescription: () => toValue(meta.description) || DEFAULT_DESCRIPTION,

        ogImage: () => absolute(toValue(meta.image)) || `${siteUrl}/og-image.png`,
        twitterImage: () => absolute(toValue(meta.image)) || `${siteUrl}/og-image.png`,

        ogUrl: () => absolute(toValue(meta.url)) || `${siteUrl}${route.path}`,
        ogType: meta.type || 'website',

        twitterCard: meta.twitterCard || 'summary_large_image',
    })

    useHead({
        titleTemplate: (titleChunk) => (titleChunk ? `${titleChunk} | TipCup` : 'TipCup'),
        link: [{ rel: 'canonical', href: () => `${siteUrl}${route.path}` }],
    })
}
