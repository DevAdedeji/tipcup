// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  ssr: false,
  app: {
    head: {
      title: 'TipCup ',
      titleTemplate: '%s | TipCup',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'TipCup is the easiest way for creators, developers, and artists to accept support from their fans. Turn your passion into a sustainable career with TipCup.' },
        { name: 'theme-color', content: '#FF6B35' },
        { property: 'og:site_name', content: 'TipCup' },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: 'https://tipcup.adedeji.xyz' },
        { property: 'og:title', content: 'TipCup - Support Creators & Fuel Dreams' },
        { property: 'og:description', content: 'TipCup is the easiest way for creators, developers, and artists to accept support from their fans. Turn your passion into a sustainable career with TipCup.' },
        { property: 'og:image', content: 'https://tipcup.adedeji.xyz/og-image.png' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:site', content: '@devadedeji' },
        { name: 'twitter:title', content: 'TipCup - Support Creators & Fuel Dreams' },
        { name: 'twitter:description', content: 'TipCup is the easiest way for creators, developers, and artists to accept support from their fans. Turn your passion into a sustainable career with TipCup.' },
        { name: 'twitter:image', content: 'https://tipcup.adedeji.xyz/og-image.png' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  },
  modules: ['@nuxtjs/tailwindcss', '@nuxtjs/google-fonts'],
  googleFonts: {
    families: {
      Quicksand: [300, 400, 500, 600, 700]
    }
  },
  build: {
    transpile: ['lucide-vue-next']
  },
  devServer: {
    port: 4444
  },
  components: [
    {
      path: '~/components/ui',
      pathPrefix: false
    },
    'app/components'
  ],
})
