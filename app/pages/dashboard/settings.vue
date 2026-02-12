<script setup lang="ts">
import { doc, updateDoc } from 'firebase/firestore'
import { useAuth } from '~/composables/useAuth'
import { usePageMeta } from '~/composables/usePageMeta'
import { db } from '~/firebase'
import Skeleton from '~/components/ui/Skeleton.vue'
import Select from '~/components/ui/Select.vue'
import { useBankDetails } from '~/composables/useBankDetails'
import { User, DollarSign, Link as LinkIcon, CreditCard, Trash2, Plus } from 'lucide-vue-next'
import BankModal from '~/components/dashboard/BankModal.vue'

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

const form = reactive({
    displayName: '',
    bio: '',
    tiers: [] as any[],
    socialLinks: [] as any[]
})

const emojis = ['☕', '🍕', '🍺', '🍪', '🥐', '🌮', '🍣', '🍦', '🍩', '🍫']
const getRandomEmoji = () => emojis[Math.floor(Math.random() * emojis.length)]

watch(() => userProfile.value, (newProfile) => {
    if (newProfile) {
        form.displayName = newProfile.displayName || ''
        form.bio = newProfile.bio || ''
        form.tiers = newProfile.tiers ? JSON.parse(JSON.stringify(newProfile.tiers)) : []
        form.socialLinks = newProfile.socialLinks ? JSON.parse(JSON.stringify(newProfile.socialLinks)) : []
        form.tiers.forEach(tier => {
            if (!tier.emoji) {
                tier.emoji = getRandomEmoji()
            }
        })
    }
}, { immediate: true })

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


const addTier = () => {
    form.tiers.push({ price: 5, emoji: getRandomEmoji(), label: 'Support' })
}
const removeTier = (index: number) => {
    form.tiers.splice(index, 1)
}
const addSocial = () => {
    form.socialLinks.push({ platform: 'Twitter', url: '' })
}
const removeSocial = (index: number) => {
    form.socialLinks.splice(index, 1)
}

const platforms = ['Twitter', 'Instagram', 'YouTube', 'LinkedIn', 'Website', 'TikTok']

const { accounts: bankAccounts, loading: bankLoading, fetchAccounts, deleteAccount, setPrimaryAccount } = useBankDetails()

let unsubscribe: (() => void) | undefined

onMounted(() => {
    unsubscribe = fetchAccounts()
})

onUnmounted(() => {
    if (unsubscribe) {
        unsubscribe()
    }
})

const showBankModal = ref(false)

const handleDeleteBank = async (id: string) => {
    if (confirm('Are you sure you want to remove this bank account?')) {
        await deleteAccount(id)
        toast.add({ title: 'Removed', description: 'Bank account removed.' })
    }
}

