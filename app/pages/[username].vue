<script setup lang="ts">
import { useProfile, type PublicProfile } from '~/composables/useProfile'
import { ChevronRight, Twitter, Instagram, Youtube, Linkedin, Globe, Link as LinkIcon, Facebook, Github } from 'lucide-vue-next'
import Skeleton from '~/components/ui/Skeleton.vue'
import GoalProgress from '~/components/dashboard/GoalProgress.vue'
import { formatCurrency } from '~/utils/format'

const route = useRoute()
const username = computed(() => route.params.username as string)

const { fetchProfileByUsername, loading } = useProfile()
const profile = ref<PublicProfile | null>(null)

const getSocialIcon = (platform: string) => {
    const p = platform.toLowerCase()
    if (p.includes('twitter')) return Twitter
    if (p.includes('instagram')) return Instagram
    if (p.includes('youtube')) return Youtube
    if (p.includes('linkedin')) return Linkedin
    if (p.includes('website')) return Globe
    if (p.includes('facebook')) return Facebook
    if (p.includes('github')) return Github
    return LinkIcon
}

onMounted(async () => {
    if (username.value) {
        profile.value = await fetchProfileByUsername(username.value)
    }
})

const pageTitle = computed(() => loading.value ? 'Loading...' : profile.value ? `${profile.value.displayName} (@${profile.value.username})` : 'Profile Not Found')

usePageMeta({
    title: pageTitle
})

const toast = useToast()
const shareProfile = async () => {
    try {
        await navigator.clipboard.writeText(window.location.href)
        toast.add({ title: 'Copied!', description: 'Profile link copied to clipboard.', type: 'success' })
    } catch (e) {
        toast.add({ title: 'Error', description: 'Could not copy link.', type: 'error' })
    }
}

const activeTab = ref('home')
const tabs = [
    { id: 'home', label: 'Home' },
    { id: 'socials', label: 'Socials' },
]

const selectedTier = ref<any>(null)
const supportMessage = ref('')
const tipperEmail = ref('')
const processingPayment = ref(false)
const { user } = useAuth()

const handleSupport = async () => {
    if (!selectedTier.value) {
        toast.add({ title: 'Select a Tier', description: 'Please select an amount to support.', type: 'error' })
        return
    }

    const email = user.value?.email || tipperEmail.value
    if (!email) {
        toast.add({ title: 'Email Required', description: 'Please enter your email address.', type: 'error' })
        return
    }

    processingPayment.value = true
    try {
        // Initialize on Server
        const { data: initData } = await useFetch<any>('/api/paystack/initialize', {
            method: 'POST',
            body: {
                email,
                amount: selectedTier.value.price,
                callback_url: window.location.href,
                metadata: {
                    toUserId: profile.value?.uid,
                    goalId: profile.value?.fundraisingGoal?.id,
                    tier: selectedTier.value,
                    message: supportMessage.value,
                    fromUserId: user.value?.uid
                }
            }
        })

        if (initData.value && initData.value.access_code) {
            const accessCode = initData.value.access_code

            // Open Paystack Popup
            const handler = (window as any).PaystackPop.setup({
                key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
                email: email,
                amount: selectedTier.value.price * 100,
                ref: initData.value.reference,
                onClose: function() {
                    processingPayment.value = false
                    toast.add({ title: 'Payment Cancelled', description: 'You cancelled the payment.', type: 'info' })
                },
                callback: function(response: any) {
                    // Verify payment on server
                    $fetch('/api/paystack/verify', {
                        method: 'POST',
                        body: { reference: response.reference }
                    }).then((verifyData: any) => {
                        if (verifyData && verifyData.status === 'success') {
                            toast.add({ title: 'Thank You!', description: `Successfully supported ${profile.value?.displayName}!`, type: 'success' })
                            supportMessage.value = ''
                            tipperEmail.value = ''
                            location.reload()
                        } else {
                            toast.add({ title: 'Verification Failed', description: 'Payment was made but verification failed.', type: 'warning' })
                        }
                    }).catch((e) => {
                        toast.add({ title: 'Error', description: 'Failed to verify payment.', type: 'error' })
                    }).finally(() => {
                        processingPayment.value = false
                    })
                }
            })
            handler.openIframe()
        } else {
             throw new Error('Initialization failed')
        }

    } catch (e) {
        console.error(e)
        toast.add({ title: 'Error', description: 'Could not start payment.', type: 'error' })
        processingPayment.value = false
    }
}
</script>

