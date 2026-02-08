<script setup lang="ts">
import { useAuth } from '~/composables/useAuth'
import { useOnboarding } from '~/composables/useOnboarding'
import { usePageMeta } from '~/composables/usePageMeta'

usePageMeta({
  title: 'Onboarding'
})


definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

const { user } = useAuth()
const { checkUsernameAvailability, completeOnboarding } = useOnboarding()

const step = ref(1)
const steps = ['Claim Link', 'Profile', 'Membership', 'Payouts']
const isLoading = ref(false)

// Data State
const formData = reactive({
  username: '',
  displayName: user.value?.displayName || '',
  bio: '',
  tiers: [
      { price: 5, label: 'Coffee', description: 'Buy me a coffee' },
      { price: 15, label: 'Pizza', description: 'Buy me a pizza' }
  ],
  payoutDetails: {
      bankName: '',
      accountNumber: ''
  }
})

// Validation State
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

// Debounce username check
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
    formData.tiers.push({ price: 10, label: 'New Tier', description: '' })
}

const removeTier = (index: number) => {
    formData.tiers.splice(index, 1)
}

const nextStep = () => {
    if (step.value === 1 && !usernameAvailable.value) return
    if (step.value < 4) step.value++
}

const complete = async () => {
    isLoading.value = true
    try {
        await completeOnboarding({
            username: formData.username,
            displayName: formData.displayName,
            bio: formData.bio,
            tiers: formData.tiers,
            payoutDetails: formData.payoutDetails.bankName ? formData.payoutDetails : null
        })
        navigateTo('/dashboard')
    } catch (error: any) {
        console.error('Onboarding failed:', error)
        // Error already toasted in composable
    } finally {
        isLoading.value = false
    }
}
</script>

