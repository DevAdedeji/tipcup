
const SITE_URL = 'https://tipcup.adedeji.xyz'
const SITE_DESCRIPTION =
  'TipCup is the easiest way for creators, developers, and artists to accept support from their fans. Turn your passion into a sustainable career with TipCup.'

// Runs before first paint so the theme never flashes.
const THEME_BOOTSTRAP = `
(function(){try{
  var s=localStorage.getItem('tipcup-theme');
  var d=s==='dark'||(s!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.classList.toggle('dark',d);
  document.documentElement.style.colorScheme=d?'dark':'light';
}catch(e){}})();
`

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  ssr: true,

  routeRules: {
    '/dashboard/**': { ssr: false },
    '/login': { ssr: false },
    '/signup': { ssr: false },
    '/onboarding': { ssr: false },
  },

  runtimeConfig: {
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || SITE_URL,
      firebase: {
        apiKey: process.env.FIREBASE_API_KEY,
        authDomain: process.env.FIREBASE_AUTH_DOMAIN,
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.FIREBASE_APP_ID,
        measurementId: process.env.FIREBASE_MEASUREMENT_ID,
      },
    },
  },

  css: ['~/assets/css/main.css'],

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      title: 'TipCup',
      titleTemplate: '%s | TipCup',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: SITE_DESCRIPTION },
        { name: 'theme-color', content: '#EDEFEA', media: '(prefers-color-scheme: light)' },
        { name: 'theme-color', content: '#0E100C', media: '(prefers-color-scheme: dark)' },
        { property: 'og:site_name', content: 'TipCup' },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: SITE_URL },
        { property: 'og:title', content: 'TipCup - Support Creators & Fuel Dreams' },
        { property: 'og:description', content: SITE_DESCRIPTION },
        { property: 'og:image', content: `${SITE_URL}/og-image.png` },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:site', content: '@devadedeji' },
        { name: 'twitter:title', content: 'TipCup - Support Creators & Fuel Dreams' },
        { name: 'twitter:description', content: SITE_DESCRIPTION },
        { name: 'twitter:image', content: `${SITE_URL}/og-image.png` },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      ],
      script: [{ innerHTML: THEME_BOOTSTRAP, tagPosition: 'head' }],
    },
  },

  modules: ['@nuxtjs/tailwindcss', '@nuxtjs/google-fonts'],

  googleFonts: {
    display: 'swap',
    preload: true,
    families: {
      'IBM Plex Sans': [400, 500, 600, 700],
      'IBM Plex Sans Condensed': [500, 600, 700],
      'IBM Plex Mono': [400, 500, 600],
    },
  },

  build: {
    transpile: ['lucide-vue-next'],
  },

  devServer: {
    port: 4444,
  },

  components: [
    {
      path: '~/components/ui',
      pathPrefix: false,
    },
    'app/components',
  ],
})
