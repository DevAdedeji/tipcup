<script setup lang="ts">
import EarningsChart from '~/components/dashboard/EarningsChart.vue'
import { formatCurrency } from '~/utils/format'
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore'
import { db } from '~/firebase'
import { useAuth } from '~/composables/useAuth'
import { usePayments } from '~/composables/usePayments'
import { useWithdrawals } from '~/composables/useWithdrawals'
import { usePageMeta } from '~/composables/usePageMeta'
import Table from '~/components/ui/Table.vue'
import Button from '~/components/ui/Button.vue'
import Skeleton from '~/components/ui/Skeleton.vue'
import WithdrawalModal from '~/components/dashboard/WithdrawalModal.vue'
import Tabs from '~/components/ui/Tabs.vue'
import { TabPanel } from '@headlessui/vue'
import { DollarSign, Heart, CreditCard, Download, ArrowUpRight, Clock, CheckCircle, XCircle, ChevronLeft, ChevronRight } from 'lucide-vue-next'

definePageMeta({
  layout: 'dashboard',
  title: 'Earnings & Supports',
  subtitle: 'Detailed view of your income and supporters'
})

usePageMeta({
  title: 'Earnings & Supports',
})

const { user, userProfile } = useAuth()
const { paginatedPayments, loading: paymentsLoading, currentPage: paymentPage, hasNextPage: paymentHasNext, hasPrevPage: paymentHasPrev, fetchPaymentsPage } = usePayments()
const { withdrawals, loading: withdrawalsLoading, fetchWithdrawals } = useWithdrawals()
const showWithdrawalModal = ref(false)
const chartData = ref<any[]>([])
const activeTab = ref(0)
const tabs = ['Transaction History', 'Withdrawal History']

// Withdrawal Pagination (Client-side)
const withdrawalPage = ref(1)
const withdrawalItemsPerPage = 5
const paginatedWithdrawals = computed(() => {
    const start = (withdrawalPage.value - 1) * withdrawalItemsPerPage
    const end = start + withdrawalItemsPerPage
    return withdrawals.value.slice(start, end)
})
const withdrawalHasNext = computed(() => withdrawalPage.value * withdrawalItemsPerPage < withdrawals.value.length)
const withdrawalHasPrev = computed(() => withdrawalPage.value > 1)

// Initial fetch
onMounted(async () => {
    fetchPaymentsPage('first')
    fetchWithdrawals()

    // Fetch data for chart (last 30 days or 50 items)
    if (user.value) {
        try {
            const paymentsRef = collection(db, 'payments')
            const q = query(
                paymentsRef,
                where('toUserId', '==', user.value.uid),
                orderBy('createdAt', 'desc'),
                limit(50)
            )
            const snapshot = await getDocs(q)
            chartData.value = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }))
        } catch (e) {
            console.error('Failed to fetch chart data', e)
        }
    }
})
</script>

