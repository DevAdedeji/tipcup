<script setup lang="ts">
import { usePaymentFlow } from '~/composables/usePaymentFlow'
import { useShare } from '~/composables/useShare'
import { useSupport } from '~/composables/useSupport'
import { ChevronRight, Share2, ChevronDown, ChevronUp, ShieldCheck, Loader2 } from 'lucide-vue-next'
import Skeleton from '~/components/ui/Skeleton.vue'
import GoalProgress from '~/components/dashboard/GoalProgress.vue'
import { formatCurrency } from '~/utils/format'
import { getSocialIcon } from '~/utils/socials'

const route = useRoute()
const username = computed(() => route.params.username as string)

const { checkPaymentCallback } = usePaymentFlow()
const { shareUrl } = useShare()
const {
    selectedTier,
    supportMessage,
    tipperEmail,
    handleSupport,
    processingPayment,
    verifyingPayment,
    tierLabel,
} = useSupport()

const {
    data: profile,
    pending: loading,
    refresh: refreshProfile,
} = await useAsyncData(
    `profile-${username.value}`,
    () =>
        $fetch<any>(`/api/profile/${encodeURIComponent(username.value)}`).catch(() => null),
    { watch: [username], default: () => null }
)

const toast = useToast()
const { user } = useAuth()

const isBioExpanded = ref(false)
const BIO_LIMIT = 180

const displayBio = computed(() => {
    if (!profile.value?.bio) return ''
    if (isBioExpanded.value || profile.value.bio.length <= BIO_LIMIT) return profile.value.bio
    return profile.value.bio.slice(0, BIO_LIMIT).trimEnd() + '…'
})

const showReadMore = computed(() => (profile.value?.bio?.length || 0) > BIO_LIMIT)

const firstName = computed(() => profile.value?.displayName?.split(' ')[0] || 'this creator')

onMounted(async () => {
    if (profile.value) {
        $fetch('/api/profile/view', {
            method: 'POST',
            body: { username: username.value },
        }).catch(() => {})
    }

    const callbackResult = await checkPaymentCallback()

    if (callbackResult?.status === 'success') {
        toast.add({
            title: 'Thank you!',
            description: `Your support for ${profile.value?.displayName || 'this creator'} is on its way.`,
            type: 'success',
        })

        await refreshProfile()
    }
})

const pageTitle = computed(() =>
    profile.value
        ? `${profile.value.displayName} (@${profile.value.username})`
        : loading.value
          ? 'Loading…'
          : 'Profile not found'
)

const pageDescription = computed(() => {
    if (!profile.value) return 'Support creators on TipCup.'
    const name = profile.value.displayName
    return profile.value.bio?.trim()
        ? `${profile.value.bio.trim().slice(0, 155)}`
        : `Support ${name} on TipCup.`
})

usePageMeta({
    title: pageTitle,
    description: pageDescription,
    image: computed(() => profile.value?.avatarUrl || undefined),
    type: 'profile',
})

const activeTab = ref<'home' | 'socials'>('home')
const tabs = [
    { id: 'home' as const, label: 'Support' },
    { id: 'socials' as const, label: 'Links' },
]

const onSupportClick = () => {
    if (profile.value) handleSupport(profile.value)
}

const tierColumns = computed(() => Math.min(profile.value?.tiers?.length || 1, 3))

const hasRightDivider = (index: number) => (index + 1) % tierColumns.value !== 0
</script>

