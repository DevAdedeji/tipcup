<script setup lang="ts">
import { useToast } from '~/composables/useToast'
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-vue-next'

const { toasts, remove } = useToast()

const styles = {
  success: { icon: CheckCircle2, tint: 'text-success bg-success-muted', bar: 'bg-success' },
  error: { icon: AlertCircle, tint: 'text-error bg-error-muted', bar: 'bg-error' },
  warning: { icon: AlertTriangle, tint: 'text-warning bg-warning-muted', bar: 'bg-warning' },
  info: { icon: Info, tint: 'text-info bg-info-muted', bar: 'bg-info' },
} as const

const styleFor = (type: string | undefined) => styles[(type as keyof typeof styles) ?? 'info'] ?? styles.info
</script>

<template>
  <div
    class="pointer-events-none fixed inset-x-0 top-0 z-[100] flex flex-col items-center gap-2.5 p-4 sm:inset-x-auto sm:right-4 sm:top-4 sm:items-end sm:p-0"
    role="region"
    aria-label="Notifications"
  >
    <TransitionGroup
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 -translate-y-2 sm:translate-y-0 sm:translate-x-4 scale-95"
      enter-to-class="opacity-100 translate-y-0 sm:translate-x-0 scale-100"
      leave-active-class="transition duration-200 ease-in absolute"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
      move-class="transition duration-200"
    >
      <div
        v-for="toast in toasts"
        :key="toast.id"
        role="alert"
        aria-live="polite"
        class="pointer-events-auto relative flex w-full max-w-sm gap-3 overflow-hidden border border-border bg-surface p-3.5 shadow-lg"
      >
        <span
          class="absolute inset-y-0 left-0 w-1"
          :class="styleFor(toast.type).bar"
          aria-hidden="true"
        />

        <div
          class="ml-1 flex h-8 w-8 shrink-0 items-center justify-center"
          :class="styleFor(toast.type).tint"
        >
          <component :is="styleFor(toast.type).icon" class="h-4 w-4" aria-hidden="true" />
        </div>

        <div class="min-w-0 flex-1 pt-0.5">
          <p class="text-sm font-semibold text-text-primary">{{ toast.title }}</p>
          <p v-if="toast.description" class="mt-0.5 text-sm leading-snug text-text-secondary">
            {{ toast.description }}
          </p>
        </div>

        <button
          type="button"
          class="-mr-1 -mt-1 flex h-7 w-7 shrink-0 items-center justify-center text-text-tertiary transition-colors hover:bg-surface-hover hover:text-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          @click="remove(toast.id)"
        >
          <span class="sr-only">Dismiss</span>
          <X class="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>