<template>
  <div class="min-h-screen bg-background text-text-primary px-4 py-12 font-sans">
      <div class="max-w-2xl mx-auto">
          <!-- Progress -->
          <div class="flex items-start justify-between mb-12 relative px-4">
              <!-- Connecting Line Background -->
              <div class="absolute top-5 left-16 right-16 h-[2px] bg-gray-200"></div>

              <div v-for="(s, i) in steps" :key="s" class="flex flex-col items-center relative z-10 w-24">
                  <div class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border transition-all duration-300 transform bg-background"
                    :class="[
                        step > i + 1 ? 'bg-primary border-primary text-white scale-100' :
                        step === i + 1 ? 'border-primary text-primary bg-background scale-110 shadow-[0_0_15px_rgba(255,107,53,0.3)]' :
                        'border-gray-200 text-text-secondary bg-background'
                    ]">
                      <span v-if="step > i + 1">✓</span>
                      <span v-else>{{ i + 1 }}</span>
                  </div>
                  <span class="text-xs mt-3 font-medium transition-colors duration-300"
                    :class="step === i + 1 ? 'text-primary' : step > i + 1 ? 'text-text-primary' : 'text-text-secondary/50'">
                    {{ s }}
                  </span>
              </div>
          </div>

          <!-- Step 1: Claim Link -->
          <div v-if="step === 1" class="space-y-6 animate-fade-in-up pt-8">
              <div class="text-center space-y-2">
                  <h1 class="text-3xl font-bold">Claim your link</h1>
                  <p class="text-text-secondary">Choose a unique username for your page.</p>
              </div>

              <div class="bg-surface shadow-xl shadow-gray-200/50 border border-white/50 rounded-2xl p-8 max-w-lg mx-auto">
                  <div class="space-y-6">
                      <div>
                          <label class="block text-sm font-medium mb-4 ml-1">Username</label>
                          <div class="flex rounded-md shadow-sm border border-gray-200 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
                              <span class="inline-flex items-center px-2 sm:px-4 rounded-l-md bg-gray-50 text-text-secondary text-sm border-r border-gray-200">
                                  tipcup.adedeji.xyz/
                              </span>
                              <input
                                v-model="formData.username"
                                type="text"
                                class="rounded-r-md flex-1 py-2 sm:py-4 px-2 sm:px-4 text-base sm:text-lg focus:outline-none bg-transparent"
                                placeholder="yourname"
                              />
                          </div>
                           <div class="mt-2 h-6 flex items-center justify-between px-1">
                                <span v-if="isCheckingUsername" class="text-sm text-text-secondary animate-pulse">Checking...</span>
                                <span v-else-if="usernameAvailable && formData.username" class="text-green-500 text-sm font-medium">✓ Available</span>
                                <span v-else class="text-sm text-red-500 font-medium">{{ usernameError }}</span>
                          </div>
                      </div>

                      <Button @click="nextStep" :disabled="!usernameAvailable" size="lg" class="w-full h-14 text-lg shadow-lg shadow-primary/20">
                          Next Step
                      </Button>
                  </div>
              </div>
          </div>

          <!-- Step 2: Profile -->
          <div v-if="step === 2" class="space-y-6 animate-fade-in-up pt-8">
              <div class="text-center space-y-2">
                  <h1 class="text-3xl font-bold">Create your profile</h1>
                  <p class="text-text-secondary">Tell your supporters who you are.</p>
              </div>

              <div class="bg-surface shadow-xl shadow-gray-200/50 border border-white/50 rounded-2xl p-8 max-w-lg mx-auto space-y-6">
                   <div class="flex justify-center">
                        <Avatar :src="user?.photoURL || undefined" size="lg" class="w-24 h-24 ring-4 ring-gray-50" />
                   </div>

                   <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium mb-2">Display Name</label>
                            <Input v-model="formData.displayName" placeholder="e.g. Sarah's Art" />
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-2">Bio</label>
                            <Textarea v-model="formData.bio" placeholder="I create digital art and tutorials..." class="min-h-[120px]" />
                        </div>
                   </div>

                   <Button @click="nextStep" size="lg" class="w-full h-12">Next Step</Button>
              </div>
          </div>

          <!-- Step 3: Tiers -->
          <div v-if="step === 3" class="space-y-6 animate-fade-in-up pt-8">
               <div class="text-center space-y-2">
                  <h1 class="text-3xl font-bold">Setup Membership</h1>
                  <p class="text-text-secondary">Give your fans ways to support you.</p>
              </div>

              <div class="bg-surface shadow-xl shadow-gray-200/50 border border-white/50 rounded-2xl p-8 max-w-lg mx-auto space-y-4">
                  <div v-for="(tier, index) in formData.tiers" :key="index" class="bg-gray-50 border border-gray-200 p-4 rounded-xl relative group hover:border-primary/50 transition-colors">
                        <button @click="removeTier(index)" class="absolute top-2 right-2 p-1 text-text-secondary hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                             ✕
                        </button>
                        <div class="grid grid-cols-3 gap-4">
                             <div class="col-span-1">
                                 <label class="text-xs text-text-secondary block mb-1">Price ($)</label>
                                 <Input v-model="tier.price" type="number" />
                             </div>
                             <div class="col-span-2">
                                 <label class="text-xs text-text-secondary block mb-1">Label</label>
                                 <Input v-model="tier.label" />
                             </div>
                             <div class="col-span-3">
                                 <Input v-model="tier.description" placeholder="Description (optional)" />
                             </div>
                        </div>
                  </div>

                  <Button @click="addTier" variant="outline" class="w-full border-dashed border-2 hover:border-primary/50 hover:bg-primary/5">
                      + Add another tier
                  </Button>

                  <Button @click="nextStep" size="lg" class="w-full h-12 mt-4">Next Step</Button>
              </div>
          </div>

          <!-- Step 4: Payouts -->
          <div v-if="step === 4" class="space-y-6 animate-fade-in-up pt-8">
              <div class="text-center space-y-2">
                  <h1 class="text-3xl font-bold">Get Paid</h1>
                  <p class="text-text-secondary">Where should we send your earnings?</p>
              </div>

               <div class="bg-surface shadow-xl shadow-gray-200/50 border border-white/50 rounded-2xl p-8 max-w-lg mx-auto space-y-6">
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium mb-2">Bank Name</label>
                            <Input v-model="formData.payoutDetails.bankName" placeholder="e.g. Chase" />
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-2">Account Number</label>
                            <Input v-model="formData.payoutDetails.accountNumber" placeholder="•••• •••• •••• 1234" />
                        </div>
                    </div>

                    <div class="space-y-3 pt-2">
                        <Button @click="complete" :loading="isLoading" size="lg" class="w-full h-12">
                            Complete Setup
                        </Button>
                        <Button @click="complete" variant="ghost" class="w-full text-text-secondary">
                            Skip for now
                        </Button>
                    </div>
               </div>
          </div>

      </div>
  </div>
</template>
