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
    port: 3333
  },
  components: [
    {
      path: '~/components/ui',
      pathPrefix: false
    },
    'app/components'
  ],
  runtimeConfig: {
    public: {
      appUrl: process.env.APP_URL || 'http://localhost:3333',
      firebase: {
        apiKey: process.env.FIREBASE_API_KEY,
        authDomain: process.env.FIREBASE_AUTH_DOMAIN,
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.FIREBASE_APP_ID,
        measurementId: process.env.FIREBASE_MEASUREMENT_ID
      }
    }
  }
})
