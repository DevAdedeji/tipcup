<script setup lang="ts">
import { Copy, Check } from 'lucide-vue-next'

const route = useRoute()
const { userProfile } = useAuth()

const title = computed(() => route.meta.title || 'Dashboard')
const subtitle = computed(() => route.meta.subtitle || '')

const copied = ref(false)
let resetTimer: ReturnType<typeof setTimeout> | undefined

const shareLink = computed(() =>
    userProfile.value?.username ? `tipcup.adedeji.xyz/${userProfile.value.username}` : ''
)

const copyLink = async () => {
    if (!shareLink.value) return

    try {
        await navigator.clipboard.writeText(`https://${shareLink.value}`)
        copied.value = true
        clearTimeout(resetTimer)
        resetTimer = setTimeout(() => (copied.value = false), 2000)
    } catch {
        useToast().add({ title: 'Could not copy', description: 'Copy the link manually.', type: 'error' })
    }
}

onUnmounted(() => clearTimeout(resetTimer))
</script>

<template>
    <header
        class="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-border bg-background/85 px-4 py-3 backdrop-blur-md md:px-8"
    >
        <div class="ml-12 min-w-0 md:ml-0">
            <h1 class="truncate font-display text-lg font-semibold tracking-tight text-text-primary">
                {{ title }}
            </h1>
            <p v-if="subtitle" class="mt-0.5 truncate text-sm text-text-secondary">{{ subtitle }}</p>
        </div>

        <div class="flex shrink-0 items-center gap-2">
            <button
                v-if="shareLink"
                class="hidden items-center gap-2 border border-border bg-surface px-3 py-2 text-xs font-medium text-text-secondary shadow-xs transition-all duration-200 hover:bg-surface-hover hover:text-text-primary sm:flex"
                @click="copyLink"
            >
                <Check v-if="copied" class="h-3.5 w-3.5 text-success" />
                <Copy v-else class="h-3.5 w-3.5" />
                <span class="tabular">{{ copied ? 'Copied' : shareLink }}</span>
            </button>

            <ThemeToggle />
        </div>
    </header>
</template>
