<script setup lang="ts">
import { useAuth } from '~/composables/useAuth'
import { useOnboarding } from '~/composables/useOnboarding'
import { usePageMeta } from '~/composables/usePageMeta'
import { useBankDetails } from '~/composables/useBankDetails'
import { ChevronDown } from 'lucide-vue-next'
import Select from '~/components/ui/Select.vue'
import AmountInput from '~/components/ui/AmountInput.vue'
import { DEFAULT_TIER_AMOUNT, MIN_TIP_AMOUNT, validateAmount, formatCurrency } from '~/utils/format'

usePageMeta({
  title: 'Onboarding'
})

const { user } = useAuth()
const { checkUsernameAvailability, completeOnboarding } = useOnboarding()
const { addAccount, fetchBanks, resolveAccount } = useBankDetails()
const { consumeUsername, clearUsername } = usePendingUsername()

const step = ref(1)
const steps = ['Claim link', 'Profile', 'Tiers', 'Payouts']
const isLoading = ref(false)

const formData = reactive({
  username: '',
  displayName: user.value?.displayName || '',
  bio: '',
  tiers: [
      { price: 1000, label: 'Coffee', description: 'Buy me a coffee' },
      { price: 2000, label: 'Pizza', description: 'Buy me a pizza' }
  ],
  payoutDetails: {
      bankName: '',
      bankCode: '',
      accountNumber: '',
      accountName: ''
  }
})

const banks = ref<any[]>([])
const loadingBanks = ref(false)
const verifyingAccount = ref(false)

onMounted(async () => {
    const claimed = consumeUsername()
    if (claimed) {
        formData.username = claimed
        usernameAvailable.value = true
        if (step.value === 1) step.value = 2
    }

    loadingBanks.value = true
    try {
        const response: any = await fetchBanks()
        if (response && response.status === 'success') {
            banks.value = response.data
        } else if (Array.isArray(response)) {
             banks.value = response
        }
    } catch (e) {
        console.error('Failed to fetch banks', e)
    } finally {
        loadingBanks.value = false
    }
})

const handleResolveAccount = async () => {
    if (formData.payoutDetails.accountNumber.length < 10 || !formData.payoutDetails.bankCode) return

    verifyingAccount.value = true
    formData.payoutDetails.accountName = ''

    try {
        const accountData = await resolveAccount(formData.payoutDetails.accountNumber, formData.payoutDetails.bankCode)

        if (accountData) {
            formData.payoutDetails.accountName = accountData.account_name
        } else {
             const toast = useToast()
            toast.add({ title: 'Invalid Account', description: 'Could not resolve account details.', type: 'error' })
        }
    } catch (e) {
         const toast = useToast()
        toast.add({ title: 'Error', description: 'Failed to resolve account.', type: 'error' })
    } finally {
        verifyingAccount.value = false
    }
}

watch(() => [formData.payoutDetails.accountNumber, formData.payoutDetails.bankCode], () => {
    if (formData.payoutDetails.accountNumber.length === 10 && formData.payoutDetails.bankCode) {
        handleResolveAccount()
    } else {
        formData.payoutDetails.accountName = ''
    }
})

// Update bank name when bank code changes
watch(() => formData.payoutDetails.bankCode, (code) => {
    if (code) {
        const bank = banks.value.find(b => b.code === code)
        formData.payoutDetails.bankName = bank ? bank.name : ''
    }
})

const usernameError = ref('')
const isCheckingUsername = ref(false)
const usernameAvailable = ref(false)

const checkUsername = async () => {
    if (formData.username.length < 3) {
        usernameError.value = 'Username must be at least 3 characters'
        usernameAvailable.value = false
        return
    }
    isCheckingUsername.value = true
    usernameError.value = ''
    try {
        const available = await checkUsernameAvailability(formData.username)
        if (available) {
            usernameAvailable.value = true
        } else {
            usernameError.value = 'Username is taken'
            usernameAvailable.value = false
        }
    } finally {
        isCheckingUsername.value = false
    }
}

let timeout: NodeJS.Timeout
watch(() => formData.username, (newVal) => {
    clearTimeout(timeout)
    usernameAvailable.value = false
    if (!newVal) return
    timeout = setTimeout(() => {
        checkUsername()
    }, 500)
})

