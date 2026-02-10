<script setup lang="ts">
import { useToast } from '~/composables/useToast'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-vue-next'
import { cn } from '~/utils/cn'

const { toasts, remove } = useToast()

const getIcon = (type: string | undefined) => {
  switch (type) {
    case 'success': return CheckCircle
    case 'error': return AlertCircle
    case 'warning': return AlertTriangle
    case 'info': return Info
    default: return Info
  }
}

const getTypeClasses = (type: string | undefined) => {
  switch (type) {
    case 'success': return 'bg-success text-white'
    case 'error': return 'bg-error text-white'
    case 'warning': return 'bg-warning text-text-primary'
    case 'info': return 'bg-info text-white'
    default: return 'bg-surface text-text-primary border border-border'
  }
}
</script>

<template>
  <div class="fixed top-4 right-1 md:right-4 z-50 flex flex-col gap-2 w-full max-w-sm pointer-events-none p-4 sm:p-0">
    <TransitionGroup
      enter-active-class="transform ease-out duration-300 transition"
      enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
      enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
      leave-active-class="transition ease-in duration-100"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5"
        :class="getTypeClasses(toast.type)"
      >
        <div class="p-4">
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <component :is="getIcon(toast.type)" class="h-6 w-6" aria-hidden="true" />
            </div>
            <div class="ml-3 w-0 flex-1 pt-0.5">
              <p class="text-sm font-medium">{{ toast.title }}</p>
              <p v-if="toast.description" class="mt-1 text-sm opacity-90">{{ toast.description }}</p>
            </div>
            <div class="ml-4 flex flex-shrink-0">
              <button
                type="button"
                class="inline-flex rounded-md bg-transparent text-current hover:text-opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2"
                @click="remove(toast.id)"
              >
                <span class="sr-only">Close</span>
                <X class="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>
