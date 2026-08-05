<script setup lang="ts">
import { useAuth } from '~/composables/useAuth'
import { formatCurrency, MIN_TIP_AMOUNT } from '~/utils/format'

const { user } = useAuth()

const steps = [
  {
    title: 'Claim your link',
    body: 'Pick a username. Your page is live at tipcup.adedeji.xyz/yourname immediately.',
  },
  {
    title: 'Put it in your bio',
    body: "Supporters pay by bank transfer or card. They don't need an account.",
  },
  {
    title: 'Move it to your bank',
    body: 'Withdraw to any Nigerian bank account, on your own schedule.',
  },
]

const fees = [
  { key: 'Bank transfer in', value: '1.5% · max ₦2,000' },
  { key: 'Withdrawal to bank', value: '₦100 flat' },
  { key: 'Monthly fee', value: '₦0', zero: true },
  { key: 'Setup', value: '₦0', zero: true },
  { key: 'NGN settlement', value: 'Instant' },
]

const capabilities = [
  { title: 'Your own tiers.', body: 'Name them anything — Coffee, Lunch, Big one.' },
  { title: 'Goals that actually move.', body: 'Every tip advances the bar in public.' },
  { title: 'All your links.', body: 'Socials live on the same page as the payment.' },
]

usePageMeta({
  title: 'Get paid by the people who love what you make',
  description:
    'TipCup gives Nigerian creators a page their fans can pay into — bank transfer or card, no account needed — and pays out to any Nigerian bank account.',
})
</script>

