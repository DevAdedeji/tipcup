<script setup lang="ts">
import { doc, updateDoc } from 'firebase/firestore'
import { useAuth } from '~/composables/useAuth'
import { usePageMeta } from '~/composables/usePageMeta'
import { db } from '~/firebase'
import Skeleton from '~/components/ui/Skeleton.vue'
import Select from '~/components/ui/Select.vue'
import { useBankDetails } from '~/composables/useBankDetails'
import { User, Coins, Link as LinkIcon, CreditCard, Trash2, Plus, ExternalLink, X } from 'lucide-vue-next'
import BankModal from '~/components/dashboard/BankModal.vue'
import AmountInput from '~/components/ui/AmountInput.vue'
import { DEFAULT_TIER_AMOUNT, MIN_TIP_AMOUNT, validateAmount, formatCurrency } from '~/utils/format'

definePageMeta({
  layout: 'dashboard',
  title: 'Settings',
  subtitle: 'Your profile, tiers, links and payouts',
})

usePageMeta({ title: 'Settings' })

const { user, userProfile, loading } = useAuth()
const toast = useToast()

const form = reactive({
    displayName: '',
    bio: '',
    tiers: [] as any[],
    socialLinks: [] as any[],
})

const emojis = ['☕', '🍕', '🍺', '🍪', '🥐', '🌮', '🍣', '🍦', '🍩', '🍫']
const getRandomEmoji = () => emojis[Math.floor(Math.random() * emojis.length)]

watch(
    () => userProfile.value,
    (newProfile) => {
        if (!newProfile) return
        form.displayName = newProfile.displayName || ''
        form.bio = newProfile.bio || ''
        form.tiers = newProfile.tiers ? JSON.parse(JSON.stringify(newProfile.tiers)) : []
        form.socialLinks = newProfile.socialLinks ? JSON.parse(JSON.stringify(newProfile.socialLinks)) : []
        form.tiers.forEach((tier) => {
            if (!tier.emoji) tier.emoji = getRandomEmoji()
        })
    },
    { immediate: true }
)

const saving = ref(false)

const invalidTier = computed(() =>
    form.tiers.find((tier: any) => validateAmount(tier.price, MIN_TIP_AMOUNT) !== null)
)

const saveProfile = async () => {
    if (!user.value) return

    if (invalidTier.value) {
        toast.add({
            title: 'Check your tiers',
            description: `Every tier must be at least ${formatCurrency(MIN_TIP_AMOUNT)}.`,
            type: 'error',
        })
        return
    }

    saving.value = true
    try {
        await updateDoc(doc(db, 'users', user.value.uid), {
            displayName: form.displayName,
            bio: form.bio,
            tiers: form.tiers,
            socialLinks: form.socialLinks,
        })
        toast.add({ title: 'Saved', description: 'Your page has been updated.', type: 'success' })
    } catch (e) {
        console.error(e)
        toast.add({ title: 'Error', description: 'Could not save your changes.', type: 'error' })
    } finally {
        saving.value = false
    }
}

const addTier = () => form.tiers.push({ price: DEFAULT_TIER_AMOUNT, emoji: getRandomEmoji(), label: 'Support' })
const removeTier = (index: number) => form.tiers.splice(index, 1)
const addSocial = () => form.socialLinks.push({ platform: 'Twitter', url: '' })
const removeSocial = (index: number) => form.socialLinks.splice(index, 1)

const platforms = ['Twitter', 'Instagram', 'YouTube', 'LinkedIn', 'Website', 'TikTok']

const {
    accounts: bankAccounts,
    loading: bankLoading,
    fetchAccounts,
    deleteAccount,
    setPrimaryAccount,
} = useBankDetails()

let unsubscribe: (() => void) | undefined
onMounted(() => {
    unsubscribe = fetchAccounts()
})
onUnmounted(() => unsubscribe?.())

const showBankModal = ref(false)

const handleDeleteBank = async (id: string) => {
    if (confirm('Remove this bank account?')) {
        await deleteAccount(id)
        toast.add({ title: 'Removed', description: 'Bank account removed.', type: 'success' })
    }
}

const handleSetPrimaryBank = async (id: string) => {
    await setPrimaryAccount(id)
    toast.add({ title: 'Updated', description: 'Primary payout account updated.', type: 'success' })
}
</script>

