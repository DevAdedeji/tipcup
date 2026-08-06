<script setup lang="ts">
import { useAuth } from '~/composables/useAuth'
import { formatCurrency, MIN_TIP_AMOUNT } from '~/utils/format'
import { ChevronRight, Check } from 'lucide-vue-next'

const { user } = useAuth()

const steps = [
  { title: 'Claim your name', body: 'Pick a username. Your page and its cloth exist the moment you do.' },
  { title: 'Share the one link', body: 'Supporters pay by transfer or card. No account, no app.' },
  { title: 'Move it to your bank', body: 'Withdraw to any Nigerian bank account, whenever you want.' },
]

const fees = [
  { key: 'Bank transfer in', value: '1.5% · max ₦2,000' },
  { key: 'Withdrawal to bank', value: '₦100 flat' },
  { key: 'Monthly fee', value: '₦0', free: true },
  { key: 'Setup', value: '₦0', free: true },
  { key: 'NGN settlement', value: 'Instant' },
]

const samples = ['adaobi', 'tobi', 'chiamaka', 'devadedeji', 'zainab', 'emeka']

const demoTiers = [
  { emoji: '☕', price: 1000, label: 'Coffee' },
  { emoji: '🍜', price: 2500, label: 'Lunch' },
  { emoji: '🎉', price: 5000, label: 'Big one' },
]
const picked = ref(demoTiers[0])

usePageMeta({
  title: 'Get paid by the people who love what you make',
  description:
    'TipCup gives Nigerian creators a page their fans can pay into — bank transfer or card, no account needed — and pays out to any Nigerian bank account.',
})
</script>

