<script setup lang="ts">
import { doc, updateDoc } from 'firebase/firestore'
import { useAuth } from '~/composables/useAuth'
import { usePageMeta } from '~/composables/usePageMeta'
import { db } from '~/firebase'
import Skeleton from '~/components/ui/Skeleton.vue'
import Select from '~/components/ui/Select.vue'
import { User, DollarSign, Link as LinkIcon, Save } from 'lucide-vue-next'

definePageMeta({
  layout: 'dashboard',
  title: 'Settings',
  subtitle: 'Manage your profile and settings'
})

usePageMeta({
  title: 'Settings',
})



const { user, userProfile, loading } = useAuth()
const toast = useToast()

// Form State
const form = reactive({
    displayName: '',
    bio: '',
    tiers: [] as any[],
    socialLinks: [] as any[]
})

const emojis = ['☕', '🍕', '🍺', '🍪', '🥐', '🌮', '🍣', '🍦', '🍩', '🍫']
const getRandomEmoji = () => emojis[Math.floor(Math.random() * emojis.length)]
// Initialize form with user data
watch(() => userProfile.value, (newProfile) => {
    if (newProfile) {
        form.displayName = newProfile.displayName || ''
        form.bio = newProfile.bio || ''
        // Deep copy arrays to avoid reactivity issues with original object
        form.tiers = newProfile.tiers ? JSON.parse(JSON.stringify(newProfile.tiers)) : []
        form.socialLinks = newProfile.socialLinks ? JSON.parse(JSON.stringify(newProfile.socialLinks)) : []

        // Auto-assign emojis to existing tiers if missing
        form.tiers.forEach(tier => {
            if (!tier.emoji) {
                tier.emoji = getRandomEmoji()
            }
        })
    }
}, { immediate: true })

// Saving state
const saving = ref(false)

const saveProfile = async () => {
    if (!user.value) return
    saving.value = true

    try {
        const userRef = doc(db, 'users', user.value.uid)
        await updateDoc(userRef, {
            displayName: form.displayName,
            bio: form.bio,
            tiers: form.tiers,
            socialLinks: form.socialLinks
        })
        toast.add({ title: 'Success', description: 'Profile updated successfully!' })
    } catch (e: any) {
        console.error(e)
        toast.add({ title: 'Error', description: 'Failed to update profile.', type: 'error' })
    } finally {
        saving.value = false
    }
}

// Tiers Management
const addTier = () => {
    form.tiers.push({ price: 5, emoji: getRandomEmoji(), label: 'Support' })
}
const removeTier = (index: number) => {
    form.tiers.splice(index, 1)
}

// Socials Management
const addSocial = () => {
    form.socialLinks.push({ platform: 'Twitter', url: '' })
}
const removeSocial = (index: number) => {
    form.socialLinks.splice(index, 1)
}

const platforms = ['Twitter', 'Instagram', 'YouTube', 'LinkedIn', 'Website', 'TikTok']
</script>