const addTier = () => {
    formData.tiers.push({ price: DEFAULT_TIER_AMOUNT, label: 'New Tier', description: '' })
}

const removeTier = (index: number) => {
    formData.tiers.splice(index, 1)
}

// Bachs rejects any checkout under NGN 1,000, so block it here rather than
// letting a supporter hit the failure at payment time.
const invalidTier = computed(() =>
    formData.tiers.find((tier: any) => validateAmount(tier.price, MIN_TIP_AMOUNT) !== null)
)

const nextStep = () => {
    if (step.value === 1 && !usernameAvailable.value) return

    if (step.value === 3 && invalidTier.value) {
        useToast().add({
            title: 'Check your tiers',
            description: `Every tier must be at least ${formatCurrency(MIN_TIP_AMOUNT)}.`,
            type: 'error'
        })
        return
    }

    if (step.value < 4) step.value++
}

const complete = async () => {
    isLoading.value = true
    const toast = useToast()

    try {
        // 1. Create Profile
        await completeOnboarding({
            username: formData.username,
            displayName: formData.displayName,
            bio: formData.bio,
            tiers: formData.tiers,
            payoutDetails: null // Don't save to profile doc anymore
        })

        // 2. Add Bank Account if provided
        if (formData.payoutDetails.bankCode && formData.payoutDetails.accountNumber && formData.payoutDetails.accountName) {
            try {
                await addAccount({
                    bankName: formData.payoutDetails.bankName,
                    accountNumber: formData.payoutDetails.accountNumber,
                    accountName: formData.payoutDetails.accountName,
                    bank_code: formData.payoutDetails.bankCode
                })
            } catch (e) {
                console.error('Failed to add bank account during onboarding', e)
                toast.add({ title: 'Bank Account Error', description: 'Profile created, but failed to add bank account. Please add it in settings.', type: 'warning' })
            }
        }

        clearUsername()
        navigateTo('/dashboard')
    } catch (error: any) {
        console.error('Onboarding failed:', error)
         toast.add({ title: 'Error', description: 'Onboarding failed. Please try again.', type: 'error' })
    } finally {
        isLoading.value = false
    }
}
</script>