const handleSetPrimaryBank = async (id: string) => {
    await setPrimaryAccount(id)
    toast.add({ title: 'Updated', description: 'Primary payout method updated.' })
}
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

            <div v-else class="grid lg:grid-cols-3 gap-8 animate-fade-in-up">
                <div class="lg:col-span-2 space-y-8">

                    <div class="bg-surface border border-primary/20 rounded-2xl p-3 lg:p-6 shadow-sm">
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

                    <div class="bg-surface border border-primary/20 rounded-2xl p-3 lg:p-6 shadow-sm">
                        <div class="flex items-center justify-between mb-6">
                            <h2 class="text-xl font-bold flex items-center gap-2">
                                <div class="p-2 bg-green-500/10 rounded-lg text-green-500">
                                    <DollarSign class="w-5 h-5" />
                                </div>
                                <span>Support Tiers</span>
                            </h2>
                            <Button @click="addTier" variant="outline" size="sm">
                                <Plus :size="16"/>
                                <span class="md:block hidden">Add Tier</span>
                            </Button>
                        </div>

                        <div class="space-y-4">
                            <div v-for="(tier, index) in form.tiers" :key="index" class="flex flex-col sm:flex-row gap-3 items-start p-4 bg-background rounded-xl border border-border">
                                <button @click="removeTier(index)" class="lg:hidden block self-end sm:mt-6 text-red-500 hover:bg-red-500/10 p-2 rounded-lg transition-colors">
                                    ✕
                                </button>
                                <div class="flex gap-3 w-full sm:contents">
                                    <div class="w-[20%] sm:w-16">
                                        <label class="text-xs text-text-secondary mb-1 block">Emoji</label>
                                        <Input v-model="tier.emoji" class="text-center text-xl" maxlength="1" />
                                    </div>
                                    <div class="flex-1 sm:flex-initial sm:w-24">
                                        <label class="text-xs text-text-secondary mb-1 block">Amount (₦)</label>
                                        <Input v-model="tier.price" type="number" min="1" />
                                    </div>
                                </div>
                                <div class="w-full sm:flex-1">
                                    <label class="text-xs text-text-secondary mb-1 block">Label</label>
                                    <Input v-model="tier.label" placeholder="e.g. Coffee" />
                                </div>
                                <button @click="removeTier(index)" class="lg:block hidden self-end sm:mt-6 text-red-500 hover:bg-red-500/10 p-2 rounded-lg transition-colors">
                                    ✕
                                </button>
                            </div>

                            <div v-if="form.tiers.length === 0" class="text-center py-8 text-text-secondary italic">
                                No tiers added. Supporters won't have preset options.
                            </div>
                        </div>
                    </div>

                    <div class="bg-surface border border-primary/20 rounded-2xl p-3 lg:p-6 shadow-sm">
                        <div class="flex items-center justify-between mb-6">
                            <h2 class="text-xl font-bold flex items-center gap-2">
                                <div class="p-2 bg-purple-500/10 rounded-lg text-purple-500">
                                    <LinkIcon class="w-5 h-5" />
                                </div>
                                <span>Social Links</span>
                            </h2>
                            <Button @click="addSocial" variant="outline" size="sm">
                                <Plus :size="16"/>
                                <span class="md:block hidden">Add Link</span>
                            </Button>
                        </div>

                        <div class="space-y-4">
                            <div v-for="(link, index) in form.socialLinks" :key="index" class="flex flex-col sm:flex-row gap-3 items-start p-4 bg-background rounded-xl border border-border">
                                <button @click="removeSocial(index)" class="lg:hidden block self-end sm:self-center text-red-500 hover:bg-red-500/10 p-2 rounded-lg transition-colors">
                                    ✕
                                </button>
                                <div class="w-full sm:w-48">
                                    <Select v-model="link.platform" :options="platforms" placeholder="Platform" />
                                </div>
                                <div class="flex-1 w-full">
                                    <Input v-model="link.url" placeholder="https://..." />
                                </div>
                                <button @click="removeSocial(index)" class="lg:block hidden self-end sm:self-center text-red-500 hover:bg-red-500/10 p-2 rounded-lg transition-colors">
                                    ✕
                                </button>
                            </div>

                             <div v-if="form.socialLinks.length === 0" class="text-center py-8 text-text-secondary italic">
                                Add your social media profiles to appear on your page.
                            </div>
                        </div>
                    </div>

                    <!-- Bank Details -->
                    <div class="bg-surface border border-primary/20 rounded-2xl p-3 lg:p-6 shadow-sm">
                        <div class="flex items-center justify-between mb-6">
                            <h2 class="text-xl font-bold flex items-center gap-2">
                                <div class="p-2 bg-pink-500/10 rounded-lg text-pink-500">
                                    <CreditCard class="w-5 h-5" />
                                </div>
                                <span>Payout Methods</span>
                            </h2>
                            <Button @click="showBankModal = true" variant="outline" size="sm">
                                <Plus :size="16"/>
                                <span class="md:block hidden">Add Method</span>
                            </Button>
                        </div>

                        <div class="space-y-4">
                            <div v-if="bankLoading" class="space-y-3">
                                <Skeleton class="h-16 w-full rounded-xl" />
                                <Skeleton class="h-16 w-full rounded-xl" />
                            </div>

                            <template v-else>
                                <div v-for="account in bankAccounts" :key="account.id"
                                    class="flex flex-col sm:flex-row gap-4 items-center justify-between p-3 md:p-4 bg-background rounded-xl border transition-all"
                                    :class="account.isPrimary ? 'border-primary/50 bg-primary/5' : 'border-border'"
                                >
                                    <div class="flex items-start md:items-center gap-4 w-full sm:w-auto">
                                        <div class="p-2 md:p-3 bg-surface rounded-lg border border-white/5">
                                            <CreditCard class="size-4 md:size-6 text-text-secondary" />
                                        </div>
                                        <div>
                                            <div class="font-bold flex items-center gap-2">
                                                <p class="text-sm md:text-base">{{ account.bankName }}</p>
                                                <span v-if="account.isPrimary" class="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                                                    Primary
                                                </span>
                                            </div>
                                            <div class="text-sm text-text-secondary">{{ account.accountName }}</div>
                                            <div class="text-sm text-text-secondary font-mono">{{ account.accountNumber }}</div>
                                        </div>
                                    </div>

                                    <div class="flex items-center gap-2 w-full sm:w-auto justify-end">
                                        <Button v-if="!account.isPrimary" @click="handleSetPrimaryBank(account.id)" variant="ghost" size="sm" class="text-xs">
                                            Make Primary
                                        </Button>
                                        <button @click="handleDeleteBank(account.id)" class="text-text-secondary hover:text-red-500 p-2 rounded-lg transition-colors">
                                            <Trash2 class="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div v-if="bankAccounts.length === 0" class="text-center py-8 text-text-secondary italic">
                                    No payout methods added. You won't be able to receive funds.
                                </div>
                            </template>
                        </div>
                    </div>

                    <div class="hidden lg:flex justify-end pt-4">
                        <Button :loading="saving" @click="saveProfile" size="lg" class="w-full sm:w-auto min-w-[150px]">
                            Save Changes
                        </Button>
                    </div>

                </div>

                <div class="lg:col-span-1">
                    <div class="sticky top-24 space-y-6">
                        <div class="bg-surface border border-white/5 rounded-2xl p-6 shadow-lg">
                            <h3 class="font-bold mb-4 text-text-secondary uppercase text-xs tracking-wider">Live Preview</h3>

                            <div class="bg-background rounded-xl overflow-hidden border border-border pb-4">
                                <!-- Banner -->
                                <div class="h-28 bg-gradient-to-r from-primary/80 to-accent/80 relative">
                                    <div class="absolute inset-0 bg-black/10"></div>
                                </div>
                                <div class="px-5 relative">
                                    <!-- Avatar -->
                                    <div class="-mt-12 mb-3">
                                        <Avatar :src="userProfile?.avatarUrl" class="w-24 h-24 border-4 border-background shadow-xl" />
                                    </div>

                                    <!-- Profile Info -->
                                    <div class="mb-6">
                                        <h4 class="font-bold text-xl">{{ form.displayName || 'Your Name' }}</h4>
                                        <p class="text-sm text-text-secondary mb-2">@{{ userProfile?.username }}</p>
                                        <p class="text-sm text-text-secondary line-clamp-3 leading-relaxed">{{ form.bio || 'Your bio will appear here...' }}</p>
                                    </div>

                                    <!-- Support Section Preview -->
                                    <div class="bg-surface border border-primary/20 rounded-xl p-4 shadow-sm">
                                        <h5 class="font-bold text-sm mb-3 text-center">Support {{ form.displayName?.split(' ')[0] || 'User' }}</h5>
                                        <div class="grid grid-cols-3 gap-2 mb-3">
                                            <div v-for="tier in form.tiers.slice(0, 3)" :key="tier.price" class="flex flex-col items-center justify-center p-2 rounded-lg border border-border bg-background hover:border-primary/50 text-center">
                                                <span class="text-lg mb-1">{{ tier.emoji }}</span>
                                                <span class="font-bold text-xs">{{ formatCurrency(tier.price) }}</span>
                                            </div>
                                        </div>
                                        <div class="h-8 bg-background rounded-lg border border-border w-full mb-2"></div>
                                        <div class="h-8 bg-primary rounded-lg w-full text-white flex items-center justify-center text-center">Support</div>
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
                <Button :loading="saving" @click="saveProfile" size="lg" class="lg:hidden block w-full min-w-[150px]">
                    Save Changes
                </Button>
            </div>
        </div>

        <!-- Add Bank Modal -->
        <BankModal :isOpen="showBankModal" @close="showBankModal = false" />
    </div>
</template>
