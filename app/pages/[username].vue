<script setup lang="ts">
import { usePaymentFlow } from '~/composables/usePaymentFlow'
import { useShare } from '~/composables/useShare'
import { useSupport } from '~/composables/useSupport'
import { ChevronRight, Share2, ShieldCheck, Loader2, Check } from 'lucide-vue-next'
import Skeleton from '~/components/ui/Skeleton.vue'
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
    () => $fetch<any>(`/api/profile/${encodeURIComponent(username.value)}`).catch(() => null),
    { watch: [username], default: () => null }
)

const toast = useToast()
const { user } = useAuth()

const firstName = computed(() => profile.value?.displayName?.split(' ')[0] || 'this creator')

const goal = computed(() => profile.value?.fundraisingGoal)
const goalPercent = computed(() => {
    if (!goal.value?.targetAmount) return 0
    return Math.min(Math.round(((goal.value.currentAmount || 0) / goal.value.targetAmount) * 100), 100)
})

const justPaid = ref(false)

onMounted(async () => {
    if (profile.value) {
        $fetch('/api/profile/view', { method: 'POST', body: { username: username.value } }).catch(() => {})
    }

    const callbackResult = await checkPaymentCallback()

    if (callbackResult?.status === 'success') {
        justPaid.value = true
        toast.add({
            title: 'Thank you',
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
    return profile.value.bio?.trim()
        ? profile.value.bio.trim().slice(0, 155)
        : `Support ${profile.value.displayName} on TipCup.`
})

usePageMeta({
    title: pageTitle,
    description: pageDescription,
    image: computed(() => profile.value?.avatarUrl || undefined),
    type: 'profile',
})

// Compare by price, not object identity: the reactive proxy handed to the
// click handler is not always the same reference as the item in the list.
const isSelected = (tier: any) => selectedTier.value?.price === tier?.price

const onSupportClick = () => {
    if (profile.value) handleSupport(profile.value)
}
</script>

<template>
    <div class="min-h-[100dvh] bg-background text-text-primary">
        <!-- Loading -->
        <div v-if="loading">
            <div class="h-28 bg-muted sm:h-32" />
            <div class="mx-auto max-w-xl px-5">
                <Skeleton class="-mt-10 h-20 w-20 border-4 border-background" />
                <Skeleton class="mt-5 h-8 w-52" />
                <Skeleton class="mt-2 h-4 w-28" />
                <Skeleton class="mt-6 h-4 w-full" />
                <Skeleton class="mt-2 h-4 w-2/3" />
                <Skeleton class="mt-8 h-56 w-full" />
            </div>
        </div>

        <!-- Not found -->
        <div v-else-if="!profile" class="flex min-h-[100dvh] flex-col items-center justify-center px-5 text-center">
            <AdireCloth seed="404" class="mb-7 h-16 w-16" />
            <h1 class="font-display text-2xl font-semibold tracking-tight">Nothing woven here</h1>
            <p class="mt-2 max-w-xs text-md text-text-secondary">
                No creator at <span class="font-semibold text-text-primary">@{{ username }}</span> yet.
            </p>
            <Button to="/" variant="outline" class="mt-7">Go to TipCup</Button>
        </div>

        <!-- Profile -->
        <div v-else class="animate-fade-in">
            <!-- This creator's cloth. Woven from their username, so it is
                 theirs and stays theirs. -->
            <div class="relative">
                <AdireCloth :seed="username" class="h-28 w-full sm:h-32" />

                <div class="absolute right-4 top-4 flex items-center gap-2">
                    <ThemeToggle />
                    <Button variant="secondary" size="sm" @click="shareUrl()">
                        <template #prefix><Share2 class="h-3.5 w-3.5" /></template>
                        Share
                    </Button>
                </div>
            </div>

            <div class="mx-auto max-w-xl px-5 pb-20">
                <header class="-mt-10">
                    <Avatar
                        :src="profile.avatarUrl"
                        :alt="profile.displayName"
                        size="2xl"
                        class="h-20 w-20 border-4 border-background shadow-md"
                    />

                    <h1 class="mt-4 font-display text-3xl font-semibold leading-tight tracking-tight">
                        {{ profile.displayName }}
                    </h1>
                    <p class="mt-0.5 text-md text-text-tertiary">@{{ profile.username }}</p>

                    <p v-if="profile.bio" class="mt-4 text-md leading-relaxed text-text-secondary">
                        {{ profile.bio }}
                    </p>
                </header>

                <!-- Goal: the cloth is dyed as it fills -->
                <section v-if="goal" class="mt-8">
                    <div class="mb-2 flex items-baseline justify-between gap-3">
                        <p class="field-label">{{ goal.title }}</p>
                        <p class="amount text-sm font-bold text-accent">{{ goalPercent }}%</p>
                    </div>

                    <div
                        class="h-4 w-full overflow-hidden border border-border-strong bg-surface p-[2px]"
                        role="progressbar"
                        :aria-valuenow="goalPercent"
                        aria-valuemin="0"
                        aria-valuemax="100"
                        :aria-label="goal.title"
                    >
                        <AdireCloth
                            :seed="username"
                            :style="{ width: `${goalPercent}%` }"
                            class="h-full animate-dye"
                        />
                    </div>

                    <p class="mt-2 text-sm text-text-secondary">
                        <span class="amount font-bold text-text-primary">
                            {{ formatCurrency(goal.currentAmount || 0) }}
                        </span>
                        raised of {{ formatCurrency(goal.targetAmount) }}
                    </p>
                </section>

                <!-- Support -->
                <section class="mt-8">
                    <div
                        v-if="verifyingPayment"
                        class="mb-4 flex items-center gap-2.5 border border-accent/30 bg-accent-muted px-4 py-3"
                    >
                        <Loader2 class="h-4 w-4 animate-spin text-accent" />
                        <span class="text-sm font-medium text-accent">Confirming your payment…</span>
                    </div>

                    <div
                        v-else-if="justPaid"
                        class="mb-4 flex items-center gap-2.5 border border-success/30 bg-success-muted px-4 py-3"
                    >
                        <Check class="h-4 w-4 text-success" />
                        <span class="text-sm font-medium text-success">
                            Thank you — {{ firstName }} has been paid.
                        </span>
                    </div>

                    <div class="border border-border bg-surface shadow-sm">
                        <div class="border-b border-border px-5 py-4">
                            <h2 class="font-display text-xl font-semibold tracking-tight">
                                Support {{ firstName }}
                            </h2>
                            <p class="mt-0.5 text-sm text-text-secondary">
                                It goes straight to them.
                            </p>
                        </div>

                        <div class="space-y-5 px-5 py-5">
                            <div v-if="profile.tiers?.length" class="grid grid-cols-3 gap-2">
                                <button
                                    v-for="tier in profile.tiers"
                                    :key="tier.price"
                                    class="group relative flex flex-col items-center gap-1 border px-2 py-3.5 transition-all duration-200"
                                    :class="
                                        isSelected(tier)
                                            ? 'border-primary bg-primary text-primary-foreground shadow-md'
                                            : 'border-border bg-surface hover:border-border-strong hover:bg-surface-hover'
                                    "
                                    :aria-pressed="isSelected(tier)"
                                    @click="selectedTier = tier"
                                >
                                    <Check
                                        v-if="isSelected(tier)"
                                        class="absolute right-1 top-1 h-3 w-3 opacity-80"
                                    />
                                    <span class="text-lg leading-none">{{ tier.emoji || '☕' }}</span>
                                    <span class="amount text-sm font-bold">
                                        {{ formatCurrency(tier.price) }}
                                    </span>
                                    <span
                                        v-if="tier.label"
                                        class="line-clamp-1 text-2xs"
                                        :class="isSelected(tier) ? 'opacity-80' : 'text-text-tertiary'"
                                    >
                                        {{ tier.label }}
                                    </span>
                                </button>
                            </div>

                            <p
                                v-else
                                class="border border-dashed border-border px-4 py-6 text-center text-sm text-text-secondary"
                            >
                                {{ firstName }} hasn't set up amounts yet.
                            </p>

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
                        </div>

                        <div class="selvedge h-[3px]" aria-hidden="true" />

                        <div class="space-y-3 px-5 py-5">
                            <div class="flex items-baseline justify-between">
                                <span class="field-label">Total</span>
                                <span class="amount text-2xl font-bold tracking-tight">
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

                            <p class="flex items-center justify-center gap-1.5 text-2xs text-text-tertiary">
                                <ShieldCheck class="h-3.5 w-3.5" />
                                Secured by Bachs
                            </p>
                        </div>
                    </div>
                </section>

                <!-- Links -->
                <section v-if="profile.socialLinks?.length" class="mt-8">
                    <p class="field-label mb-2">Elsewhere</p>
                    <div class="stagger grid gap-2">
                        <a
                            v-for="link in profile.socialLinks"
                            :key="link.url"
                            :href="link.url"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="group flex items-center justify-between gap-3 border border-border bg-surface px-4 py-3 transition-all duration-200 hover:border-border-strong hover:bg-surface-hover"
                        >
                            <span class="flex min-w-0 items-center gap-3">
                                <component
                                    :is="getSocialIcon(link.platform)"
                                    class="h-4 w-4 shrink-0 text-text-tertiary group-hover:text-accent"
                                />
                                <span class="truncate text-md font-medium">{{ link.platform }}</span>
                            </span>
                            <ChevronRight
                                class="h-4 w-4 shrink-0 text-text-tertiary transition-transform group-hover:translate-x-0.5"
                            />
                        </a>
                    </div>
                </section>

                <footer class="mt-12 flex flex-col items-center gap-3">
                    <AdireCloth :seed="username" class="h-1.5 w-24" />
                    <NuxtLink to="/" class="text-2xs text-text-tertiary transition-colors hover:text-text-secondary">
                        Powered by TipCup
                    </NuxtLink>
                </footer>
            </div>
        </div>
    </div>
</template>
