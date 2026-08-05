export default defineNuxtRouteMiddleware(async (to, from) => {
    // Auth state is client-only; never redirect a server-rendered public page.
    if (import.meta.server) return

    const { user, userProfile, loading } = useAuth()

    if (loading.value) return

    // Define route categories
    const authPages = ['/login', '/signup']  // Pages only for non-authenticated users
    const publicPages = ['/']  // Homepage - accessible to all but redirects authenticated users
    const profilePages = to.name === 'username'  // Dynamic profile pages - accessible to everyone
    const protectedPages = ![...authPages, ...publicPages].includes(to.path) && !profilePages  // Everything else

    // 1. If user is NOT logged in
    if (!user.value) {
        // Allow auth pages (login, signup)
        if (authPages.includes(to.path)) return

        // Allow homepage
        if (publicPages.includes(to.path)) return

        // Allow profile pages
        if (profilePages) return

        // Redirect protected pages to login
        return navigateTo('/login')
    }

    // 2. If user IS logged in
    if (user.value) {
        // Allow profile pages even for authenticated users
        if (profilePages) return

        // Redirect auth pages to dashboard/onboarding
        if (authPages.includes(to.path)) {
            if (userProfile.value) {
                return navigateTo('/dashboard')
            } else {
                return navigateTo('/onboarding')
            }
        }

        // Redirect homepage to dashboard/onboarding
        if (publicPages.includes(to.path)) {
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

        // Allow all other protected pages
        return
    }
})