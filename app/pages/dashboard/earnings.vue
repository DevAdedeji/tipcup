<script setup lang="ts">
import EarningsChart from '~/components/dashboard/EarningsChart.vue'
import { formatCurrency } from '~/utils/format'
import { useAuth } from '~/composables/useAuth'
import { usePayments } from '~/composables/usePayments'
import { useWithdrawals } from '~/composables/useWithdrawals'
import { usePageMeta } from '~/composables/usePageMeta'
import { useEarnings } from '~/composables/useEarnings'
import Table from '~/components/ui/Table.vue'
import Skeleton from '~/components/ui/Skeleton.vue'
import WithdrawalModal from '~/components/dashboard/WithdrawalModal.vue'
import Tabs from '~/components/ui/Tabs.vue'
import { TabPanel } from '@headlessui/vue'
import { Clock, CheckCircle2, XCircle, ChevronLeft, ChevronRight } from 'lucide-vue-next'

definePageMeta({
    layout: 'dashboard',
    title: 'Earnings',
    subtitle: 'Every tip in, every payout out',
})

usePageMeta({ title: 'Earnings' })

const { userProfile } = useAuth()
const {
    paginatedPayments,
    loading: paymentsLoading,
    currentPage: paymentPage,
    hasNextPage: paymentHasNext,
    hasPrevPage: paymentHasPrev,
    fetchPaymentsPage,
} = usePayments()
const {
    paginatedWithdrawals,
    loading: withdrawalsLoading,
    currentPage: withdrawalPage,
    hasNextPage: withdrawalHasNext,
    hasPrevPage: withdrawalHasPrev,
    fetchWithdrawalsPage,
} = useWithdrawals()
const { chartData, chartLoading, useEarningsChart } = useEarnings()

const showWithdrawalModal = ref(false)
const activeTab = ref(0)
const tabs = ['Tips received', 'Withdrawals']

const canWithdraw = computed(() => (userProfile.value?.currentBalance || 0) > 0)

const withdrawalTone = (status?: string) => {
    if (status === 'success' || status === 'completed') return 'bg-success-muted text-success'
    if (status === 'failed' || status === 'reversed') return 'bg-error-muted text-error'
    return 'bg-warning-muted text-warning'
}

const withdrawalIcon = (status?: string) => {
    if (status === 'success' || status === 'completed') return CheckCircle2
    if (status === 'failed' || status === 'reversed') return XCircle
    return Clock
}

onMounted(() => {
    fetchPaymentsPage('first')
    fetchWithdrawalsPage('first')
    useEarningsChart(50)
})
</script>

