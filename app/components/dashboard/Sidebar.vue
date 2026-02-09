<script setup lang="ts">
import { useAuth } from '~/composables/useAuth'
import {
    LayoutDashboard,
    Settings,
    User,
    LogOut,
    Menu,
    X,
    ExternalLink,
    Target
} from 'lucide-vue-next'

const { userProfile, logout } = useAuth()
const route = useRoute()

const links = [
    { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
    { label: 'Goals', to: '/dashboard/goals', icon: Target },
    { label: 'Settings', to: '/dashboard/settings', icon: Settings },
]

const profileUrl = computed(() => {
    if (!userProfile.value?.username) return ''
    return `/${userProfile.value.username}`
})

const isOpen = ref(false)
</script>

<template>
    <div>
        <!-- Mobile Toggle -->
        <button @click="isOpen = !isOpen" class="md:hidden fixed top-4 left-4 p-2 bg-surface border border-white/10 rounded-lg shadow-lg" :class="isOpen ? '' : 'z-50 pr-1'">
            <Menu v-if="!isOpen" class="w-6 h-6" />
            <!-- <X v-else class="w-6 h-6" /> -->
        </button>

        <!-- Sidebar Backdrop (Mobile) -->
        <div v-if="isOpen" @click="isOpen = false" class="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"></div>

        <!-- Sidebar -->
        <aside
            class="fixed top-0 left-0 h-[100dvh] w-64 bg-surface border-r border-white/5 z-40 transform transition-transform duration-300 md:translate-x-0 flex flex-col"
            :class="isOpen ? 'translate-x-0' : '-translate-x-full'"
        >
            <!-- Logo -->
            <div class="h-16 flex items-center px-6 border-b border-white/5">
                <div class="flex items-center gap-3">
                    <img src="/logo.png" alt="TipCup" class="w-8 h-8" />
                    <span class="font-bold text-xl tracking-tight">TipCup</span>
                </div>
            </div>

            <!-- Navigation -->
            <nav class="flex-1 overflow-y-auto min-h-0 py-6 px-3 space-y-1">
                <NuxtLink
                    v-for="link in links"
                    :key="link.to"
                    :to="link.to"
                    class="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group relative"
                    :class="route.path === link.to ? 'bg-primary/10 text-primary border-l-4 border-primary' : 'text-text-secondary hover:text-text-primary hover:bg-white/5'"
                    @click="isOpen = false"
                >
                    <component :is="link.icon" class="w-5 h-5" />
                    <span class="font-medium">{{ link.label }}</span>
                </NuxtLink>

                <div class="pt-4 mt-4 border-t border-white/5 px-3">
                   <p class="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2 px-1">External</p>
                   <NuxtLink
                        v-if="profileUrl"
                        :to="profileUrl"
                        target="_blank"
                        class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:text-primary hover:bg-white/5 transition-all group"
                    >
                        <ExternalLink class="w-5 h-5" />
                        <span class="font-medium">My Page</span>
                    </NuxtLink>
                </div>
            </nav>

            <!-- User Footer -->
            <div class="p-4 border-t border-white/5 flex items-center justify-between gap-2">
                <div class="flex items-center gap-3 overflow-hidden">
                    <Avatar :src="userProfile?.avatarUrl" class="w-9 h-9 border border-white/10 shrink-0" />
                    <div class="flex-1 min-w-0">
                        <p class="font-bold truncate text-sm leading-tight">{{ userProfile?.displayName }}</p>
                        <p class="text-xs text-text-secondary truncate leading-tight">@{{ userProfile?.username }}</p>
                    </div>
                </div>
                <button @click="logout" class="p-2 text-text-secondary hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors" title="Sign Out">
                    <LogOut class="w-5 h-5" />
                </button>
            </div>
        </aside>
    </div>
</template>
