<script setup lang="ts">
import { doc, updateDoc } from 'firebase/firestore'
import { useAuth } from '~/composables/useAuth'
import { usePageMeta } from '~/composables/usePageMeta'
import { db } from '~/firebase'

definePageMeta({
  layout: 'dashboard'
})

usePageMeta({
  title: 'Settings'
})

const { user, userProfile } = useAuth()
const toast = useToast()

// Form State
const form = reactive({
    displayName: '',
    bio: '',
    tiers: [] as any[],
    socialLinks: [] as any[]
})

// Initialize form with user data
watchEffect(() => {
    if (userProfile.value) {
        form.displayName = userProfile.value.displayName || ''
        form.bio = userProfile.value.bio || ''
        form.tiers = userProfile.value.tiers ? JSON.parse(JSON.stringify(userProfile.value.tiers)) : []
        form.socialLinks = userProfile.value.socialLinks ? JSON.parse(JSON.stringify(userProfile.value.socialLinks)) : []
    }
})

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
    form.tiers.push({ amount: 5, emoji: '☕', label: 'Coffee' })
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
    <div class="min-h-screen bg-background text-text-primary p-6 md:p-12 pb-24">
        <div class="max-w-4xl mx-auto">
            <div class="flex items-center justify-between mb-8">
                <div>
                    <h1 class="text-3xl font-bold mb-2">Settings</h1>
                    <p class="text-text-secondary">Manage your public profile and support options.</p>
                </div>
                <Button :disabled="saving" @click="saveProfile" size="lg">
                    <span v-if="saving" class="animate-spin mr-2">⏳</span>
                    {{ saving ? 'Saving...' : 'Save Changes' }}
                </Button>
            </div>

            <div class="grid lg:grid-cols-3 gap-8">
                <!-- Main Settings Column -->
                <div class="lg:col-span-2 space-y-8">

                    <!-- Basic Info -->
                    <div class="bg-surface border border-white/5 rounded-2xl p-6 shadow-sm">
                        <h2 class="text-xl font-bold mb-6 flex items-center gap-2">
                            <span>👤</span> Profile Details
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
                    <div class="bg-surface border border-white/5 rounded-2xl p-6 shadow-sm">
                        <div class="flex items-center justify-between mb-6">
                            <h2 class="text-xl font-bold flex items-center gap-2">
                                <span>💰</span> Support Tiers
                            </h2>
                            <Button @click="addTier" variant="outline" size="sm">+ Add Tier</Button>
                        </div>

                        <div class="space-y-4">
                            <div v-for="(tier, index) in form.tiers" :key="index" class="flex gap-3 items-start p-4 bg-background rounded-xl border border-border">
                                <div class="w-16">
                                    <label class="text-xs text-text-secondary mb-1 block">Emoji</label>
                                    <Input v-model="tier.emoji" class="text-center text-xl" maxlength="2" />
                                </div>
                                <div class="flex-1">
                                    <label class="text-xs text-text-secondary mb-1 block">Amount ($)</label>
                                    <Input v-model="tier.amount" type="number" min="1" />
                                </div>
                                <div class="flex-1">
                                    <label class="text-xs text-text-secondary mb-1 block">Label</label>
                                    <Input v-model="tier.label" placeholder="e.g. Coffee" />
                                </div>
                                <button @click="removeTier(index)" class="mt-6 text-red-500 hover:bg-red-500/10 p-2 rounded-lg transition-colors">
                                    ✕
                                </button>
                            </div>

                            <div v-if="form.tiers.length === 0" class="text-center py-8 text-text-secondary italic">
                                No tiers added. Supporters won't have preset options.
                            </div>
                        </div>
                    </div>

                    <!-- Social Links -->
                    <div class="bg-surface border border-white/5 rounded-2xl p-6 shadow-sm">
                        <div class="flex items-center justify-between mb-6">
                            <h2 class="text-xl font-bold flex items-center gap-2">
                                <span>🔗</span> Social Links
                            </h2>
                            <Button @click="addSocial" variant="outline" size="sm">+ Add Link</Button>
                        </div>

                        <div class="space-y-4">
                            <div v-for="(link, index) in form.socialLinks" :key="index" class="flex flex-col sm:flex-row gap-3 items-start p-4 bg-background rounded-xl border border-border">
                                <div class="w-full sm:w-40">
                                    <select v-model="link.platform" class="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none">
                                        <option v-for="p in platforms" :key="p" :value="p">{{ p }}</option>
                                    </select>
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
                                         <span v-for="tier in form.tiers" :key="tier.amount" class="text-xs bg-surface border border-border px-2 py-1 rounded-md whitespace-nowrap">
                                             {{ tier.emoji }} ${{ tier.amount }}
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
