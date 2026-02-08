
export interface PageMeta {
    title: string
    description?: string
    image?: string
    url?: string
    type?: 'website' | 'article' | 'profile'
    twitterCard?: 'summary' | 'summary_large_image'
}

export const usePageMeta = (meta: PageMeta) => {
    const route = useRoute()
    const config = useRuntimeConfig()

    const title = meta.title
    const description = meta.description || 'TipCup - Accept support from your community.'
    const url = meta.url || `https://tipcup.adedeji.xyz${route.path}`
    const image = meta.image || 'https://tipcup.adedeji.xyz/og-default.png'
    const type = meta.type || 'website'
    const twitterCard = meta.twitterCard || 'summary_large_image'

    useSeoMeta({
        title,
        ogTitle: title,
        twitterTitle: title,

        description,
        ogDescription: description,
        twitterDescription: description,

        ogImage: image,
        twitterImage: image,

        ogUrl: url,
        ogType: type,

        twitterCard: twitterCard,
    })

    useHead({
        titleTemplate: (titleChunk) => {
            return titleChunk ? `${titleChunk} | TipCup` : 'TipCup'
        }
    })
}