<template>
    <div class="space-y-8 pb-24">
        <!-- Header -->
        <div class="flex justify-end">
            <div class="flex gap-3">
                <!-- <Button variant="outline">
                    <Download class="w-4 h-4 mr-2" />
                    Export CSV
                </Button> -->
                <Button @click="showWithdrawalModal = true">
                    Withdraw Funds
                </Button>
            </div>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
             <!-- Available Balance -->
             <div class="bg-surface border border-primary/20 p-6 rounded-2xl shadow-sm relative overflow-hidden">
                <div class="flex items-center justify-between mb-4 relative z-10">
                    <span class="text-text-secondary font-medium">Available Balance</span>
                    <div class="p-2 bg-green-500/10 rounded-lg text-green-500">
                        <CreditCard class="w-5 h-5" />
                    </div>
                </div>
                <div class="text-4xl font-bold relative z-10">{{ formatCurrency(userProfile?.currentBalance || 0) }}</div>
                <div class="text-sm text-text-secondary mt-1 relative z-10">Ready to withdraw</div>
                 <!-- Decorative -->
                 <div class="absolute -right-6 -bottom-6 w-24 h-24 bg-green-500/10 rounded-full blur-2xl"></div>
            </div>

            <!-- Total Earnings -->
            <div class="bg-surface border border-primary/20 p-6 rounded-2xl shadow-sm">
                <div class="flex items-center justify-between mb-4">
                    <span class="text-text-secondary font-medium">Total Earnings</span>
                    <div class="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                        <DollarSign class="w-5 h-5" />
                    </div>
                </div>
                <div class="text-4xl font-bold">{{ formatCurrency(userProfile?.totalEarnings || 0) }}</div>
                <div class="text-sm text-text-secondary mt-1">Lifetime income</div>
            </div>

            <!-- Total Supporters -->
            <div class="bg-surface border border-primary/20 p-6 rounded-2xl shadow-sm">
                <div class="flex items-center justify-between mb-4">
                    <span class="text-text-secondary font-medium">Total Supporters</span>
                    <div class="p-2 bg-red-500/10 rounded-lg text-red-500">
                        <Heart class="w-5 h-5" />
                    </div>
                </div>
                <div class="text-4xl font-bold">{{ userProfile?.supporterCount || 0 }}</div>
                <div class="text-sm text-text-secondary mt-1">Unique supporters</div>
            </div>
        </div>

        <!-- Earnings Chart -->
        <div class="bg-surface border border-primary/20 p-6 rounded-2xl shadow-sm">
            <h2 class="text-xl font-bold mb-6">Earnings Overview</h2>
            <div v-if="chartData.length > 0">
                <EarningsChart :transactions="chartData" />
            </div>
            <div v-else class="h-[300px] flex items-center justify-center text-text-secondary">
                No earning data available for the chart.
            </div>
        </div>

        <!-- Tabs & Tables -->
        <div class="space-y-4">
            <Tabs :items="tabs" v-model="activeTab">
                <TabPanel class="focus:outline-none pt-4 space-y-2">
                     <!-- Transactions Table -->
                    <div class="overflow-hidden">
                        <Table
                            :columns="[
                                { key: 'supporter', label: 'Supporter' },
                                { key: 'amount', label: 'Amount' },
                                { key: 'message', label: 'Message' },
                                { key: 'status', label: 'Status' },
                                { key: 'date', label: 'Date', class: 'text-right' }
                            ]"
                            :data="paginatedPayments"
                            :loading="paymentsLoading && paginatedPayments.length === 0"
                            empty-message="No transactions found."
                        >
                            <template #supporter="{ row }">
                                <div class="flex items-center gap-3 font-medium">
                                    <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                                        {{ (row.name || row.fromName || 'A').charAt(0) }}
                                    </div>
                                    <div class="flex flex-col">
                                        <span>{{ row.name || row.fromName || userProfile?.displayName || 'Anonymous' }}</span>
                                        <span class="text-xs text-text-secondary">{{ row.email || row.fromEmail || 'No email' }}</span>
                                    </div>
                                </div>
                            </template>
                            <template #amount="{ row }">
                                <span class="font-bold text-green-500">+{{ formatCurrency(row.amount) }}</span>
                            </template>
                             <template #message="{ row }">
                                <span class="text-text-secondary max-w-xs truncate block" :title="row.message">{{ row.message || '-' }}</span>
                            </template>
                            <template #status="{ row }">
                                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500">
                                    {{ row.status || 'Success' }}
                                </span>
                            </template>
                            <template #date="{ row }">
                                <div class="text-right text-text-secondary">{{ row.date }}</div>
                            </template>
                        </Table>

                        <!-- Pagination Controls -->
                        <div v-if="paginatedPayments.length > 0 || paymentPage > 1" class="p-4 border-t border-white/5 flex items-center justify-between">
                            <span class="text-sm text-text-secondary">Page {{ paymentPage }}</span>
                            <div class="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    :disabled="!paymentHasPrev || paymentsLoading"
                                    @click="fetchPaymentsPage('prev')"
                                >
                                    <ChevronLeft class="w-4 h-4 mr-1" /> Prev
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    :disabled="!paymentHasNext || paymentsLoading"
                                    @click="fetchPaymentsPage('next')"
                                >
                                    Next <ChevronRight class="w-4 h-4 ml-1" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </TabPanel>

                <TabPanel class="focus:outline-none pt-4 space-y-2">
                     <!-- Withdrawals Table -->
                    <div class="overflow-hidden">
                         <Table
                            :columns="[
                                { key: 'status', label: 'Status' },
                                { key: 'amount', label: 'Amount' },
                                { key: 'bank', label: 'Bank Details' },
                                { key: 'reference', label: 'Reference' },
                                { key: 'date', label: 'Date', class: 'text-right' }
                            ]"
                            :data="paginatedWithdrawals"
                            :loading="withdrawalsLoading"
                            empty-message="No withdrawal requests found."
                        >
                            <template #status="{ row }">
                                 <span
                                    class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium capitalize"
                                    :class="{
                                        'bg-yellow-500/10 text-yellow-500': row.status === 'pending' || row.status === 'pending_manual_review',
                                        'bg-green-500/10 text-green-500': row.status === 'success' || row.status === 'completed',
                                        'bg-red-500/10 text-red-500': row.status === 'failed' || row.status === 'reversed'
                                    }"
                                >
                                    <Clock v-if="row.status === 'pending' || row.status === 'pending_manual_review'" class="w-3.5 h-3.5" />
                                    <CheckCircle v-else-if="row.status === 'success' || row.status === 'completed'" class="w-3.5 h-3.5" />
                                    <XCircle v-else class="w-3.5 h-3.5" />
                                    {{ row.status?.replace(/_/g, ' ') || 'Pending' }}
                                </span>
                            </template>

                            <template #amount="{ row }">
                                <span class="font-bold text-text-primary">{{ formatCurrency(row.amount) }}</span>
                            </template>

                            <template #bank="{ row }">
                                <div class="text-sm">
                                    <div class="text-text-primary">{{ row.bank_name || 'Unknown Bank' }}</div>
                                    <div class="text-xs text-text-secondary font-mono">{{ row.account_number }}</div>
                                </div>
                            </template>

                            <template #reference="{ row }">
                                <span class="font-mono text-xs text-text-secondary">{{ row.reference || '-' }}</span>
                            </template>

                            <template #date="{ row }">
                                <div class="text-right text-text-secondary">{{ row.date }}</div>
                            </template>
                        </Table>

                        <!-- Withdrawals Pagination Controls -->
                        <div v-if="withdrawals.length > 0" class="p-4 border-t border-white/5 flex items-center justify-between">
                            <span class="text-sm text-text-secondary">Page {{ withdrawalPage }} of {{ Math.ceil(withdrawals.length / withdrawalItemsPerPage) }}</span>
                            <div class="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    :disabled="!withdrawalHasPrev"
                                    @click="withdrawalPage--"
                                >
                                    <ChevronLeft class="w-4 h-4 mr-1" /> Prev
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    :disabled="!withdrawalHasNext"
                                    @click="withdrawalPage++"
                                >
                                    Next <ChevronRight class="w-4 h-4 ml-1" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </TabPanel>
            </Tabs>
        </div>

        <WithdrawalModal
            :isOpen="showWithdrawalModal"
            @close="showWithdrawalModal = false"
            @success="showWithdrawalModal = false"
        />
    </div>
</template>
