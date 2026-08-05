<script setup lang="ts">
import { useAuth } from '~/composables/useAuth'
import { Loader2 } from 'lucide-vue-next'
import Modal from '~/components/ui/Modal.vue'

const route = useRoute()
const isSignup = computed(() => route.path === '/signup')

const { signInWithGoogle, user, userProfile } = useAuth()
const isLoading = ref(false)
const showAuthCheckModal = ref(false)

useHead({
  title: computed(() => (isSignup.value ? 'Sign up' : 'Log in')),
})

const handleLogin = async () => {
  isLoading.value = true
  try {
    await signInWithGoogle()

    showAuthCheckModal.value = true

    navigateTo(userProfile.value ? '/dashboard' : '/onboarding')
  } catch (error: any) {
    useToast().add({
      title: 'Sign-in failed',
      description: error?.message || 'Could not sign you in. Please try again.',
      type: 'error',
    })
  } finally {
    isLoading.value = false
    if (!user.value) showAuthCheckModal.value = false
  }
}
</script>

<template>
  <div class="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-background px-4 py-12">
    <div
      class="pointer-events-none absolute left-1/2 top-0 h-72 w-[600px] max-w-[140%] -translate-x-1/2 bg-accent/10 blur-[100px]"
      aria-hidden="true"
    />

    <div class="absolute right-4 top-4">
      <ThemeToggle />
    </div>

    <div class="relative w-full max-w-sm">
      <div class=" border border-border bg-surface p-8 shadow-lg">
        <div class="text-center">
          <img src="/logo.png" alt="" class="mx-auto mb-5 h-11 w-11 object-contain" />
          <h1 class="font-display text-2xl font-bold tracking-tight">
            {{ isSignup ? 'Create your account' : 'Welcome back' }}
          </h1>
          <p class="mt-2 text-md text-text-secondary">
            {{ isSignup ? 'Your page takes a minute to set up.' : 'Sign in to manage your page.' }}
          </p>
        </div>

        <Button
          variant="outline"
          size="xl"
          block
          class="mt-7"
          :loading="isLoading"
          @click="handleLogin"
        >
          <template #prefix>
            <svg class="h-[18px] w-[18px]" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          </template>
          Continue with Google
        </Button>

        <p class="mt-5 text-center text-xs leading-relaxed text-text-tertiary">
          By continuing you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>

      <p class="mt-5 text-center text-sm text-text-secondary">
        {{ isSignup ? 'Already have an account?' : "Don't have an account?" }}
        <NuxtLink
          :to="isSignup ? '/login' : '/signup'"
          class="ml-1 font-medium text-accent hover:underline"
        >
          {{ isSignup ? 'Log in' : 'Sign up' }}
        </NuxtLink>
      </p>
    </div>

    <Modal :isOpen="showAuthCheckModal" width="max-w-xs">
      <div class="flex flex-col items-center justify-center gap-3 py-6 text-center">
        <Loader2 class="h-8 w-8 animate-spin text-accent" />
        <h2 class="font-display text-md font-semibold text-text-primary">Loading your account</h2>
        <p class="text-sm text-text-secondary">Setting things up…</p>
      </div>
    </Modal>
  </div>
</template>
