<script setup lang="ts">
import { useAuth } from '~/composables/useAuth'
import { usePageMeta } from '~/composables/usePageMeta'
import { usePayments } from '~/composables/usePayments'
import Skeleton from '~/components/ui/Skeleton.vue'
import Table from '~/components/ui/Table.vue'
import WithdrawalModal from '~/components/dashboard/WithdrawalModal.vue'
import { Eye, Wallet, Heart, Copy, Check, ExternalLink } from 'lucide-vue-next'
import { formatCurrency } from '~/utils/format'
import ViewsChart from '~/components/dashboard/ViewsChart.vue'

definePageMeta({
    layout: 'dashboard',
    title: 'Overview',
    subtitle: 'Your earnings, supporters and page activity',
})

usePageMeta({ title: 'Overview' })

const { userProfile, loading } = useAuth()
const { payments, loading: paymentsLoading, fetchRecentPayments } = usePayments()
const toast = useToast()

const showWithdrawalModal = ref(false)
const copied = ref(false)
let copyTimer: ReturnType<typeof setTimeout> | undefined
let unsubscribePayments: (() => void) | undefined

onMounted(() => {
    unsubscribePayments = fetchRecentPayments()
})

onUnmounted(() => {
    unsubscribePayments?.()
    clearTimeout(copyTimer)
})

const profileUrl = computed(() => {
    if (!userProfile.value?.username) return ''
    const base = import.meta.client ? window.location.origin : 'https://tipcup.adedeji.xyz'
    return `${base}/${userProfile.value.username}`
})

const copyLink = async () => {
    try {
        await navigator.clipboard.writeText(profileUrl.value)
        copied.value = true
        clearTimeout(copyTimer)
        copyTimer = setTimeout(() => (copied.value = false), 2000)
    } catch {
        toast.add({ title: 'Could not copy', description: 'Copy the link manually.', type: 'error' })
    }
}

const canWithdraw = computed(() => (userProfile.value?.currentBalance || 0) > 0)
</script>

<template>
    <div class="pb-8">
        <div v-if="loading" class="space-y-6">
            <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Skeleton v-for="i in 3" :key="i" class="h-[132px]" />
            </div>
            <div class="grid gap-6 lg:grid-cols-3">
                <Skeleton class="h-80 lg:col-span-2" />
                <Skeleton class="h-80" />
            </div>
            <Skeleton class="h-72" />
        </div>

        <div v-else class="space-y-6">
            <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <StatCard
                    label="Available balance"
                    :value="formatCurrency(userProfile?.currentBalance || 0)"
                    :icon="Wallet"
                    
                    :caption="`${formatCurrency(userProfile?.totalEarnings || 0)} earned all time`"
                >
                    <template #action>
                        <Button
                            size="sm"
                            :disabled="!canWithdraw"
                            block
                            @click="showWithdrawalModal = true"
                        >
                            {{ canWithdraw ? 'Withdraw' : 'Nothing to withdraw' }}
                        </Button>
                    </template>
                </StatCard>

                <StatCard
                    label="Supporters"
                    :value="userProfile?.supporterCount || 0"
                    :icon="Heart"
                    
                    caption="Unique people who supported you"
                />

                <StatCard
                    label="Page views"
                    :value="userProfile?.views || 0"
                    :icon="Eye"
                    
                    caption="All-time visits to your page"
                />
            </div>

            <div class="grid gap-4 lg:grid-cols-3">
                <Card class="lg:col-span-2" padding="lg">
                    <h2 class="font-display text-md font-semibold tracking-tight">Views over time</h2>
                    <div class="mt-5">
                        <ViewsChart :analytics="userProfile?.analytics" />
                    </div>
                </Card>

                <Card padding="lg">
                    <h2 class="font-display text-md font-semibold tracking-tight">Share your page</h2>
                    <p class="mt-1.5 text-sm text-text-secondary">
                        This link is how people find and support you.
                    </p>

                    <div class="mt-4 flex gap-2">
                        <Input :model-value="profileUrl" readonly class="min-w-0 flex-1" size="sm" />
                        <Button
                            size="icon-sm"
                            variant="outline"
                            class="h-9 w-9 shrink-0"
                            :title="copied ? 'Copied' : 'Copy link'"
                            @click="copyLink"
                        >
                            <Check v-if="copied" class="h-4 w-4 text-success" />
                            <Copy v-else class="h-4 w-4" />
                        </Button>
                    </div>

                    <a
                        v-if="userProfile?.username"
                        :href="`/${userProfile.username}`"
                        target="_blank"
                        rel="noopener"
                        class="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-accent transition-opacity hover:opacity-80"
                    >
                        Open public page
                        <ExternalLink class="h-3.5 w-3.5" />
                    </a>
                </Card>
            </div>

            <div class="space-y-3">
                <h2 class="font-display text-md font-semibold tracking-tight">Recent supporters</h2>

                <Table
                    :columns="[
                        { key: 'supporter', label: 'Supporter' },
                        { key: 'amount', label: 'Amount' },
                        { key: 'message', label: 'Message', class: 'max-w-xs' },
                        { key: 'date', label: 'Date', align: 'right' },
                    ]"
                    :data="payments"
                    :loading="paymentsLoading"
                    empty-message="No support yet. Share your page to get started."
                >
                    <template #supporter="{ row }">
                        <div class="flex items-center gap-2.5">
                            <Avatar :alt="row.name || row.fromName || 'Anonymous'" size="sm" />
                            <span class="font-medium">
                                {{ row.name || row.fromName || 'Anonymous' }}
                            </span>
                        </div>
                    </template>

                    <template #amount="{ row }">
                        <span class="tabular font-semibold text-success">
                            +{{ formatCurrency(row.amount) }}
                        </span>
                    </template>

                    <template #message="{ row }">
                        <span class="block max-w-xs truncate text-text-secondary">
                            {{ row.message || '—' }}
                        </span>
                    </template>

                    <template #date="{ row }">
                        <span class="tabular text-text-tertiary">{{ row.date }}</span>
                    </template>
                </Table>
            </div>
        </div>

        <WithdrawalModal
            :isOpen="showWithdrawalModal"
            @close="showWithdrawalModal = false"
            @success="showWithdrawalModal = false"
        />
    </div>
</template>
