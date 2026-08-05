<script setup lang="ts">
import {
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
  DialogTitle,
  DialogDescription,
} from '@headlessui/vue'
import { X } from 'lucide-vue-next'

interface Props {
  isOpen: boolean
  title?: string
  description?: string
  width?: string
}

withDefaults(defineProps<Props>(), {
  isOpen: false,
  width: 'max-w-md',
})

const emit = defineEmits(['close'])

const closeModal = () => emit('close')
</script>

<template>
  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" class="relative z-50" @close="closeModal">
      <TransitionChild
        as="template"
        enter="duration-200 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-150 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-background/70 backdrop-blur-sm" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-end justify-center p-4 sm:items-center">
          <TransitionChild
            as="template"
            enter="duration-200 ease-out"
            enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enter-to="opacity-100 translate-y-0 sm:scale-100"
            leave="duration-150 ease-in"
            leave-from="opacity-100 translate-y-0 sm:scale-100"
            leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <DialogPanel
              class="w-full transform overflow-visible border border-border bg-surface text-left align-middle shadow-xl transition-all"
              :class="width"
            >
              <div
                v-if="title"
                class="flex items-start justify-between gap-4 border-b border-border px-5 py-4"
              >
                <div class="min-w-0">
                  <DialogTitle as="h3" class="font-display text-lg font-semibold text-text-primary">
                    {{ title }}
                  </DialogTitle>
                  <DialogDescription v-if="description" class="mt-1 text-sm text-text-secondary">
                    {{ description }}
                  </DialogDescription>
                </div>

                <button
                  type="button"
                  class="-mr-1.5 -mt-1 flex h-8 w-8 shrink-0 items-center justify-center text-text-tertiary transition-colors hover:bg-surface-hover hover:text-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                  @click="closeModal"
                >
                  <span class="sr-only">Close</span>
                  <X class="h-4 w-4" />
                </button>
              </div>

              <div class="px-5 py-5">
                <slot />
              </div>

              <div
                v-if="$slots.footer"
                class="flex items-center justify-end gap-2 border-t border-border px-5 py-4"
              >
                <slot name="footer" />
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
