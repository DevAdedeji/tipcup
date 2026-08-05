<script setup lang="ts">
import { Inbox } from 'lucide-vue-next'

interface Column {
    key: string
    label: string
    class?: string
    align?: 'left' | 'right' | 'center'
}

withDefaults(
    defineProps<{
        columns: Column[]
        data: any[]
        loading?: boolean
        emptyMessage?: string
        loadingRows?: number
    }>(),
    { loadingRows: 5 }
)

const alignments = {
    left: 'text-left',
    right: 'text-right',
    center: 'text-center',
}
</script>

<template>
    <div class="overflow-hidden border border-border bg-surface shadow-xs">
        <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
                <thead class="border-b border-border bg-surface-sunken">
                    <tr>
                        <th
                            v-for="col in columns"
                            :key="col.key"
                            scope="col"
                            class="whitespace-nowrap px-5 py-3 text-2xs font-semibold uppercase tracking-wider text-text-tertiary"
                            :class="[alignments[col.align || 'left'], col.class]"
                        >
                            {{ col.label }}
                        </th>
                    </tr>
                </thead>

                <tbody class="divide-y divide-border">
                    <template v-if="loading">
                        <tr v-for="n in loadingRows" :key="`skeleton-${n}`">
                            <td v-for="col in columns" :key="col.key" class="px-5 py-4">
                                <Skeleton class="h-4" :class="col.align === 'right' ? 'ml-auto w-16' : 'w-24'" />
                            </td>
                        </tr>
                    </template>

                    <tr v-else-if="data.length === 0">
                        <td :colspan="columns.length" class="px-5 py-14 text-center">
                            <slot name="empty">
                                <div class="flex flex-col items-center gap-2">
                                    <div class=" bg-muted p-3 text-text-tertiary">
                                        <Inbox class="h-5 w-5" />
                                    </div>
                                    <p class="text-sm text-text-secondary">
                                        {{ emptyMessage || 'Nothing here yet.' }}
                                    </p>
                                </div>
                            </slot>
                        </td>
                    </tr>

                    <template v-else>
                        <tr
                            v-for="(row, i) in data"
                            :key="i"
                            class="transition-colors hover:bg-surface-hover"
                        >
                            <td
                                v-for="col in columns"
                                :key="col.key"
                                class="whitespace-nowrap px-5 py-4 text-text-primary"
                                :class="[alignments[col.align || 'left'], col.class]"
                            >
                                <slot :name="col.key" :row="row" :index="i">
                                    {{ row[col.key] }}
                                </slot>
                            </td>
                        </tr>
                    </template>
                </tbody>
            </table>
        </div>
    </div>
</template>