<template>
    <div class="min-h-[100dvh] bg-background pb-24 text-text-primary">
        <div v-if="loading">
            <div class="h-40 bg-muted md:h-52" />

            <div class="mx-auto max-w-3xl px-4 sm:px-6">
                <div class="-mt-14 flex flex-col items-center sm:flex-row sm:items-end sm:gap-5">
                    <Skeleton class="h-28 w-28 ring-4 ring-background" />
                    <div class="mt-4 flex w-full flex-1 flex-col items-center gap-2 sm:mt-0 sm:items-start sm:pb-2">
                        <Skeleton class="h-7 w-44" />
                        <Skeleton class="h-4 w-28" />
                    </div>
                </div>

                <div class="mt-6 space-y-2">
                    <Skeleton class="h-3.5 w-full" />
                    <Skeleton class="h-3.5 w-2/3" />
                </div>

                <Skeleton class="mt-8 h-11 w-full" />
                <Skeleton class="mt-6 h-72 w-full" />
            </div>
        </div>

        <div v-else-if="!profile" class="flex min-h-[100dvh] flex-col items-center justify-center px-4 text-center">
            <div class="mb-5 flex h-14 w-14 items-center justify-center bg-muted text-2xl">
                🔍
            </div>
            <h1 class="font-display text-2xl font-semibold tracking-tight">Nothing here</h1>
            <p class="mt-2 max-w-sm text-md text-text-secondary">
                We couldn't find a creator at <span class="font-medium text-text-primary">@{{ username }}</span>.
            </p>
            <Button to="/" variant="outline" class="mt-6">Go to TipCup</Button>
        </div>

        <div v-else class="animate-fade-in">
            <div class="border-b border-border bg-surface-sunken">
                <div class="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
                    <NuxtLink to="/" class="font-mono text-2xs font-semibold uppercase tracking-label text-text-secondary">
                        TipCup
                    </NuxtLink>
                    <div class="flex items-center gap-2">
                        <ThemeToggle />
                        <Button variant="outline" size="sm" @click="shareUrl()">
                            <template #prefix><Share2 class="h-3 w-3" /></template>
                            Share
                        </Button>
                    </div>
                </div>
            </div>

            <div class="mx-auto max-w-3xl px-4 py-8 sm:px-6">
                <header class="flex items-start gap-4">
                    <Avatar
                        :src="profile.avatarUrl"
                        :alt="profile.displayName"
                        size="2xl"
                        class="h-20 w-20 shrink-0 sm:h-24 sm:w-24"
                    />

                    <div class="min-w-0 flex-1">
                        <p class="field-label">Creator</p>
                        <h1 class="mt-1 font-display text-3xl font-bold leading-none tracking-tight text-text-primary">
                            {{ profile.displayName }}
                        </h1>
                        <p class="tabular mt-1.5 text-sm text-text-tertiary">@{{ profile.username }}</p>
                    </div>
                </header>

                <p
                    v-if="profile.bio"
                    class="mt-5 max-w-xl text-md leading-relaxed text-text-secondary"
                >
                    {{ displayBio }}
                    <button
                        v-if="showReadMore"
                        class="ml-1 inline-flex items-center gap-0.5 font-medium text-accent hover:underline"
                        @click="isBioExpanded = !isBioExpanded"
                    >
                        {{ isBioExpanded ? 'less' : 'more' }}
                        <component :is="isBioExpanded ? ChevronUp : ChevronDown" class="h-3 w-3" />
                    </button>
                </p>

                <nav class="mt-7 flex border-b border-border">
                    <button
                        v-for="tab in tabs"
                        :key="tab.id"
                        class="-mb-px border-b-2 px-4 py-2.5 font-mono text-2xs font-semibold uppercase tracking-label transition-colors duration-150"
                        :class="
                            activeTab === tab.id
                                ? 'border-accent text-text-primary'
                                : 'border-transparent text-text-tertiary hover:text-text-primary'
                        "
                        @click="activeTab = tab.id"
                    >
                        {{ tab.label }}
                    </button>
                </nav>

                <div v-if="activeTab === 'home'" class="mt-6 space-y-4">
                    <GoalProgress v-if="profile.fundraisingGoal" :goal="profile.fundraisingGoal" />

                    <div
                        v-if="verifyingPayment"
                        class="flex items-center justify-center gap-2.5 border border-accent/25 bg-accent-muted p-3.5"
                    >
                        <Loader2 class="h-4 w-4 animate-spin text-accent" />
                        <span class="text-sm font-medium text-accent">Confirming your payment…</span>
                    </div>

                    <div class="slip slip-torn">
                        <div class="flex items-start justify-between gap-3 border-b border-border px-5 py-3.5">
                            <div>
                                <p class="field-label">Pay to</p>
                                <p class="mt-1 font-semibold tracking-tight text-text-primary">
                                    {{ profile.displayName }}
                                </p>
                            </div>
                            <span class="stamp shrink-0 text-accent">TipCup</span>
                        </div>

                        <div class="space-y-5 px-5 py-5">
                            <div>
                                <p class="field-label mb-2">Select amount</p>

                                <div
                                    v-if="profile.tiers?.length"
                                    class="grid border border-border"
                                    :style="{ gridTemplateColumns: `repeat(${tierColumns}, minmax(0, 1fr))` }"
                                >
                                    <button
                                        v-for="(tier, i) in profile.tiers"
                                        :key="tier.price"
                                        class="flex flex-col items-center gap-1 px-2 py-3 transition-colors duration-150"
                                        :class="[
                                            hasRightDivider(i) ? 'border-r border-border' : '',
                                            i >= tierColumns ? 'border-t border-border' : '',
                                            selectedTier === tier
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-surface text-text-primary hover:bg-surface-hover',
                                        ]"
                                        :aria-pressed="selectedTier === tier"
                                        @click="selectedTier = tier"
                                    >
                                        <span class="text-base leading-none">{{ tier.emoji || '☕' }}</span>
                                        <span class="tabular text-sm font-semibold">
                                            {{ formatCurrency(tier.price) }}
                                        </span>
                                        <span
                                            v-if="tier.label"
                                            class="line-clamp-1 font-mono text-2xs uppercase tracking-label"
                                            :class="selectedTier === tier ? 'opacity-70' : 'text-text-tertiary'"
                                        >
                                            {{ tier.label }}
                                        </span>
                                    </button>
                                </div>

                                <p v-else class="border border-dashed border-border p-4 text-center text-sm text-text-secondary">
                                    {{ firstName }} hasn't set up support tiers yet.
                                </p>
                            </div>

                            <Textarea
                                v-model="supportMessage"
                                label="Message"
                                :rows="2"
                                :maxlength="200"
                                placeholder="Say something nice (optional)"
                            />

                            <Input
                                v-if="!user"
                                v-model="tipperEmail"
                                label="Email"
                                type="email"
                                autocomplete="email"
                                placeholder="you@example.com"
                                hint="For your receipt only."
                            />

                            <div class="rule-tear flex items-baseline justify-between pt-4">
                                <span class="field-label">Total</span>
                                <span class="tabular text-2xl font-semibold tracking-tight text-text-primary">
                                    {{ selectedTier ? formatCurrency(selectedTier.price) : '—' }}
                                </span>
                            </div>

                            <Button
                                variant="primary"
                                size="xl"
                                block
                                :loading="processingPayment"
                                :disabled="processingPayment || verifyingPayment || !profile.tiers?.length"
                                @click="onSupportClick"
                            >
                                {{ selectedTier ? `Send ${tierLabel}` : 'Choose an amount' }}
                            </Button>

                            <p class="flex items-center justify-center gap-1.5 font-mono text-2xs uppercase tracking-label text-text-tertiary">
                                <ShieldCheck class="h-3 w-3" />
                                Secured by Bachs
                            </p>
                        </div>
                    </div>
                </div>

                <div v-else class="slip slip-torn mt-6">
                    <div class="border-b border-border px-5 py-3.5">
                        <p class="field-label">Find {{ firstName }} elsewhere</p>
                    </div>

                    <div v-if="profile.socialLinks?.length" class="px-5 py-2">
                        <a
                            v-for="link in profile.socialLinks"
                            :key="link.url"
                            :href="link.url"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="group flex items-baseline gap-2 border-b border-border py-3 last:border-b-0"
                        >
                            <component
                                :is="getSocialIcon(link.platform)"
                                class="h-3.5 w-3.5 shrink-0 translate-y-0.5 text-text-tertiary group-hover:text-accent"
                            />
                            <span class="font-mono text-xs uppercase tracking-label group-hover:text-accent">
                                {{ link.platform }}
                            </span>
                            <span class="min-w-4 flex-1 -translate-y-1 border-b border-dotted border-border" />
                            <ChevronRight
                                class="h-3.5 w-3.5 shrink-0 translate-y-0.5 text-text-tertiary transition-transform group-hover:translate-x-0.5 group-hover:text-accent"
                            />
                        </a>
                    </div>

                    <p v-else class="px-5 py-10 text-center font-mono text-xs uppercase tracking-label text-text-tertiary">
                        No links on file
                    </p>
                </div>

                <footer class="mt-10 text-center">
                    <NuxtLink
                        to="/"
                        class="text-2xs text-text-tertiary transition-colors hover:text-text-secondary"
                    >
                        Powered by TipCup
                    </NuxtLink>
                </footer>
            </div>
        </div>
    </div>
</template>