<template>
  <div class="min-h-[100dvh] bg-background text-text-primary">
    <!-- The band previews the cloth their username weaves. -->
    <AdireCloth :seed="formData.username" class="h-2 w-full transition-all duration-500" />

    <div class="mx-auto max-w-xl px-5 py-10 sm:py-14">
      <!-- Progress -->
      <ol class="mb-10 flex items-center gap-2">
        <li v-for="(s, i) in steps" :key="s" class="flex flex-1 flex-col gap-1.5">
          <span
            class="h-1 w-full transition-colors duration-300"
            :class="step > i ? 'bg-accent' : 'bg-border'"
          />
          <span
            class="truncate text-2xs font-semibold uppercase tracking-label transition-colors duration-300"
            :class="step === i + 1 ? 'text-accent' : step > i + 1 ? 'text-text-secondary' : 'text-text-tertiary'"
          >
            {{ s }}
          </span>
        </li>
      </ol>

      <!-- 1 — username -->
      <section v-if="step === 1" class="animate-rise">
        <h1 class="font-display text-3xl font-semibold tracking-tight">Claim your link</h1>
        <p class="mt-2 text-md text-text-secondary">
          This becomes your public page — and the pattern it's woven with.
        </p>

        <div class="mt-7 border border-border bg-surface p-5 shadow-xs">
          <label for="ob-username" class="mb-1.5 block text-sm font-medium">Username</label>
          <div
            class="flex items-center border bg-surface transition-colors"
            :class="usernameAvailable ? 'border-success' : usernameError ? 'border-error' : 'border-input focus-within:border-ring'"
          >
            <span class="shrink-0 pl-3 text-sm text-text-tertiary">tipcup.adedeji.xyz/</span>
            <input
              id="ob-username"
              v-model="formData.username"
              type="text"
              spellcheck="false"
              placeholder="yourname"
              class="h-11 min-w-0 flex-1 bg-transparent pr-3 text-md focus:outline-none"
            />
          </div>

          <p v-if="isCheckingUsername" class="mt-1.5 text-xs text-text-tertiary">Checking…</p>
          <p v-else-if="usernameAvailable && formData.username" class="mt-1.5 text-xs font-medium text-success">
            Available — this is yours.
          </p>
          <p v-else-if="usernameError" class="mt-1.5 text-xs font-medium text-error">{{ usernameError }}</p>

          <Button size="xl" block class="mt-5" :disabled="!usernameAvailable" @click="nextStep">
            Continue
          </Button>
        </div>
      </section>

      <!-- 2 — profile -->
      <section v-if="step === 2" class="animate-rise">
        <h1 class="font-display text-3xl font-semibold tracking-tight">Your profile</h1>
        <p class="mt-2 text-md text-text-secondary">Tell supporters who you are.</p>

        <div class="mt-7 space-y-4 border border-border bg-surface p-5 shadow-xs">
          <div class="flex justify-center">
            <Avatar :src="user?.photoURL || undefined" :alt="formData.displayName || 'You'" size="2xl" class="h-20 w-20" />
          </div>

          <Input v-model="formData.displayName" label="Display name" placeholder="e.g. Ada Obi" />
          <Textarea
            v-model="formData.bio"
            label="Bio"
            :rows="3"
            :maxlength="160"
            placeholder="I draw Lagos every week."
          />

          <Button size="xl" block @click="nextStep">Continue</Button>
        </div>
      </section>

      <!-- 3 — tiers -->
      <section v-if="step === 3" class="animate-rise">
        <h1 class="font-display text-3xl font-semibold tracking-tight">Set your amounts</h1>
        <p class="mt-2 text-md text-text-secondary">
          What can people send you? Minimum {{ formatCurrency(MIN_TIP_AMOUNT) }}.
        </p>

        <div class="mt-7 space-y-3 border border-border bg-surface p-5 shadow-xs">
          <div
            v-for="(tier, index) in formData.tiers"
            :key="index"
            class="border border-border bg-surface-sunken p-3"
          >
            <div class="flex flex-wrap items-start gap-3">
              <div class="w-32 shrink-0">
                <AmountInput v-model="tier.price" label="Amount" />
              </div>
              <div class="min-w-[8rem] flex-1">
                <Input v-model="tier.label" label="Label" placeholder="Coffee" />
              </div>
              <button
                class="mt-7 flex h-11 w-9 shrink-0 items-center justify-center text-text-tertiary transition-colors hover:bg-error-muted hover:text-error"
                title="Remove tier"
                @click="removeTier(index)"
              >
                ✕
              </button>
            </div>
          </div>

          <Button variant="outline" block @click="addTier">Add another</Button>
          <Button size="xl" block @click="nextStep">Continue</Button>
        </div>
      </section>

      <!-- 4 — payouts -->
      <section v-if="step === 4" class="animate-rise">
        <h1 class="font-display text-3xl font-semibold tracking-tight">Where to pay you</h1>
        <p class="mt-2 text-md text-text-secondary">
          You can add this later, but you'll need it to withdraw.
        </p>

        <div class="mt-7 space-y-4 border border-border bg-surface p-5 shadow-xs">
          <div>
            <label class="mb-1.5 block text-sm font-medium">Bank</label>
            <Select
              v-if="!loadingBanks"
              v-model="formData.payoutDetails.bankCode"
              :options="banks.map(b => ({ value: b.code, label: b.name }))"
              placeholder="Select a bank"
            />
            <div v-else class="flex h-11 items-center text-sm text-text-tertiary">Loading banks…</div>
          </div>

          <Input
            v-model="formData.payoutDetails.accountNumber"
            label="Account number"
            inputmode="numeric"
            maxlength="10"
            placeholder="0123456789"
          />

          <div>
            <label class="mb-1.5 block text-sm font-medium">Account name</label>
            <div class="relative">
              <Input
                v-model="formData.payoutDetails.accountName"
                placeholder="Verified automatically"
                disabled
              />
              <div v-if="verifyingAccount" class="absolute right-3 top-3.5">
                <div class="h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent" />
              </div>
            </div>
          </div>

          <div class="space-y-2 pt-1">
            <Button size="xl" block :loading="isLoading" @click="complete">Finish setup</Button>
            <Button variant="ghost" block @click="complete">Skip for now</Button>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