<template>
    <div class="pb-8">
        <div v-if="loading" class="grid gap-6 lg:grid-cols-3">
            <div class="space-y-6 lg:col-span-2">
                <Skeleton class="h-64" />
                <Skeleton class="h-72" />
            </div>
            <Skeleton class="h-96" />
        </div>

        <div v-else class="grid gap-6 lg:grid-cols-3">
            <div class="space-y-6 lg:col-span-2">
                <section class="border border-border bg-surface shadow-xs">
                    <header class="flex items-center gap-2.5 border-b border-border px-5 py-4">
                        <User class="h-4 w-4 text-text-tertiary" />
                        <h2 class="font-display text-lg font-semibold tracking-tight">Profile</h2>
                    </header>

                    <div class="space-y-4 p-5">
                        <Input v-model="form.displayName" label="Display name" placeholder="e.g. Ada Obi" />
                        <Textarea
                            v-model="form.bio"
                            label="Bio"
                            :rows="3"
                            :maxlength="160"
                            placeholder="Tell supporters what you make."
                        />
                    </div>
                </section>

                <section class="border border-border bg-surface shadow-xs">
                    <header class="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
                        <div class="flex items-center gap-2.5">
                            <Coins class="h-4 w-4 text-text-tertiary" />
                            <h2 class="font-display text-lg font-semibold tracking-tight">Support tiers</h2>
                        </div>
                        <Button variant="outline" size="sm" @click="addTier">
                            <template #prefix><Plus class="h-3.5 w-3.5" /></template>
                            Add
                        </Button>
                    </header>

                    <div class="space-y-3 p-5">
                        <div
                            v-for="(tier, index) in form.tiers"
                            :key="index"
                            class="flex flex-wrap items-start gap-3 border border-border bg-surface-sunken p-3"
                        >
                            <div class="w-16 shrink-0">
                                <Input v-model="tier.emoji" label="Icon" maxlength="2" class="text-center" />
                            </div>
                            <div class="w-32 shrink-0">
                                <AmountInput v-model="tier.price" label="Amount" size="md" />
                            </div>
                            <div class="min-w-[8rem] flex-1">
                                <Input v-model="tier.label" label="Label" placeholder="Coffee" />
                            </div>
                            <button
                                class="mt-7 flex h-11 w-9 shrink-0 items-center justify-center text-text-tertiary transition-colors hover:bg-error-muted hover:text-error"
                                :title="`Remove ${tier.label || 'tier'}`"
                                @click="removeTier(index)"
                            >
                                <X class="h-4 w-4" />
                            </button>
                        </div>

                        <p
                            v-if="form.tiers.length === 0"
                            class="border border-dashed border-border px-4 py-8 text-center text-sm text-text-secondary"
                        >
                            No tiers yet — supporters won't have preset amounts to pick from.
                        </p>

                        <p class="text-xs text-text-tertiary">
                            Minimum {{ formatCurrency(MIN_TIP_AMOUNT) }} per tier.
                        </p>
                    </div>
                </section>

                <section class="border border-border bg-surface shadow-xs">
                    <header class="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
                        <div class="flex items-center gap-2.5">
                            <LinkIcon class="h-4 w-4 text-text-tertiary" />
                            <h2 class="font-display text-lg font-semibold tracking-tight">Links</h2>
                        </div>
                        <Button variant="outline" size="sm" @click="addSocial">
                            <template #prefix><Plus class="h-3.5 w-3.5" /></template>
                            Add
                        </Button>
                    </header>

                    <div class="space-y-3 p-5">
                        <div
                            v-for="(link, index) in form.socialLinks"
                            :key="index"
                            class="flex flex-wrap items-center gap-3 border border-border bg-surface-sunken p-3"
                        >
                            <div class="w-full sm:w-44">
                                <Select v-model="link.platform" :options="platforms" placeholder="Platform" />
                            </div>
                            <div class="min-w-[10rem] flex-1">
                                <Input v-model="link.url" placeholder="https://…" />
                            </div>
                            <button
                                class="flex h-11 w-9 shrink-0 items-center justify-center text-text-tertiary transition-colors hover:bg-error-muted hover:text-error"
                                title="Remove link"
                                @click="removeSocial(index)"
                            >
                                <X class="h-4 w-4" />
                            </button>
                        </div>

                        <p
                            v-if="form.socialLinks.length === 0"
                            class="border border-dashed border-border px-4 py-8 text-center text-sm text-text-secondary"
                        >
                            Add your socials so everything lives on one page.
                        </p>
                    </div>
                </section>

                <section class="border border-border bg-surface shadow-xs">
                    <header class="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
                        <div class="flex items-center gap-2.5">
                            <CreditCard class="h-4 w-4 text-text-tertiary" />
                            <h2 class="font-display text-lg font-semibold tracking-tight">Payout accounts</h2>
                        </div>
                        <Button variant="outline" size="sm" @click="showBankModal = true">
                            <template #prefix><Plus class="h-3.5 w-3.5" /></template>
                            Add
                        </Button>
                    </header>

                    <div class="space-y-3 p-5">
                        <template v-if="bankLoading">
                            <Skeleton class="h-20" />
                            <Skeleton class="h-20" />
                        </template>

                        <template v-else>
                            <div
                                v-for="account in bankAccounts"
                                :key="account.id"
                                class="flex flex-wrap items-center justify-between gap-3 border p-4"
                                :class="account.isPrimary ? 'border-accent bg-accent-muted' : 'border-border bg-surface-sunken'"
                            >
                                <div class="min-w-0">
                                    <div class="flex flex-wrap items-center gap-2">
                                        <p class="font-semibold">{{ account.bankName }}</p>
                                        <Badge v-if="account.isPrimary" variant="accent">Primary</Badge>
                                    </div>
                                    <p class="mt-0.5 text-sm text-text-secondary">{{ account.accountName }}</p>
                                    <p class="tabular text-sm text-text-tertiary">{{ account.accountNumber }}</p>
                                </div>

                                <div class="flex items-center gap-1">
                                    <Button
                                        v-if="!account.isPrimary"
                                        variant="ghost"
                                        size="sm"
                                        @click="handleSetPrimaryBank(account.id)"
                                    >
                                        Make primary
                                    </Button>
                                    <button
                                        class="flex h-9 w-9 items-center justify-center text-text-tertiary transition-colors hover:bg-error-muted hover:text-error"
                                        title="Remove account"
                                        @click="handleDeleteBank(account.id)"
                                    >
                                        <Trash2 class="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            <p
                                v-if="bankAccounts.length === 0"
                                class="border border-dashed border-border px-4 py-8 text-center text-sm text-text-secondary"
                            >
                                Add a bank account so you can withdraw what you earn.
                            </p>
                        </template>
                    </div>
                </section>

                <div class="hidden justify-end lg:flex">
                    <Button size="lg" :loading="saving" @click="saveProfile">Save changes</Button>
                </div>
            </div>

            <aside class="lg:col-span-1">
                <div class="sticky top-24 space-y-4">
                    <p class="field-label">Live preview</p>

                    <div class="border border-border bg-background shadow-sm">
                        <AdireCloth :seed="userProfile?.username" class="h-20 w-full" />

                        <div class="px-4 pb-5">
                            <Avatar
                                :src="userProfile?.avatarUrl"
                                :alt="form.displayName || 'You'"
                                size="xl"
                                class="-mt-8 h-16 w-16 border-4 border-background"
                            />

                            <h3 class="mt-3 font-display text-xl font-semibold tracking-tight">
                                {{ form.displayName || 'Your name' }}
                            </h3>
                            <p class="text-sm text-text-tertiary">@{{ userProfile?.username }}</p>
                            <p class="mt-2 line-clamp-3 text-sm leading-relaxed text-text-secondary">
                                {{ form.bio || 'Your bio will appear here.' }}
                            </p>

                            <div class="mt-4 border border-border bg-surface p-3">
                                <p class="text-center text-sm font-semibold">
                                    Support {{ form.displayName?.split(' ')[0] || 'you' }}
                                </p>

                                <div class="mt-3 grid grid-cols-3 gap-1.5">
                                    <div
                                        v-for="tier in form.tiers.slice(0, 3)"
                                        :key="tier.price"
                                        class="flex flex-col items-center gap-0.5 border border-border bg-surface-sunken px-1 py-2"
                                    >
                                        <span class="text-sm leading-none">{{ tier.emoji }}</span>
                                        <span class="amount text-2xs font-bold">{{ formatCurrency(tier.price) }}</span>
                                    </div>
                                </div>

                                <div class="mt-3 bg-primary py-2 text-center text-xs font-medium text-primary-foreground">
                                    Send
                                </div>
                            </div>
                        </div>
                    </div>

                    <Button
                        v-if="userProfile?.username"
                        :href="`/${userProfile.username}`"
                        target="_blank"
                        variant="outline"
                        block
                    >
                        View live page
                        <template #suffix><ExternalLink class="h-3.5 w-3.5" /></template>
                    </Button>
                </div>
            </aside>

            <Button size="lg" block class="lg:hidden" :loading="saving" @click="saveProfile">
                Save changes
            </Button>
        </div>

        <BankModal :isOpen="showBankModal" @close="showBankModal = false" />
    </div>
</template>
