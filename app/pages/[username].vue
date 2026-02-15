<script setup lang="ts">
import { useProfile, type PublicProfile } from '~/composables/useProfile'
import { usePaymentFlow } from '~/composables/usePaymentFlow'
import { useShare } from '~/composables/useShare'
import { useSupport } from '~/composables/useSupport'
import { ChevronRight, Share2, ChevronDown, ChevronUp } from 'lucide-vue-next'
import Skeleton from '~/components/ui/Skeleton.vue'
import GoalProgress from '~/components/dashboard/GoalProgress.vue'
import { formatCurrency } from '~/utils/format'
import { getSocialIcon } from '~/utils/socials'

const route = useRoute()
const router = useRouter()
const username = computed(() => route.params.username as string)

const { fetchProfileByUsername, loading } = useProfile()
const { checkPaymentCallback } = usePaymentFlow()
const { shareUrl } = useShare()
const { selectedTier, supportMessage, tipperEmail, handleSupport, processingPayment, verifyingPayment, tierLabel } = useSupport()

const profile = ref<PublicProfile | null>(null)
const toast = useToast()

const isBioExpanded = ref(false)
const BIO_LIMIT = 150

const displayBio = computed(() => {
    if (!profile.value?.bio) return ''
    if (isBioExpanded.value || profile.value.bio.length <= BIO_LIMIT) return profile.value.bio
    return profile.value.bio.slice(0, BIO_LIMIT) + '...'
})

const showReadMore = computed(() => {
    return profile.value?.bio && profile.value.bio.length > BIO_LIMIT
})

onMounted(async () => {
    loading.value = true

    // Fetch profile
    if (username.value) {
        profile.value = await fetchProfileByUsername(username.value)
    } else {
        loading.value = false
    }

    // Check for payment callback and handle it
    const callbackResult = await checkPaymentCallback()
    if (callbackResult?.status === 'success') {
         toast.add({ title: 'Thank You!', description: `Successfully supported ${profile.value?.displayName || 'creator'}!`, type: 'success' })
         // Refetch profile to update goal progress
        if (username.value) {
            const updatedProfile = await fetchProfileByUsername(username.value)
            if (updatedProfile) profile.value = updatedProfile
        }
    }
})

const pageTitle = computed(() => loading.value ? 'Loading...' : profile.value ? `${profile.value.displayName} (@${profile.value.username})` : 'Profile Not Found')

usePageMeta({
    title: pageTitle
})

const activeTab = ref('home')
const tabs = [
    { id: 'home', label: 'Home' },
    { id: 'socials', label: 'Socials' },
]

const { user } = useAuth()

const onSupportClick = () => {
    if (profile.value) {
        handleSupport(profile.value)
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
            <div class="h-48 md:h-64 bg-gradient-to-r from-primary/80 to-accent/80 relative group">
                <div class="absolute inset-0 bg-black/10"></div>

                 <!-- Share Button -->
                 <div class="absolute top-4 right-4 md:bottom-6 md:top-auto md:right-8 z-10">
                    <Button
                        @click="shareUrl()"
                        variant="secondary"
                        size="md"
                    >
                        <Share2 class="w-4 h-4 mr-2" />
                        Share Page
                    </Button>
                </div>
            </div>

            <div class="max-w-4xl mx-auto px-4 sm:px-6 relative">
                 <div class="-mt-20 mb-6 flex flex-col items-center sm:items-start sm:flex-row sm:gap-6">
                    <Avatar :src="profile?.avatarUrl" size="xl" class="w-32 h-32 md:w-40 md:h-40 border-4 border-background shadow-xl" />

                    <div class="mt-4 sm:mt-24 text-center sm:text-left flex-1 max-w-2xl">
                        <h1 class="text-3xl font-bold tracking-tight">{{ profile?.displayName }}</h1>
                        <p class="text-text-secondary font-medium">@{{ profile?.username }}</p>

                        <div v-if="profile?.bio" class="mt-4 text-text-secondary leading-relaxed relative">
                             <p :class="{'line-clamp-3': !isBioExpanded && !showReadMore}">
                                {{ displayBio }}
                             </p>
                             <button
                                v-if="showReadMore"
                                @click="isBioExpanded = !isBioExpanded"
                                class="text-primary text-sm font-medium hover:underline mt-1 flex items-center gap-1 mx-auto sm:mx-0"
                            >
                                {{ isBioExpanded ? 'Read Less' : 'Read More' }}
                                <component :is="isBioExpanded ? ChevronUp : ChevronDown" class="w-3 h-3" />
                             </button>
                        </div>
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

                    <!-- Verification Loader -->
                    <div v-if="verifyingPayment" class="p-4 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center gap-3 animate-pulse mb-6">
                        <div class="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <span class="text-primary font-medium">Verifying your payment...</span>
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
                                 <span class="font-bold text-sm break-all px-1 text-center">{{ formatCurrency(tier.price) }}</span>
                             </button>
                         </div>

                         <div class="space-y-4">
                             <Input v-model="supportMessage" placeholder="Say something nice..." class="bg-background" />
                             <!-- Email Input -->
                             <Input v-if="!user" v-model="tipperEmail" type="email" placeholder="Your Email (for receipt)" class="bg-background" />

                             <Button :loading="processingPayment" :disabled="processingPayment || verifyingPayment" @click="onSupportClick" size="lg" class="w-full font-bold shadow-lg shadow-primary/20">
                                 Support {{ tierLabel }}
                             </Button>
                             <p class="text-xs text-center text-text-secondary">
                                 Secured by Flutterwave
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
            </div>
        </div>
    </div>
</template>