<template>
    <div class="min-h-screen bg-background text-text-primary pb-24">
        <div class="mx-auto">


            <!-- Loading Skeleton -->
            <div v-if="loading" class="grid lg:grid-cols-3 gap-8 animate-fade-in-up">
                 <div class="lg:col-span-2 space-y-8">
                     <div class="bg-surface border border-white/5 rounded-2xl p-6">
                         <Skeleton class="h-6 w-32 mb-6" />
                         <div class="space-y-4">
                             <div>
                                 <Skeleton class="h-4 w-24 mb-2" />
                                 <Skeleton class="h-10 w-full" />
                             </div>
                             <div>
                                 <Skeleton class="h-4 w-12 mb-2" />
                                 <Skeleton class="h-32 w-full" />
                             </div>
                         </div>
                     </div>
                     <div class="bg-surface border border-white/5 rounded-2xl p-6">
                         <div class="flex justify-between mb-6">
                             <Skeleton class="h-6 w-32" />
                             <Skeleton class="h-8 w-24" />
                         </div>
                         <div class="space-y-4">
                             <Skeleton class="h-20 w-full rounded-xl" />
                             <Skeleton class="h-20 w-full rounded-xl" />
                         </div>
                     </div>
                 </div>
                 <div class="lg:col-span-1">
                      <div class="bg-surface border border-white/5 rounded-2xl p-6">
                          <Skeleton class="h-4 w-24 mb-4" />
                          <Skeleton class="h-64 w-full rounded-xl" />
                      </div>
                 </div>
            </div>

            <!-- Main Settings Grid -->
            <div v-else class="grid lg:grid-cols-3 gap-8 animate-fade-in-up">
                <!-- Main Settings Column -->
                <div class="lg:col-span-2 space-y-8">

                    <!-- Basic Info -->
                    <div class="bg-surface border border-white/5 rounded-2xl p-3 lg:p-6 shadow-sm">
                        <h2 class="text-xl font-bold mb-6 flex items-center gap-2">
                            <div class="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                                <User class="w-5 h-5" />
                            </div>
                            <span>Profile Details</span>
                        </h2>

                        <div class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-text-secondary mb-1">Display Name</label>
                                <Input v-model="form.displayName" placeholder="e.g. Sarah's Art" />
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-text-secondary mb-1">Bio</label>
                                <Textarea v-model="form.bio" placeholder="Tell your supporters about what you do..." class="min-h-[120px]" />
                                <p class="text-xs text-text-secondary text-right mt-1">{{ form.bio.length }}/160</p>
                            </div>
                        </div>
                    </div>

                    <!-- Support Tiers -->
                    <div class="bg-surface border border-white/5 rounded-2xl p-3 lg:p-6 shadow-sm">
                        <div class="flex items-center justify-between mb-6">
                            <h2 class="text-xl font-bold flex items-center gap-2">
                                <div class="p-2 bg-green-500/10 rounded-lg text-green-500">
                                    <DollarSign class="w-5 h-5" />
                                </div>
                                <span>Support Tiers</span>
                            </h2>
                            <Button @click="addTier" variant="outline" size="sm">+ Add Tier</Button>
                        </div>

                        <div class="space-y-4">
                            <div v-for="(tier, index) in form.tiers" :key="index" class="flex flex-col sm:flex-row gap-3 items-start p-4 bg-background rounded-xl border border-border">
                                <div class="flex gap-3 w-full sm:contents">
                                    <div class="w-1/3 sm:w-16">
                                        <label class="text-xs text-text-secondary mb-1 block">Emoji</label>
                                        <Input v-model="tier.emoji" class="text-center text-xl" maxlength="2" />
                                    </div>
                                    <div class="flex-1 sm:flex-initial sm:w-24">
                                        <label class="text-xs text-text-secondary mb-1 block">Price ($)</label>
                                        <Input v-model="tier.price" type="number" min="1" />
                                    </div>
                                </div>
                                <div class="w-full sm:flex-1">
                                    <label class="text-xs text-text-secondary mb-1 block">Label</label>
                                    <Input v-model="tier.label" placeholder="e.g. Coffee" />
                                </div>
                                <button @click="removeTier(index)" class="self-end sm:mt-6 text-red-500 hover:bg-red-500/10 p-2 rounded-lg transition-colors">
                                    ✕
                                </button>
                            </div>

                            <div v-if="form.tiers.length === 0" class="text-center py-8 text-text-secondary italic">
                                No tiers added. Supporters won't have preset options.
                            </div>
                        </div>
                    </div>

                    <!-- Social Links -->
                    <div class="bg-surface border border-white/5 rounded-2xl p-3 lg:p-6 shadow-sm">
                        <div class="flex items-center justify-between mb-6">
                            <h2 class="text-xl font-bold flex items-center gap-2">
                                <div class="p-2 bg-purple-500/10 rounded-lg text-purple-500">
                                    <LinkIcon class="w-5 h-5" />
                                </div>
                                <span>Social Links</span>
                            </h2>
                            <Button @click="addSocial" variant="outline" size="sm">+ Add Link</Button>
                        </div>

                        <div class="space-y-4">
                            <div v-for="(link, index) in form.socialLinks" :key="index" class="flex flex-col sm:flex-row gap-3 items-start p-4 bg-background rounded-xl border border-border">
                                <div class="w-full sm:w-48">
                                    <Select v-model="link.platform" :options="platforms" placeholder="Platform" />
                                </div>
                                <div class="flex-1 w-full">
                                    <Input v-model="link.url" placeholder="https://..." />
                                </div>
                                <button @click="removeSocial(index)" class="self-end sm:self-center text-red-500 hover:bg-red-500/10 p-2 rounded-lg transition-colors">
                                    ✕
                                </button>
                            </div>

                             <div v-if="form.socialLinks.length === 0" class="text-center py-8 text-text-secondary italic">
                                Add your social media profiles to appear on your page.
                            </div>
                        </div>
                    </div>

                    <!-- Submit Button -->
                    <div class="flex justify-end pt-4">
                        <Button :disabled="saving" @click="saveProfile" size="lg" class="w-full sm:w-auto min-w-[150px]">
                            <span v-if="saving" class="animate-spin mr-2">⏳</span>
                            <span v-else class="mr-2"><Save class="w-4 h-4" /></span>
                            {{ saving ? 'Saving...' : 'Save Changes' }}
                        </Button>
                    </div>

                </div>

                <!-- Preview Column (Sticky) -->
                <div class="lg:col-span-1">
                    <div class="sticky top-24 space-y-6">
                        <div class="bg-surface border border-white/5 rounded-2xl p-6 shadow-lg">
                            <h3 class="font-bold mb-4 text-text-secondary uppercase text-xs tracking-wider">Live Preview</h3>

                            <!-- Mini Profile Card Preview -->
                            <div class="bg-background rounded-xl overflow-hidden border border-border">
                                <div class="h-24 bg-gradient-to-r from-primary to-accent relative">
                                    <Avatar :src="userProfile?.avatarUrl" class="absolute -bottom-6 left-4 w-16 h-16 border-4 border-background" />
                                </div>
                                <div class="pt-8 px-4 pb-4">
                                     <h4 class="font-bold text-lg">{{ form.displayName || 'Your Name' }}</h4>
                                     <p class="text-xs text-text-secondary mb-3">@{{ userProfile?.username }}</p>
                                     <p class="text-sm text-text-secondary line-clamp-3 mb-4">{{ form.bio || 'Your bio will appear here...' }}</p>

                                     <div class="flex gap-2 overflow-x-auto pb-2">
                                         <span v-for="tier in form.tiers" :key="tier.price" class="text-xs bg-surface border border-border px-2 py-1 rounded-md whitespace-nowrap">
                                             {{ tier.emoji }} ${{ tier.price }}
                                         </span>
                                     </div>
                                </div>
                            </div>

                            <div class="mt-4">
                                <Button :to="`/${userProfile?.username}`" variant="outline" class="w-full">
                                    View Live Page <span class="ml-2">↗</span>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