<template>
  <div class="min-h-[100dvh] bg-background text-text-primary">
    <div class="mx-auto max-w-content px-4 sm:px-6">
      <nav class="flex items-center justify-between gap-4 border-b border-border py-4">
        <span class="font-mono text-sm font-semibold tracking-[0.34em] [text-indent:0.34em]">
          TIPCUP
        </span>
        <div class="flex items-center gap-2">
          <ThemeToggle />
          <template v-if="user">
            <Button to="/dashboard" size="sm">Dashboard</Button>
          </template>
          <template v-else>
            <Button to="/login" variant="outline" size="sm" class="hidden sm:inline-flex">
              Log in
            </Button>
            <Button to="/signup" size="sm">Start my page</Button>
          </template>
        </div>
      </nav>
    </div>

    <div class="mx-auto max-w-content px-4 sm:px-6">
      <header class="grid items-start gap-10 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:py-20">
        <div>
          <p class="field-label">For Nigerian creators</p>

          <h1
            class="mt-4 font-display text-4xl font-bold leading-[0.95] tracking-tight sm:text-5xl lg:text-6xl"
          >
            The alert you actually <span class="text-accent">want</span> to get.
          </h1>

          <p class="mt-5 max-w-md text-md leading-relaxed text-text-secondary">
            A page your fans can pay into — bank transfer or card, no account, no app. It lands in
            your balance, and you move it to your bank whenever you want.
          </p>

          <div class="mt-8 flex flex-wrap gap-2.5">
            <Button :to="user ? '/dashboard' : '/signup'" size="xl">
              {{ user ? 'Go to dashboard' : 'Claim your page' }}
            </Button>
          </div>

          <dl
            class="mt-8 flex flex-wrap gap-x-6 gap-y-2 border-t border-border pt-4 font-mono text-2xs uppercase tracking-label text-text-tertiary"
          >
            <div class="flex gap-1.5">
              <dt class="sr-only">Minimum tip</dt>
              <dd class="font-semibold text-text-primary">{{ formatCurrency(MIN_TIP_AMOUNT) }}</dd>
              <dd>minimum tip</dd>
            </div>
            <div class="flex gap-1.5">
              <dd class="font-semibold text-text-primary">Instant</dd>
              <dd>NGN settlement</dd>
            </div>
            <div class="flex gap-1.5">
              <dd class="font-semibold text-text-primary">No</dd>
              <dd>monthly fee</dd>
            </div>
          </dl>
        </div>

        <div
          class="border border-border bg-surface-sunken shadow-lg"
          role="img"
          aria-label="Bank credit alert showing 5,000 naira received via TipCup"
        >
          <div
            class="flex items-center justify-between border-b border-border px-4 py-2.5 font-mono text-2xs uppercase tracking-label text-text-tertiary"
          >
            <span>Bank alert</span>
            <span class="tabular">09:41</span>
          </div>

          <div class="px-4 py-5">
            <p class="flex items-baseline gap-2 font-mono text-2xl font-semibold tracking-tight text-accent sm:text-3xl">
              <span class="border-[1.5px] border-accent px-1.5 py-0.5 text-2xs tracking-label">CR</span>
              <span class="tabular">NGN 5,000.00</span>
            </p>

            <dl class="mt-4 space-y-2">
              <div
                v-for="row in [
                  { k: 'Acct', v: '****4021' },
                  { k: 'Desc', v: 'TIPCUP/ADAOBI' },
                  { k: 'Bal', v: 'NGN 84,300.00' },
                ]"
                :key="row.k"
                class="flex items-baseline gap-2 font-mono text-xs"
              >
                <dt class="uppercase tracking-label text-text-tertiary">{{ row.k }}</dt>
                <span class="min-w-4 flex-1 -translate-y-1 border-b border-dotted border-border" />
                <dd class="tabular">{{ row.v }}</dd>
              </div>
            </dl>

            <p
              class="mt-5 border-t border-dashed border-border pt-3 font-mono text-2xs uppercase tracking-label text-text-tertiary"
            >
              Someone read your work and paid for it
            </p>
          </div>
        </div>
      </header>
    </div>

    <div class="mx-auto max-w-content px-4 sm:px-6"><div class="tear-rule" /></div>

    <div class="mx-auto max-w-content px-4 sm:px-6">
      <section class="grid items-center gap-10 py-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:py-20">
        <div class="slip slip-torn max-w-xs shadow-lg" aria-hidden="true">
          <div class="px-4 pb-4 pt-5">
            <p class="text-center font-mono text-xs font-semibold tracking-[0.34em] [text-indent:0.34em]">
              TIPCUP
            </p>
            <p class="mt-1 text-center font-mono text-2xs uppercase tracking-label text-text-tertiary">
              Payment slip
            </p>

            <div class="my-3.5 border-t-[3px] border-double border-border" />

            <p class="text-center text-lg font-semibold tracking-tight">Ada Obi</p>
            <p class="mt-0.5 text-center font-mono text-2xs tracking-label text-text-tertiary">
              @adaobi
            </p>

            <div class="my-3.5 border-t-[3px] border-double border-border" />

            <div
              v-for="(tier, i) in [
                { k: 'Coffee', v: 1000 },
                { k: 'Lunch', v: 2500 },
                { k: 'Big one', v: 5000 },
              ]"
              :key="tier.k"
              class="flex items-baseline gap-2 py-1 font-mono text-xs"
            >
              <span
                class="grid h-3.5 w-3.5 shrink-0 place-items-center border text-[0.55rem] leading-none"
                :class="i === 0 ? 'border-primary bg-primary text-primary-foreground' : 'border-border'"
              >
                {{ i === 0 ? '×' : '' }}
              </span>
              <span class="uppercase tracking-label">{{ tier.k }}</span>
              <span class="min-w-4 flex-1 -translate-y-1 border-b border-dotted border-border" />
              <span class="tabular">{{ formatCurrency(tier.v) }}</span>
            </div>

            <div class="my-3.5 border-t-[3px] border-double border-border" />

            <div class="flex items-baseline justify-between">
              <span class="field-label">Total</span>
              <span class="tabular text-xl font-semibold">{{ formatCurrency(1000) }}</span>
            </div>

            <p
              class="mt-3 bg-primary py-2.5 text-center font-mono text-2xs font-semibold uppercase tracking-label text-primary-foreground"
            >
              Send payment
            </p>
          </div>
        </div>

        <div>
          <p class="field-label">What they see</p>
          <h2 class="mt-3 font-display text-2xl font-bold leading-tight tracking-tight sm:text-4xl">
            One link. It looks like a receipt because it is one.
          </h2>
          <p class="mt-4 max-w-lg text-md leading-relaxed text-text-secondary">
            Your supporters land on a page that shows exactly what they're paying, to whom, and what
            it totals — before they pay. No sign-up wall, no redirect maze.
          </p>

          <ul class="mt-6 border-t border-border">
            <li
              v-for="item in capabilities"
              :key="item.title"
              class="flex items-baseline gap-3 border-b border-border py-3"
            >
              <span class="font-mono text-xs text-accent">[×]</span>
              <span class="text-md">
                <strong class="font-semibold">{{ item.title }}</strong>
                <span class="text-text-secondary"> {{ item.body }}</span>
              </span>
            </li>
          </ul>
        </div>
      </section>
    </div>

    <div class="mx-auto max-w-content px-4 sm:px-6"><div class="tear-rule" /></div>

    <div class="mx-auto max-w-content px-4 sm:px-6">
      <section class="py-14 lg:py-20">
        <p class="field-label">Process</p>
        <h2 class="mt-3 max-w-xl font-display text-2xl font-bold leading-tight tracking-tight sm:text-4xl">
          Three steps, then you're taking money.
        </h2>

        <ol class="mt-9 border-t border-border">
          <li
            v-for="(step, i) in steps"
            :key="step.title"
            class="grid items-baseline gap-x-6 gap-y-1.5 border-b border-border py-5 sm:grid-cols-[3.5rem_14rem_1fr]"
          >
            <span class="font-mono text-xs tracking-label text-text-tertiary">
              {{ String(i + 1).padStart(2, '0') }}
            </span>
            <span class="font-display text-lg font-semibold tracking-tight">{{ step.title }}</span>
            <span class="text-sm text-text-secondary">{{ step.body }}</span>
          </li>
        </ol>
      </section>
    </div>

    <div class="mx-auto max-w-content px-4 sm:px-6"><div class="tear-rule" /></div>

    <div class="mx-auto max-w-content px-4 sm:px-6">
      <section class="py-14 lg:py-20">
        <p class="field-label">Fees</p>
        <h2 class="mt-3 max-w-xl font-display text-2xl font-bold leading-tight tracking-tight sm:text-4xl">
          Printed here, not buried in a help centre.
        </h2>
        <p class="mt-4 max-w-lg text-md text-text-secondary">
          You keep the rest. There's no subscription and nothing to cancel.
        </p>

        <dl class="mt-8 max-w-2xl border-t border-border">
          <div
            v-for="fee in fees"
            :key="fee.key"
            class="flex items-baseline gap-2.5 border-b border-border py-3.5 font-mono text-sm"
          >
            <dt class="uppercase tracking-label">{{ fee.key }}</dt>
            <span class="min-w-4 flex-1 -translate-y-1 border-b border-dotted border-border" />
            <dd class="tabular font-semibold" :class="fee.zero ? 'text-accent' : ''">
              {{ fee.value }}
            </dd>
          </div>
        </dl>
      </section>
    </div>

    <div class="mx-auto max-w-content px-4 sm:px-6"><div class="tear-rule" /></div>

    <div class="mx-auto max-w-content px-4 sm:px-6">
      <section class="flex flex-col items-start gap-5 py-16 lg:py-24">
        <span class="stamp text-accent">Takes about a minute</span>
        <h2 class="max-w-[22ch] font-display text-2xl font-bold leading-tight tracking-tight sm:text-4xl">
          Your page is one username away.
        </h2>
        <Button :to="user ? '/dashboard' : '/signup'" size="xl">
          {{ user ? 'Go to dashboard' : 'Claim your page' }}
        </Button>
      </section>
    </div>

    <footer class="border-t border-border">
      <div
        class="mx-auto flex max-w-content flex-wrap items-center justify-between gap-4 px-4 py-7 font-mono text-2xs uppercase tracking-label text-text-tertiary sm:px-6"
      >
        <span>TipCup · Lagos</span>
        <span>Payments secured by Bachs</span>
        <span class="tabular">&copy; {{ new Date().getFullYear() }}</span>
      </div>
    </footer>
  </div>
</template>
