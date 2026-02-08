export default defineNuxtRouteMiddleware((to, from) => {
    const { user, userProfile, loading } = useAuth()

    // If auth is still loading, we might want to wait or show a loading state
    // For now, we'll watch for changes if loading is true
    if (loading.value) {
        // This is a simple check, in a real app you might want to return a Promise
        // that resolves when loading is false
        return
    }

    if (!user.value) {
        return navigateTo('/login')
    }

    // If user is logged in but has no profile (and is not trying to go to onboarding)
    if (!userProfile.value && to.path !== '/onboarding') {
        return navigateTo('/onboarding')
    }

    // If user has a profile and tries to go to onboarding, redirect to dashboard
    if (userProfile.value && to.path === '/onboarding') {
        return navigateTo('/dashboard')
    }
})
