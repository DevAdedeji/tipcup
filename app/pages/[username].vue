<script setup lang="ts">
import { useProfile, type PublicProfile } from '~/composables/useProfile'
import { ChevronRight, Check } from 'lucide-vue-next'

const route = useRoute()
const username = computed(() => route.params.username as string)

const { fetchProfileByUsername, loading, error } = useProfile()
const profile = ref<PublicProfile | null>(null)

// Fetch profile on mount
onMounted(async () => {
    if (username.value) {
        profile.value = await fetchProfileByUsername(username.value)
    }
})

// SEO
useHead({
    title: computed(() => profile.value ? `${profile.value.displayName} (@${profile.value.username})` : 'Profile Not Found')
})

const activeTab = ref('home')
const tabs = [
    { id: 'home', label: 'Home' },
    { id: 'socials', label: 'Socials' },
    // { id: 'posts', label: 'Posts' } // Future
]

const selectedTier = ref<any>(null)
</script>

<template>
    <div class="min-h-screen bg-background text-text-primary pb-20">
        <!-- Loading State -->
        <div v-if="loading" class="flex items-center justify-center min-h-[50vh]">
             <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>

        <!-- 404 State -->
        <div v-else-if="!profile && !loading" class="flex flex-col items-center justify-center min-h-screen text-center px-4">
             <div class="h-[50vh] flex flex-col items-center justify-center">
                <div class="text-6xl mb-4">😕</div>
                <h1 class="text-3xl font-bold mb-2">Profile not found</h1>
                <p class="text-text-secondary mb-6">The user @{{ username }} does not exist.</p>
                <Button to="/" variant="outline">Go Home</Button>
             </div>
        </div>

        <!-- Profile Content -->
        <!-- Use v-else-if="profile" top satisfy TS that profile is not null here -->
        <div v-else-if="profile" class="animate-fade-in-up">
            <!-- Header / Cover -->
            <div class="h-48 md:h-64 bg-gradient-to-r from-primary/80 to-accent/80 relative">
                <div class="absolute inset-0 bg-black/10"></div>
            </div>

            <div class="max-w-4xl mx-auto px-4 sm:px-6 relative">
                 <!-- Avatar -->
                 <div class="-mt-20 mb-6 flex flex-col items-center sm:items-start sm:flex-row sm:gap-6">
                    <Avatar :src="profile?.avatarUrl" size="xl" class="w-32 h-32 md:w-40 md:h-40 border-4 border-background shadow-xl" />

                    <div class="mt-4 sm:mt-24 text-center sm:text-left flex-1">
                        <h1 class="text-3xl font-bold">{{ profile?.displayName }}</h1>
                        <p class="text-text-secondary">@{{ profile?.username }}</p>
                        <p v-if="profile?.bio" class="mt-2 max-w-lg text-text-secondary leading-relaxed">{{ profile?.bio }}</p>
                    </div>

                    <!-- Follow / Share Actions (Placeholder) -->
                    <div class="mt-6 sm:mt-24 flex gap-3">
                        <Button variant="outline" size="sm">
                            <span class="mr-2">🔗</span> Share
                        </Button>
                         <!-- <Button size="sm">Follow</Button> -->
                    </div>
                 </div>

                 <!-- Navigation Tabs -->
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

                 <!-- Tab Content: Home (Support) -->
                 <div v-if="activeTab === 'home'" class="grid md:grid-cols-3 gap-8">
                     <!-- Left: About / Feed (Placeholder) -->
                     <div class="md:col-span-2 space-y-6">
                        <div class="bg-surface border border-white/5 rounded-2xl p-6 sm:p-8 text-center text-text-secondary italic">
                            Authorization required to view posts. <br/>
                            Support {{ profile?.displayName }} to unlock exclusive content!
                        </div>
                     </div>

                     <!-- Right: Support Panel (Sticky on Desktop) -->
                     <div class="md:col-span-1">
                        <div class="bg-surface border border-white/5 rounded-2xl p-6 shadow-xl sticky top-24">
                            <h3 class="font-bold text-xl mb-4">Support {{ profile?.displayName?.split(' ')[0] }}</h3>

                            <!-- Tiers Grid -->
                            <div class="grid grid-cols-3 gap-3 mb-6">
                                <button
                                    v-for="tier in profile?.tiers"
                                    :key="tier.amount"
                                    @click="selectedTier = tier"
                                    class="flex flex-col items-center justify-center p-3 rounded-xl border transition-all"
                                    :class="[
                                        selectedTier === tier
                                        ? 'border-primary bg-primary/10 text-primary scale-105 shadow-[0_0_15px_rgba(255,107,53,0.2)]'
                                        : 'border-border bg-background hover:border-primary/50'
                                    ]"
                                >
                                    <span class="text-2xl mb-1">{{ tier.emoji || '☕' }}</span>
                                    <span class="font-bold">${{ tier.amount }}</span>
                                </button>
                            </div>

                            <div class="space-y-4">
                                <Input placeholder="Say something nice..." class="bg-background" />
                                <Button size="lg" class="w-full font-bold shadow-lg shadow-primary/20">
                                    Support ${{ selectedTier?.amount || '...' }}
                                </Button>
                                <p class="text-xs text-center text-text-secondary">
                                    Only secure payments.
                                </p>
                            </div>
                        </div>
                     </div>
                 </div>

                 <!-- Tab Content: Socials (Link in Bio) -->
                 <div v-else-if="activeTab === 'socials'" class="max-w-md mx-auto space-y-4 py-8">
                    <div v-if="profile?.socialLinks && profile.socialLinks.length > 0" class="space-y-3">
                        <a
                            v-for="link in profile.socialLinks"
                            :key="link.url"
                            :href="link.url"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="block bg-surface hover:bg-surface-hover border border-border rounded-xl py-4 px-6 font-medium transition-all hover:-translate-y-1 flex items-center justify-between group shadow-sm"
                        >
                            <span class="flex items-center gap-4">
                                <!-- Platform Icon Logic (Simplified) -->
                                <span class="text-2xl group-hover:scale-110 transition-transform">
                                    {{
                                        link.platform.toLowerCase().includes('twitter') ? '🐦' :
                                        link.platform.toLowerCase().includes('instagram') ? '📸' :
                                        link.platform.toLowerCase().includes('youtube') ? '📺' :
                                        link.platform.toLowerCase().includes('linkedin') ? '💼' :
                                        '🔗'
                                    }}
                                </span>
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
