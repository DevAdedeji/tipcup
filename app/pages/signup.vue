<script setup lang="ts">
import { useAuth, authErrorMessage } from '~/composables/useAuth'
import { useOnboarding } from '~/composables/useOnboarding'
import { Check, Loader2, X } from 'lucide-vue-next'

const { signInWithGoogle, signUpWithEmail, userProfile } = useAuth()
const { checkUsernameAvailability } = useOnboarding()
const { claimUsername } = usePendingUsername()

useHead({ title: 'Sign up' })

const email = ref('')
const username = ref('')
const password = ref('')
const submitting = ref(false)
const googleLoading = ref(false)
const formError = ref('')

const checkingUsername = ref(false)
const usernameAvailable = ref(false)
const usernameError = ref('')

// Debounced so we aren't querying Firestore on every keystroke.
let debounce: ReturnType<typeof setTimeout>
watch(username, (value) => {
  clearTimeout(debounce)
  usernameAvailable.value = false
  usernameError.value = ''

  const normalized = value.trim().toLowerCase()
  if (!normalized) return

  if (normalized.length < 3) {
    usernameError.value = 'At least 3 characters.'
    return
  }
  if (!/^[a-z0-9-_]+$/.test(normalized)) {
    usernameError.value = 'Letters, numbers, hyphens and underscores only.'
    return
  }

  checkingUsername.value = true
  debounce = setTimeout(async () => {
    try {
      usernameAvailable.value = await checkUsernameAvailability(normalized)
      if (!usernameAvailable.value) usernameError.value = 'That name is taken.'
    } finally {
      checkingUsername.value = false
    }
  }, 450)
})

onUnmounted(() => clearTimeout(debounce))

const canSubmit = computed(
  () =>
    email.value.trim().length > 3 &&
    password.value.length >= 6 &&
    usernameAvailable.value &&
    !checkingUsername.value
)

const handleSignup = async () => {
  if (!canSubmit.value || submitting.value) return

  formError.value = ''
  submitting.value = true

  try {
    // Re-check at submit: the name could have gone while a password was typed.
    // Onboarding verifies once more before it writes the profile.
    const stillFree = await checkUsernameAvailability(username.value.trim().toLowerCase())
    if (!stillFree) {
      usernameAvailable.value = false
      usernameError.value = 'That name was just taken. Try another.'
      return
    }

    await signUpWithEmail(email.value, password.value, username.value.trim())
    claimUsername(username.value.trim().toLowerCase())
    navigateTo('/onboarding')
  } catch (error: any) {
    formError.value = authErrorMessage(error)
  } finally {
    submitting.value = false
  }
}

const handleGoogle = async () => {
  googleLoading.value = true
  formError.value = ''
  try {
    await signInWithGoogle()
    if (username.value.trim() && usernameAvailable.value) {
      claimUsername(username.value.trim().toLowerCase())
    }
    navigateTo(userProfile.value ? '/dashboard' : '/onboarding')
  } catch (error: any) {
    formError.value = authErrorMessage(error)
  } finally {
    googleLoading.value = false
  }
}
</script>

<template>
  <div class="relative flex min-h-[100dvh] flex-col bg-background">
    <!-- The band previews the cloth their username will weave. -->
    <AdireCloth :seed="username" class="h-2 w-full transition-all duration-500" />

    <div class="absolute right-4 top-6"><ThemeToggle /></div>

    <div class="flex flex-1 items-center justify-center px-5 py-12">
      <div class="w-full max-w-sm">
        <div class="text-center">
          <NuxtLink to="/" class="font-display text-2xl font-semibold tracking-tight">TipCup</NuxtLink>
          <h1 class="mt-6 font-display text-3xl font-semibold tracking-tight">Claim your page</h1>
          <p class="mt-2 text-md text-text-secondary">Takes about a minute.</p>
        </div>

        <form class="mt-8 space-y-4" @submit.prevent="handleSignup">
          <div>
            <label for="username" class="mb-1.5 block text-sm font-medium text-text-primary">
              Username
            </label>
            <div
              class="flex items-center border bg-surface transition-colors"
              :class="
                usernameError
                  ? 'border-error'
                  : usernameAvailable
                    ? 'border-success'
                    : 'border-input focus-within:border-ring'
              "
            >
              <span class="shrink-0 pl-3 text-sm text-text-tertiary">tipcup.adedeji.xyz/</span>
              <input
                id="username"
                v-model="username"
                type="text"
                autocomplete="username"
                spellcheck="false"
                placeholder="yourname"
                class="h-11 min-w-0 flex-1 bg-transparent pr-2 text-md text-text-primary placeholder:text-text-tertiary focus:outline-none"
              />
              <span class="flex w-9 shrink-0 items-center justify-center">
                <Loader2 v-if="checkingUsername" class="h-4 w-4 animate-spin text-text-tertiary" />
                <Check v-else-if="usernameAvailable" class="h-4 w-4 text-success" />
                <X v-else-if="usernameError" class="h-4 w-4 text-error" />
              </span>
            </div>

            <p v-if="usernameError" class="mt-1.5 text-xs font-medium text-error">
              {{ usernameError }}
            </p>
            <p v-else-if="usernameAvailable" class="mt-1.5 text-xs font-medium text-success">
              Yours — and the pattern your page will be woven with.
            </p>
            <p v-else class="mt-1.5 text-xs text-text-tertiary">This becomes your public link.</p>
          </div>

          <Input
            v-model="email"
            label="Email"
            type="email"
            autocomplete="email"
            placeholder="you@example.com"
          />

          <Input
            v-model="password"
            label="Password"
            type="password"
            autocomplete="new-password"
            placeholder="••••••••"
            hint="At least 6 characters."
          />

          <p
            v-if="formError"
            role="alert"
            class="border border-error/30 bg-error-muted px-3 py-2 text-sm text-error"
          >
            {{ formError }}
          </p>

          <Button
            type="submit"
            size="xl"
            block
            :loading="submitting"
            :disabled="!canSubmit || submitting"
          >
            Create account
          </Button>
        </form>

        <div class="my-6 flex items-center gap-3">
          <span class="h-px flex-1 bg-border" />
          <span class="text-2xs uppercase tracking-label text-text-tertiary">or</span>
          <span class="h-px flex-1 bg-border" />
        </div>

        <Button variant="outline" size="xl" block :loading="googleLoading" @click="handleGoogle">
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

        <p class="mt-7 text-center text-sm text-text-secondary">
          Already have an account?
          <NuxtLink to="/login" class="ml-1 font-semibold text-accent hover:underline">Log in</NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>
