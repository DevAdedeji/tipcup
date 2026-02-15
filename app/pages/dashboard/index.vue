<script setup lang="ts">
import { useAuth } from '~/composables/useAuth'
import { usePageMeta } from '~/composables/usePageMeta'
import { usePayments } from '~/composables/usePayments'
import Skeleton from '~/components/ui/Skeleton.vue'
import Table from '~/components/ui/Table.vue'
import WithdrawalModal from '~/components/dashboard/WithdrawalModal.vue'
import { Eye, DollarSign, Heart } from 'lucide-vue-next'
import { formatCurrency } from '~/utils/format'
import ViewsChart from '~/components/dashboard/ViewsChart.vue'

definePageMeta({
  layout: 'dashboard',
  title: 'Dashboard',
  subtitle: 'Overview of your earnings and tips'
})

usePageMeta({
  title: 'Dashboard',
})


const { userProfile, loading } = useAuth()
const { payments, loading: paymentsLoading, fetchRecentPayments } = usePayments()
const toast = useToast()
const showWithdrawalModal = ref(false)

let unsubscribePayments: (() => void) | undefined

onMounted(() => {
    unsubscribePayments = fetchRecentPayments()
})

onUnmounted(() => {
    if (unsubscribePayments) {
        unsubscribePayments()
    }
})

const profileUrl = computed(() => {
    if (!userProfile.value?.username) return ''
    const baseUrl = window.location.origin
    return `${baseUrl}/${userProfile.value.username}`
})

const copyLink = async () => {
    try {
        await navigator.clipboard.writeText(profileUrl.value)
        toast.add({ title: 'Copied!', description: 'Profile link copied to clipboard.', type: 'success' })
    } catch (e) {
        toast.add({ title: 'Error', description: 'Could not copy link.', type: 'error' })
    }
}
</script>

