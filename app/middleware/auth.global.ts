export default defineNuxtRouteMiddleware(async (to, from) => {
    const { user, userProfile, loading } = useAuth()

    // Wait for auth to initialize on client side
    if (process.client && loading.value) {
        await new Promise<void>((resolve) => {
            const stop = watch(loading, (newLoading) => {
                if (!newLoading) {
                    stop()
                    resolve()
                }
            })
        })
    }

    const publicRoutes = ['/', '/login', '/signup']
    // DEBUG: Log route access
    if (process.client) {
        console.log('Middleware Check:', { toPath: to.path, toName: to.name, user: !!user.value })
    }
    // Allow dynamic profile route (name is usually 'username' for [username].vue)
    const isPublicRoute = publicRoutes.includes(to.path) || to.name === 'username'

    // 1. If user is NOT logged in
    if (!user.value) {
        // Allow public routes
        if (isPublicRoute) return

        // Redirect protected routes to login
        return navigateTo('/login')
    }

    // 2. If user IS logged in
    if (user.value) {
        // Redirect public routes to dashboard (or onboarding if no profile)
        if (isPublicRoute) {
            if (userProfile.value) {
                return navigateTo('/dashboard')
            } else {
                return navigateTo('/onboarding')
            }
        }

        // Handle Onboarding logic for authenticated users
        // If no profile, force onboarding (unless already there)
        if (!userProfile.value && to.path !== '/onboarding') {
            return navigateTo('/onboarding')
        }

        // If has profile, prevent visiting onboarding again
        if (userProfile.value && to.path === '/onboarding') {
            return navigateTo('/dashboard')
        }
    }
})