<template>
    <div class="space-y-6 pb-8">
        <!-- Balance -->
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
                label="Available balance"
                :value="formatCurrency(userProfile?.currentBalance || 0)"
                emphasis
                caption="Ready to withdraw"
                class="sm:col-span-2 lg:col-span-1"
            >
                <template #action>
                    <Button block :disabled="!canWithdraw" @click="showWithdrawalModal = true">
                        {{ canWithdraw ? 'Withdraw' : 'Nothing to withdraw' }}
                    </Button>
                </template>
            </StatCard>

            <StatCard
                label="Total earned"
                :value="formatCurrency(userProfile?.totalEarnings || 0)"
                caption="All time, before withdrawals"
            />

            <StatCard
                label="Supporters"
                :value="userProfile?.supporterCount || 0"
                caption="Unique people who supported you"
            />
        </div>

        <!-- Chart -->
        <div class="border border-border bg-surface p-5 shadow-xs">
            <h2 class="font-display text-xl font-semibold tracking-tight">Earnings over time</h2>

            <div class="mt-5">
                <Skeleton v-if="chartLoading" class="h-[280px] w-full" />
                <EarningsChart v-else-if="chartData.length > 0" :transactions="chartData" />
                <p
                    v-else
                    class="flex h-[280px] items-center justify-center border border-dashed border-border text-sm text-text-secondary"
                >
                    No earnings yet — share your page to get started.
                </p>
            </div>
        </div>

        <!-- Tables -->
        <Tabs v-model="activeTab" :items="tabs">
            <TabPanel class="pt-4 focus:outline-none">
                <Table
                    :columns="[
                        { key: 'supporter', label: 'Supporter' },
                        { key: 'amount', label: 'Amount' },
                        { key: 'message', label: 'Message', class: 'max-w-xs' },
                        { key: 'date', label: 'Date', align: 'right' },
                    ]"
                    :data="paginatedPayments"
                    :loading="paymentsLoading && paginatedPayments.length === 0"
                    empty-message="No tips yet."
                >
                    <template #supporter="{ row }">
                        <div class="flex items-center gap-2.5">
                            <Avatar :alt="row.name || row.fromName || 'Anonymous'" size="sm" />
                            <div class="min-w-0">
                                <p class="truncate font-medium">
                                    {{ row.name || row.fromName || 'Anonymous' }}
                                </p>
                                <p class="truncate text-xs text-text-tertiary">
                                    {{ row.email || row.fromEmail || 'No email' }}
                                </p>
                            </div>
                        </div>
                    </template>

                    <template #amount="{ row }">
                        <span class="amount font-bold text-success">+{{ formatCurrency(row.amount) }}</span>
                    </template>

                    <template #message="{ row }">
                        <span class="block max-w-xs truncate text-text-secondary" :title="row.message">
                            {{ row.message || '—' }}
                        </span>
                    </template>

                    <template #date="{ row }">
                        <span class="tabular text-text-tertiary">{{ row.date }}</span>
                    </template>
                </Table>

                <div
                    v-if="paginatedPayments.length > 0 || paymentPage > 1"
                    class="mt-3 flex items-center justify-between"
                >
                    <span class="tabular text-sm text-text-tertiary">Page {{ paymentPage }}</span>
                    <div class="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            :disabled="!paymentHasPrev || paymentsLoading"
                            @click="fetchPaymentsPage('prev')"
                        >
                            <template #prefix><ChevronLeft class="h-4 w-4" /></template>
                            Prev
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            :disabled="!paymentHasNext || paymentsLoading"
                            @click="fetchPaymentsPage('next')"
                        >
                            Next
                            <template #suffix><ChevronRight class="h-4 w-4" /></template>
                        </Button>
                    </div>
                </div>
            </TabPanel>

            <TabPanel class="pt-4 focus:outline-none">
                <Table
                    :columns="[
                        { key: 'status', label: 'Status' },
                        { key: 'amount', label: 'Amount' },
                        { key: 'bank', label: 'Destination' },
                        { key: 'date', label: 'Date', align: 'right' },
                    ]"
                    :data="paginatedWithdrawals"
                    :loading="withdrawalsLoading"
                    empty-message="No withdrawals yet."
                >
                    <template #status="{ row }">
                        <span
                            class="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium capitalize"
                            :class="withdrawalTone(row.status)"
                        >
                            <component :is="withdrawalIcon(row.status)" class="h-3.5 w-3.5" />
                            {{ row.status?.replace(/_/g, ' ') || 'Pending' }}
                        </span>
                    </template>

                    <template #amount="{ row }">
                        <span class="amount font-bold">{{ formatCurrency(row.amount) }}</span>
                    </template>

                    <template #bank="{ row }">
                        <div class="min-w-0">
                            <p class="truncate">{{ row.bank_name || 'Unknown bank' }}</p>
                            <p class="tabular truncate text-xs text-text-tertiary">
                                {{ row.account_number }}
                            </p>
                        </div>
                    </template>

                    <template #date="{ row }">
                        <span class="tabular text-text-tertiary">{{ row.date }}</span>
                    </template>
                </Table>

                <div
                    v-if="paginatedWithdrawals.length > 0 || withdrawalPage > 1"
                    class="mt-3 flex items-center justify-between"
                >
                    <span class="tabular text-sm text-text-tertiary">Page {{ withdrawalPage }}</span>
                    <div class="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            :disabled="!withdrawalHasPrev || withdrawalsLoading"
                            @click="fetchWithdrawalsPage('prev')"
                        >
                            <template #prefix><ChevronLeft class="h-4 w-4" /></template>
                            Prev
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            :disabled="!withdrawalHasNext || withdrawalsLoading"
                            @click="fetchWithdrawalsPage('next')"
                        >
                            Next
                            <template #suffix><ChevronRight class="h-4 w-4" /></template>
                        </Button>
                    </div>
                </div>
            </TabPanel>
        </Tabs>

        <WithdrawalModal
            :isOpen="showWithdrawalModal"
            @close="showWithdrawalModal = false"
            @success="showWithdrawalModal = false"
        />
    </div>
</template>