<template>
  <div class="min-h-screen bg-background text-text-primary pb-24">
      <div class="mx-auto space-y-8">


          <div v-if="loading" class="space-y-8 animate-fade-in-up">

              <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                      <Skeleton class="h-8 w-48 mb-2" />
                      <Skeleton class="h-4 w-64" />
                  </div>
                  <div class="flex gap-3">
                      <Skeleton class="h-10 w-24" />
                      <Skeleton class="h-10 w-24" />
                  </div>
              </div>


              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div v-for="i in 3" :key="i" class="bg-surface border border-white/5 p-6 rounded-2xl">
                      <div class="flex justify-between mb-4">
                          <Skeleton class="h-4 w-24" />
                          <Skeleton class="h-8 w-8 rounded-full" />
                      </div>
                      <Skeleton class="h-10 w-16 mb-2" />
                      <Skeleton class="h-3 w-32" />
                  </div>
              </div>

              <div class="grid lg:grid-cols-3 gap-8">
                  <div class="lg:col-span-2 space-y-8">

                      <div class="bg-surface border border-white/5 p-6 rounded-2xl h-80">
                           <Skeleton class="h-6 w-32 mb-6" />
                           <div class="flex items-end gap-2 h-56 px-4">
                               <Skeleton class="h-32 w-full" />
                               <Skeleton class="h-48 w-full" />
                               <Skeleton class="h-24 w-full" />
                               <Skeleton class="h-40 w-full" />
                               <Skeleton class="h-56 w-full" />
                               <Skeleton class="h-32 w-full" />
                               <Skeleton class="h-44 w-full" />
                           </div>
                      </div>

                      <div class="grid sm:grid-cols-2 gap-4">
                          <Skeleton class="h-24 rounded-2xl" />
                          <Skeleton class="h-24 rounded-2xl" />
                      </div>
                  </div>


                  <div class="space-y-6">
                      <Skeleton class="h-64 rounded-2xl" />
                  </div>
              </div>
          </div>


          <div v-else class="space-y-8 animate-fade-in-up">


              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <!-- Total Views -->
                  <div class="bg-surface border border-primary/20 p-6 rounded-2xl shadow-sm transition-colors group">
                      <div class="flex items-center justify-between mb-4">
                          <span class="text-text-secondary font-medium">Total Views</span>
                          <div class="p-2 bg-blue-500/10 rounded-lg text-blue-500 group-hover:scale-110 transition-transform">
                            <Eye class="w-5 h-5" />
                          </div>
                      </div>
                      <div class="text-4xl font-bold">{{ userProfile?.views || 0 }}</div>
                      <div class="text-sm text-text-secondary mt-1">
                          All time page visits
                      </div>
                  </div>

                  <!-- Available Balance Card -->
            <div class="bg-surface border border-primary/20 p-6 rounded-2xl shadow-sm relative overflow-hidden">
                <div class="flex items-center justify-between mb-4 relative z-10">
                    <span class="text-text-secondary font-medium">Available Balance</span>
                    <div class="p-2 bg-green-500/10 rounded-lg text-green-500">
                        <CreditCard class="w-5 h-5" />
                    </div>
                </div>
                <div class="text-3xl md:text-4xl font-bold relative z-10 break-all" :title="formatCurrency(userProfile?.currentBalance || 0)">{{ formatCurrency(userProfile?.currentBalance || 0) }}</div>
                <div class="flex items-center justify-between mt-4 relative z-10">
                    <span class="text-sm text-text-secondary">Total Earned: {{ formatCurrency(userProfile?.totalEarnings || 0) }}</span>
                     <Button size="sm" @click="showWithdrawalModal = true">
                        Withdraw Funds
                    </Button>
                </div>
                 <!-- Decorative -->
                 <div class="absolute -right-6 -bottom-6 w-24 h-24 bg-green-500/10 rounded-full blur-2xl"></div>
            </div>

                  <!-- Supporters -->
                  <div class="bg-surface border border-primary/20 p-6 rounded-2xl shadow-sm transition-colors group">
                      <div class="flex items-center justify-between mb-4">
                          <span class="text-text-secondary font-medium">Supporters</span>
                          <div class="p-2 bg-red-500/10 rounded-lg text-red-500 group-hover:scale-110 transition-transform">
                            <Heart class="w-5 h-5" />
                          </div>
                      </div>
                      <div class="text-4xl font-bold">{{ userProfile?.supporterCount || 0 }}</div>
                      <div class="text-sm text-text-secondary mt-1">
                          Unique people who supported
                      </div>
                  </div>
              </div>

              <div class="flex lg:flex-row flex-col gap-8">


                  <div class="w-full lg:w-2/3 space-y-8">
                      <div class="bg-surface border border-primary/20 p-6 rounded-2xl shadow-sm">
                          <h2 class="text-xl font-bold mb-6">Views Overview</h2>
                          <ViewsChart :analytics="userProfile?.analytics" />
                      </div>

                  </div>


                  <div class="w-full lg:w-1/3 space-y-6">
                      <div class="bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/20 p-6 rounded-2xl shadow-lg relative overflow-hidden">
                          <div class="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full -mr-10 -mt-10"></div>

                          <h2 class="text-xl font-bold mb-2 relative">Share your page</h2>
                          <p class="text-sm text-text-secondary mb-6 relative">Start getting support by sharing your unique link.</p>

                          <div class="flex gap-2 relative">
                              <Input :model-value="profileUrl" readonly class="bg-background/80" />
                              <Button @click="copyLink" size="icon" variant="secondary">
                                  📋
                              </Button>
                          </div>
                          <div class="mt-4 flex justify-center">
                              <Button :to="`/${userProfile?.username}`" target="_blank" variant="link" class="text-primary text-sm">
                                  Open Public Page ↗
                              </Button>
                          </div>
                      </div>
                  </div>

              </div>

                <div class="space-y-6">
                    <div class="flex justify-between items-center px-2">
                        <h2 class="text-xl font-bold">Recent Supporters</h2>
                        <!-- <Button variant="ghost" size="sm" class="text-primary">View All</Button> -->
                    </div>

                    <Table
                        :columns="[
                            { key: 'supporter', label: 'Supporter' },
                            { key: 'amount', label: 'Amount' },
                            { key: 'message', label: 'Message' },
                            { key: 'date', label: 'Date', class: 'text-right' }
                        ]"
                        :data="payments"
                        :loading="paymentsLoading"
                        empty-message="No support received yet. Share your page to get started!"
                    >
                        <template #supporter="{ row }">
                            <div class="flex items-center gap-3 font-medium">
                                <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                                    {{ (row.name || row.fromName || 'A').charAt(0) }}
                                </div>
                                {{ row.name || row.fromName || userProfile?.displayName || 'Anonymous' }}
                            </div>
                        </template>

                        <template #amount="{ row }">
                            <span class="font-bold text-green-500">+{{ formatCurrency(row.amount) }}</span>
                        </template>

                        <template #message="{ row }">
                            <span class="text-text-secondary max-w-xs truncate block">{{ row.message || '-' }}</span>
                        </template>

                        <template #date="{ row }">
                            <div class="text-right text-text-secondary">{{ row.date }}</div>
                        </template>
                    </Table>
                </div>
          </div>
      </div>
      <WithdrawalModal
          :isOpen="showWithdrawalModal"
          @close="showWithdrawalModal = false"
          @success="showWithdrawalModal = false"
      />
  </div>
</template>
