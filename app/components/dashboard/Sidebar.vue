<script setup lang="ts">
import { useAuth } from '~/composables/useAuth'
import {
    LayoutDashboard,
    Settings,
    LogOut,
    Menu,
    X,
    ExternalLink,
    Target,
    Wallet
} from 'lucide-vue-next'

const { userProfile, logout } = useAuth()
const route = useRoute()

const links = [
    { label: 'Overview', to: '/dashboard', icon: LayoutDashboard },
    { label: 'Earnings', to: '/dashboard/earnings', icon: Wallet },
    { label: 'Goals', to: '/dashboard/goals', icon: Target },
    { label: 'Settings', to: '/dashboard/settings', icon: Settings },
]

const profileUrl = computed(() => {
    if (!userProfile.value?.username) return ''
    return `/${userProfile.value.username}`
})

const isOpen = ref(false)


watch(() => route.path, () => { isOpen.value = false })
</script>

<template>
    <div>
        <button
            class="fixed left-4 top-3.5 z-50 flex h-9 w-9 items-center justify-center border border-border bg-surface text-text-secondary shadow-sm transition-colors hover:text-text-primary md:hidden"
            :aria-label="isOpen ? 'Close menu' : 'Open menu'"
            :aria-expanded="isOpen"
            @click="isOpen = !isOpen"
        >
            <X v-if="isOpen" class="h-5 w-5" />
            <Menu v-else class="h-5 w-5" />
        </button>

        <Transition
            enter-active-class="transition-opacity duration-200"
            enter-from-class="opacity-0"
            leave-active-class="transition-opacity duration-150"
            leave-to-class="opacity-0"
        >
            <div
                v-if="isOpen"
                class="fixed inset-0 z-40 bg-background/70 backdrop-blur-sm md:hidden"
                @click="isOpen = false"
            />
        </Transition>

        <aside
            class="fixed left-0 top-0 z-40 flex h-[100dvh] w-64 transform flex-col border-r border-border bg-surface transition-transform duration-300 ease-out md:translate-x-0"
            :class="isOpen ? 'translate-x-0' : '-translate-x-full'"
        >
            <AdireCloth :seed="userProfile?.username" class="h-1.5 w-full shrink-0" />

            <div class="flex h-16 shrink-0 items-center border-b border-border px-5">
                <NuxtLink to="/dashboard" class="font-display text-xl font-semibold tracking-tight text-text-primary">
                    TipCup
                </NuxtLink>
            </div>

            <nav class="min-h-0 flex-1 space-y-0.5 overflow-y-auto p-3">
                <NuxtLink
                    v-for="link in links"
                    :key="link.to"
                    :to="link.to"
                    class="group relative flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all duration-200"
                    :class="
                        route.path === link.to
                            ? 'bg-surface-hover text-text-primary'
                            : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                    "
                >
                    <span
                        v-if="route.path === link.to"
                        class="absolute inset-y-1.5 left-0 w-0.5-full bg-accent"
                        aria-hidden="true"
                    />
                    <component :is="link.icon" class="h-[18px] w-[18px] shrink-0" />
                    <span>{{ link.label }}</span>
                </NuxtLink>

                <div v-if="profileUrl" class="mt-4 border-t border-border pt-4">
                    <p class="field-label mb-1.5 px-3">Your page</p>
                    <a
                        :href="profileUrl"
                        target="_blank"
                        rel="noopener"
                        class="group flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-text-secondary transition-all duration-200 hover:bg-surface-hover hover:text-text-primary"
                    >
                        <ExternalLink class="h-[18px] w-[18px] shrink-0" />
                        <span class="truncate">@{{ userProfile?.username }}</span>
                    </a>
                </div>
            </nav>

            <div class="shrink-0 border-t border-border p-3">
                <div class="flex items-center gap-2.5 p-2">
                    <Avatar
                        :src="userProfile?.avatarUrl"
                        :alt="userProfile?.displayName || 'You'"
                        size="sm"
                        class="shrink-0"
                    />
                    <div class="min-w-0 flex-1">
                        <p class="truncate text-sm font-semibold leading-tight text-text-primary">
                            {{ userProfile?.displayName }}
                        </p>
                        <p class="truncate text-xs leading-tight text-text-tertiary">
                            @{{ userProfile?.username }}
                        </p>
                    </div>
                    <button
                        class="flex h-8 w-8 shrink-0 items-center justify-center text-text-tertiary transition-colors hover:bg-error-muted hover:text-error"
                        title="Sign out"
                        @click="logout"
                    >
                        <span class="sr-only">Sign out</span>
                        <LogOut class="h-4 w-4" />
                    </button>
                </div>
            </div>
        </aside>
    </div>
</template>