<template>
  <div class="min-h-[100dvh] bg-background text-text-primary">
    <AdireCloth class="h-2 w-full" />

    <div class="mx-auto max-w-content px-5 sm:px-6">
      <nav class="flex items-center justify-between gap-4 py-5">
        <span class="font-display text-xl font-semibold tracking-tight">TipCup</span>
        <div class="flex items-center gap-2">
          <ThemeToggle />
          <template v-if="user">
            <Button to="/dashboard" size="sm">Dashboard</Button>
          </template>
          <template v-else>
            <Button to="/login" variant="ghost" size="sm" class="hidden sm:inline-flex">Log in</Button>
            <Button to="/signup" size="sm">Start my page</Button>
          </template>
        </div>
      </nav>
    </div>

    <div class="mx-auto max-w-content px-5 sm:px-6">
      <header class="grid items-center gap-12 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:py-24">
        <div>
          <p class="field-label">For Nigerian creators</p>

          <h1 class="mt-4 font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            Get paid by the people who love what you make.
          </h1>

          <p class="mt-6 max-w-md text-lg leading-relaxed text-text-secondary">
            One page your fans can pay into — by transfer or card, with no account. It settles to
            your balance, and you move it to your bank whenever you want.
          </p>

          <div class="mt-8 flex flex-wrap gap-3">
            <Button :to="user ? '/dashboard' : '/signup'" size="xl">
              {{ user ? 'Go to dashboard' : 'Claim your page' }}
              <template #suffix><ChevronRight class="h-4 w-4" /></template>
            </Button>
          </div>

          <ul class="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-text-secondary">
            <li class="flex items-center gap-1.5">
              <Check class="h-4 w-4 text-accent" />
              {{ formatCurrency(MIN_TIP_AMOUNT) }} minimum
            </li>
            <li class="flex items-center gap-1.5">
              <Check class="h-4 w-4 text-accent" />
              Instant NGN settlement
            </li>
            <li class="flex items-center gap-1.5">
              <Check class="h-4 w-4 text-accent" />
              No monthly fee
            </li>
          </ul>
        </div>

        <div class="mx-auto w-full max-w-sm">
          <div class="border border-border bg-surface shadow-lg">
            <AdireCloth seed="adaobi" class="h-20 w-full" />

            <div class="px-5 pb-5">
              <div class="-mt-7 h-14 w-14 border-4 border-surface bg-muted" aria-hidden="true" />
              <p class="mt-3 font-display text-xl font-semibold tracking-tight">Ada Obi</p>
              <p class="text-sm text-text-tertiary">@adaobi</p>

              <div class="mt-4 grid grid-cols-3 gap-2">
                <button
                  v-for="tier in demoTiers"
                  :key="tier.price"
                  class="flex flex-col items-center gap-1 border px-2 py-2.5 transition-all duration-200"
                  :class="
                    picked?.price === tier.price
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border hover:border-border-strong hover:bg-surface-hover'
                  "
                  @click="picked = tier"
                >
                  <span class="text-base leading-none">{{ tier.emoji }}</span>
                  <span class="tabular text-xs font-semibold">{{ formatCurrency(tier.price) }}</span>
                </button>
              </div>

              <Button variant="primary" block size="lg" class="mt-4">
                Send {{ formatCurrency(picked?.price || 0) }}
              </Button>
            </div>
          </div>
        </div>
      </header>
    </div>

    <section class="border-y border-border bg-surface-sunken px-5 py-16 sm:px-6 lg:py-24">
      <div class="mx-auto max-w-content">
        <div class="max-w-xl">
          <p class="field-label">Your own cloth</p>
          <h2 class="mt-3 font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            No two creator pages look the same.
          </h2>
          <p class="mt-4 text-md leading-relaxed text-text-secondary">
            Adire is Yoruba resist-dyed cloth — the pattern appears where the fabric was tied, so no
            two pieces are ever identical. Your username is woven into your own pattern. It's yours,
            it never changes, and nobody else has it.
          </p>
        </div>

        <ul class="stagger mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <li v-for="name in samples" :key="name" class="text-center">
            <AdireCloth :seed="name" class="aspect-square w-full border border-border" />
            <p class="mt-2 truncate text-xs text-text-tertiary">@{{ name }}</p>
          </li>
        </ul>
      </div>
    </section>

    <section class="px-5 py-16 sm:px-6 lg:py-24">
      <div class="mx-auto max-w-content">
        <div class="max-w-xl">
          <p class="field-label">How it works</p>
          <h2 class="mt-3 font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            Three steps, then you're taking money.
          </h2>
        </div>

        <ol class="stagger mt-10 grid gap-5 sm:grid-cols-3">
          <li v-for="(step, i) in steps" :key="step.title" class="border-t-2 border-primary pt-4">
            <span class="tabular field-label">{{ String(i + 1).padStart(2, '0') }}</span>
            <h3 class="mt-2 font-display text-xl font-semibold tracking-tight">{{ step.title }}</h3>
            <p class="mt-1.5 text-sm leading-relaxed text-text-secondary">{{ step.body }}</p>
          </li>
        </ol>
      </div>
    </section>

    <section class="border-y border-border bg-surface-sunken px-5 py-16 sm:px-6 lg:py-24">
      <div class="mx-auto max-w-content">
        <div class="max-w-xl">
          <p class="field-label">Fees</p>
          <h2 class="mt-3 font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            Printed here, not buried in a help centre.
          </h2>
          <p class="mt-4 text-md text-text-secondary">
            You keep the rest. No subscription, nothing to cancel.
          </p>
        </div>

        <dl class="mt-9 max-w-2xl border-t border-border">
          <div
            v-for="fee in fees"
            :key="fee.key"
            class="flex items-baseline justify-between gap-4 border-b border-border py-4"
          >
            <dt class="text-md">{{ fee.key }}</dt>
            <dd class="tabular text-md font-semibold" :class="fee.free ? 'text-accent' : ''">
              {{ fee.value }}
            </dd>
          </div>
        </dl>
      </div>
    </section>

    <section class="px-5 py-20 sm:px-6 lg:py-28">
      <div class="mx-auto flex max-w-content flex-col items-start gap-6">
        <AdireCloth seed="tipcup" class="h-10 w-24" />
        <h2 class="max-w-[18ch] font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
          Your cloth is waiting to be woven.
        </h2>
        <Button :to="user ? '/dashboard' : '/signup'" size="xl">
          {{ user ? 'Go to dashboard' : 'Claim your page' }}
          <template #suffix><ChevronRight class="h-4 w-4" /></template>
        </Button>
      </div>
    </section>

    <footer class="border-t border-border">
      <div
        class="mx-auto flex max-w-content flex-wrap items-center justify-between gap-4 px-5 py-8 text-xs text-text-tertiary sm:px-6"
      >
        <span>TipCup</span>
        <span>Payments secured by Bachs</span>
        <span class="tabular">&copy; {{ new Date().getFullYear() }}</span>
      </div>
    </footer>
  </div>
</template>
