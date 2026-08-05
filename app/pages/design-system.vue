<script setup lang="ts">
import { ref } from 'vue'
import { Check, Mail, User, ChevronRight } from 'lucide-vue-next'
import { useToast } from '~/composables/useToast'

const toast = useToast()

usePageMeta({
  title: 'Design System',
  description: 'Showcase of TipCup UI components and design tokens.',
})

// Form states
const inputVal = ref('')
const textareaVal = ref('')
const selectVal = ref('Option 1')
const multiSelectVal = ref(['Option 1', 'Option 2'])
const activeTab = ref(0)
const isModalOpen = ref(false)

// Select options
const options = [
  { label: 'Option 1', value: 'Option 1' },
  { label: 'Option 2', value: 'Option 2' },
  { label: 'Option 3', value: 'Option 3' },
  { label: 'Option 4', value: 'Option 4' },
]

const showToast = (type: 'success' | 'error' | 'warning' | 'info') => {
  toast.add({
    title: 'Notification Title',
    description: 'This is a description for the toast notification.',
    type
  })
}
</script>

<template>
  <div class="min-h-screen bg-background p-8 font-sans text-text-primary">
    <div class="max-w-4xl mx-auto space-y-12">

      <!-- Header -->
      <section>
        <h1 class="text-4xl font-bold mb-2 text-primary">Design System</h1>
        <p class="text-text-secondary">TipCup UI Component Library Showcase</p>
      </section>

      <!-- Buttons -->
      <section class="space-y-4">
        <h2 class="text-2xl font-semibold border-b border-border pb-2">Buttons</h2>
        <div class="flex flex-wrap gap-4 items-center">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </div>
        <div class="flex flex-wrap gap-4 items-center">
           <Button size="sm">Small</Button>
           <Button size="md">Medium</Button>
           <Button size="lg">Large</Button>
           <Button size="icon"><User class="w-4 h-4" /></Button>
        </div>
        <div class="flex flex-wrap gap-4 items-center">
            <Button loading>Loading</Button>
            <Button disabled>Disabled</Button>
            <Button>
                <template #prefix><Mail class="w-4 h-4" /></template>
                With Prefix
            </Button>
            <Button>
                With Suffix
                <template #suffix><ChevronRight class="w-4 h-4" /></template>
            </Button>
        </div>
      </section>

      <!-- Inputs -->
      <section class="space-y-4">
        <h2 class="text-2xl font-semibold border-b border-border pb-2">Inputs</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input v-model="inputVal" label="Default Input" placeholder="Type something..." />
          <Input v-model="inputVal" label="Error State" error="This field is required" placeholder="Error..." />
          <Input v-model="inputVal" label="With Prefix" placeholder="Email address">
            <template #prefix><Mail class="w-4 h-4" /></template>
          </Input>
           <Input v-model="inputVal" label="With Suffix" placeholder="Search...">
            <template #suffix><User class="w-4 h-4" /></template>
          </Input>
          <Input v-model="inputVal" label="Disabled" disabled placeholder="Disabled input" />
          <Input v-model="inputVal" label="With Hint" hint="This is a helpful hint" placeholder="Hint..." />
        </div>
      </section>

      <!-- Textarea -->
      <section class="space-y-4">
        <h2 class="text-2xl font-semibold border-b border-border pb-2">Textarea</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Textarea v-model="textareaVal" label="Description" placeholder="Enter description..." />
            <Textarea v-model="textareaVal" label="Error" error="Message is too short" />
        </div>
      </section>

      <!-- Selects -->
      <section class="space-y-4">
        <h2 class="text-2xl font-semibold border-b border-border pb-2">Selects</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select v-model="selectVal" :options="options" label="Single Select" />
            <Multiselect v-model="multiSelectVal" :options="options" label="Multi Select" />
        </div>
      </section>

      <!-- Badges -->
      <section class="space-y-4">
          <h2 class="text-2xl font-semibold border-b border-border pb-2">Badges</h2>
          <div class="flex gap-2">
              <Badge variant="default">Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
          </div>
      </section>

      <!-- Avatars -->
      <section class="space-y-4">
          <h2 class="text-2xl font-semibold border-b border-border pb-2">Avatars</h2>
          <div class="flex gap-4 items-center">
              <Avatar src="https://github.com/shadcn.png" size="sm" />
              <Avatar src="https://github.com/shadcn.png" size="md" />
              <Avatar src="https://github.com/shadcn.png" size="lg" />
              <Avatar alt="JD" fallback="JD" size="lg" />
          </div>
      </section>

      <!-- Cards -->
       <section class="space-y-4">
          <h2 class="text-2xl font-semibold border-b border-border pb-2">Cards</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                  <template #header>
                      <h3 class="font-semibold text-lg">Card Title</h3>
                      <p class="text-sm text-text-secondary">Card Description</p>
                  </template>
                  <p>This is the card content. It can contain anything.</p>
                  <template #footer>
                      <Button variant="outline" size="sm">Cancel</Button>
                      <Button size="sm" class="ml-2">Submit</Button>
                  </template>
              </Card>
          </div>
       </section>

      <!-- Tabs -->
      <section class="space-y-4">
          <h2 class="text-2xl font-semibold border-b border-border pb-2">Tabs</h2>
          <Tabs v-model="activeTab" :items="['Account', 'Password', 'Settings']">
              <TabPanel class="p-4 bg-surface border border-border mt-2">Account Content</TabPanel>
              <TabPanel class="p-4 bg-surface border border-border mt-2">Password Content</TabPanel>
              <TabPanel class="p-4 bg-surface border border-border mt-2">Settings Content</TabPanel>
          </Tabs>
      </section>

       <!-- Toasts -->
      <section class="space-y-4">
          <h2 class="text-2xl font-semibold border-b border-border pb-2">Toasts</h2>
          <div class="flex gap-2">
              <Button @click="showToast('success')" variant="outline" class="border-success text-success hover:bg-success/10">Success</Button>
              <Button @click="showToast('error')" variant="outline" class="border-error text-error hover:bg-error/10">Error</Button>
              <Button @click="showToast('warning')" variant="outline" class="border-warning text-warning hover:bg-warning/10">Warning</Button>
              <Button @click="showToast('info')" variant="outline" class="border-info text-info hover:bg-info/10">Info</Button>
          </div>
      </section>

      <!-- Modal -->
      <section class="space-y-4">
          <h2 class="text-2xl font-semibold border-b border-border pb-2">Modal</h2>
          <Button @click="isModalOpen = true">Open Modal</Button>
          <Modal :isOpen="isModalOpen" @close="isModalOpen = false" title="Example Modal" description="This is a modal description.">
              <p>Modal content goes here.</p>
              <template #footer>
                  <Button variant="outline" @click="isModalOpen = false">Close</Button>
                  <Button @click="isModalOpen = false">Confirm</Button>
              </template>
          </Modal>
      </section>

    </div>
  </div>
</template>
