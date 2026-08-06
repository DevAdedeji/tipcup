import { initFirebase } from '~/firebase'

export default defineNuxtPlugin(() => {
    const config = useRuntimeConfig().public.firebase as Record<string, string>

    if (!config?.apiKey) {
        console.error(
            '[firebase] Missing config. Check the FIREBASE_* variables in .env, then restart the dev server — Nuxt only reads .env at startup.'
        )
        return
    }

    initFirebase(config)

    const { initAuth } = useAuth()
    initAuth()
})
