<script setup lang="ts">
import { TransitionRoot, TransitionChild, Dialog, DialogPanel, DialogTitle, DialogDescription } from '@headlessui/vue'
import { X } from 'lucide-vue-next'

interface Props {
  isOpen: boolean
  title?: string
  description?: string
  width?: string
}

const props = withDefaults(defineProps<Props>(), {
  isOpen: false,
  width: 'max-w-md'
})

const emit = defineEmits(['close'])

function closeModal() {
  emit('close')
}
</script>

<template>
  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" @close="closeModal" class="relative z-50">
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/25" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div
          class="flex min-h-full items-center justify-center p-4 text-center"
        >
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel
              class="w-full transform overflow-hidden rounded-2xl bg-surface p-6 text-left align-middle shadow-xl transition-all border border-border"
              :class="width"
            >
              <div class="flex justify-between items-center mb-4" v-if="title">
                  <DialogTitle
                    as="h3"
                    class="text-lg font-medium leading-6 text-text-primary"
                  >
                    {{ title }}
                  </DialogTitle>
                  <button @click="closeModal" class="text-text-secondary hover:text-text-primary">
                      <X class="w-5 h-5"/>
                  </button>
              </div>

              <DialogDescription v-if="description" class="mt-2 text-sm text-text-secondary mb-4">
                  {{ description }}
              </DialogDescription>

              <div class="mt-2">
                <slot />
              </div>

              <div class="mt-4 flex justify-end gap-2" v-if="$slots.footer">
                  <slot name="footer" />
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
