// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  ssr: false,
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