<template>
    <div class="min-h-screen bg-background text-text-primary pb-20">
        <div v-if="loading" class="animate-fade-in-up">
             <div class="h-48 md:h-64 bg-white/5 animate-pulse relative"></div>

             <div class="max-w-4xl mx-auto px-4 sm:px-6 relative">
                 <div class="-mt-20 mb-6 flex flex-col items-center sm:items-start sm:flex-row sm:gap-6">
                    <Skeleton class="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-background" />

                    <div class="mt-4 sm:mt-24 text-center sm:text-left flex-1 w-full flex flex-col items-center sm:items-start">
                        <Skeleton class="h-8 w-48 mb-2" />
                        <Skeleton class="h-4 w-32 mb-4" />
                        <div class="space-y-2 w-full max-w-lg">
                            <Skeleton class="h-3 w-full" />
                            <Skeleton class="h-3 w-2/3" />
                        </div>
                    </div>

                    <!-- Actions Skeleton -->
                    <div class="mt-6 sm:mt-24 flex gap-3">
                        <Skeleton class="h-9 w-24" />
                    </div>
                 </div>

                 <div class="flex border-b border-border mb-8 gap-6">
                     <Skeleton class="h-10 w-20" />
                     <Skeleton class="h-10 w-20" />
                 </div>

                 <div class="grid md:grid-cols-3 gap-8">
                     <div class="md:col-span-2 space-y-6">
                        <Skeleton class="h-32 w-full rounded-2xl" />
                     </div>
                     <div class="md:col-span-1">
                        <Skeleton class="h-64 w-full rounded-2xl" />
                     </div>
                 </div>
             </div>
        </div>

        <div v-else-if="!profile && !loading" class="flex flex-col items-center justify-center min-h-screen text-center px-4">
             <div class="h-[50vh] flex flex-col items-center justify-center">
                <div class="text-6xl mb-4">😕</div>
                <h1 class="text-3xl font-bold mb-2">Profile not found</h1>
                <p class="text-text-secondary mb-6">The user @{{ username }} does not exist.</p>
                <Button to="/" variant="outline">Go Home</Button>
             </div>
        </div>

        <div v-else-if="profile" class="animate-fade-in-up">
            <div class="h-48 md:h-64 bg-gradient-to-r from-primary/80 to-accent/80 relative">
                <div class="absolute inset-0 bg-black/10"></div>
            </div>

            <div class="max-w-4xl mx-auto px-4 sm:px-6 relative">
                 <div class="-mt-20 mb-6 flex flex-col items-center sm:items-start sm:flex-row sm:gap-6">
                    <Avatar :src="profile?.avatarUrl" size="xl" class="w-32 h-32 md:w-40 md:h-40 border-4 border-background shadow-xl" />

                    <div class="mt-4 sm:mt-24 text-center sm:text-left flex-1">
                        <h1 class="text-3xl font-bold">{{ profile?.displayName }}</h1>
                        <p class="text-text-secondary">@{{ profile?.username }}</p>
                        <p v-if="profile?.bio" class="mt-2 max-w-lg text-text-secondary leading-relaxed">{{ profile?.bio }}</p>
                    </div>

                    <div class="mt-6 sm:mt-24 flex gap-3">
                        <Button @click="shareProfile" variant="outline" size="sm">
                            <span class="mr-2">🔗</span> Share
                        </Button>
                    </div>
                 </div>

                 <div class="flex border-b border-border mb-8 overflow-x-auto">
                    <button
                        v-for="tab in tabs"
                        :key="tab.id"
                        @click="activeTab = tab.id"
                        class="px-6 py-4 font-medium text-sm transition-colors border-b-2 whitespace-nowrap"
                        :class="[
                            activeTab === tab.id
                            ? 'border-primary text-primary'
                            : 'border-transparent text-text-secondary hover:text-text-primary'
                        ]"
                    >
                        {{ tab.label }}
                    </button>
                 </div>

                 <div v-if="activeTab === 'home'" class="max-w-lg mx-auto space-y-2">
                    <div v-if="profile?.fundraisingGoal" class="w-full">
                         <GoalProgress :goal="profile.fundraisingGoal" />
                    </div>
                    <div class="bg-surface border border-primary/20 rounded-2xl p-6 shadow-xl">
                         <h3 class="font-bold text-xl mb-4 text-center">Support {{ profile?.displayName?.split(' ')[0] }}</h3>

                         <!-- Tiers Grid -->
                         <div class="grid grid-cols-3 gap-3 mb-6">
                             <button
                                 v-for="tier in profile?.tiers"
                                 :key="tier.price"
                                 @click="selectedTier = tier"
                                 class="flex flex-col items-center justify-center p-3 rounded-xl border transition-all"
                                 :class="[
                                     selectedTier === tier
                                     ? 'border-primary bg-primary/10 text-primary scale-105 shadow-[0_0_15px_rgba(255,107,53,0.2)]'
                                     : 'border-border bg-background hover:border-primary/50'
                                 ]"
                             >
                                 <span class="text-2xl mb-1">{{ tier.emoji || '☕' }}</span>
                                 <span class="font-bold">{{ formatCurrency(tier.price) }}</span>
                             </button>
                         </div>

                         <div class="space-y-4">
                             <Input v-model="supportMessage" placeholder="Say something nice..." class="bg-background" />
                             <!-- Email Input for Paystack -->
                             <Input v-if="!user" v-model="tipperEmail" type="email" placeholder="Your Email (for receipt)" class="bg-background" />

                             <Button :loading="processingPayment" @click="handleSupport" size="lg" class="w-full font-bold shadow-lg shadow-primary/20">
                                 Support {{ selectedTier ? formatCurrency(selectedTier.price) : '...' }}
                             </Button>
                             <p class="text-xs text-center text-text-secondary">
                                 Secured by Paystack
                             </p>
                         </div>
                    </div>
                 </div>

                 <div v-else-if="activeTab === 'socials'" class="max-w-md mx-auto space-y-4">
                     <!-- Socials Content -->
                    <div v-if="profile?.socialLinks && profile.socialLinks.length > 0" class="space-y-3">
                        <a
                            v-for="link in profile.socialLinks"
                            :key="link.url"
                            :href="link.url"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="bg-surface hover:bg-surface-hover border border-primary/20 rounded-xl py-4 px-6 font-medium transition-all hover:-translate-y-1 flex items-center justify-between group shadow-sm"
                        >
                            <span class="flex items-center gap-4">
                                <div class="p-2 bg-primary/10 rounded-full text-primary group-hover:scale-110 transition-transform">
                                    <component :is="getSocialIcon(link.platform)" class="w-5 h-5" />
                                </div>
                                <span class="text-lg">{{ link.platform }}</span>
                            </span>
                            <ChevronRight class="w-5 h-5 text-text-secondary" />
                        </a>
                    </div>
                    <!-- Empty State for Socials -->
                    <div v-else class="text-center py-12 bg-surface/50 rounded-2xl border border-dashed border-border">
                        <div class="text-4xl mb-3 opacity-50">📭</div>
                        <p class="text-text-secondary">No social links added yet.</p>
                    </div>
                 </div>

                <!-- Paystack Inline Script -->
                <Script src="https://js.paystack.co/v1/inline.js" />
            </div>
        </div>
    </div>
</template>
