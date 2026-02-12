<script setup lang="ts">
interface Column {
    key: string
    label: string
    class?: string
}

defineProps<{
    columns: Column[]
    data: any[]
    loading?: boolean
    emptyMessage?: string
}>()
</script>

<template>
    <div class="bg-surface border border-primary/20 rounded-2xl overflow-hidden shadow-sm">
        <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
                <thead class="bg-white/5 text-text-secondary uppercase text-xs border-b border-primary/20">
                    <tr>
                        <th v-for="col in columns" :key="col.key" class="px-6 py-4 font-medium" :class="col.class">
                            {{ col.label }}
                        </th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-primary/10">
                    <!-- Loading State -->
                    <tr v-if="loading">
                        <td :colspan="columns.length" class="px-6 py-8 text-center text-text-secondary">
                            <div class="animate-pulse flex justify-center">Loading...</div>
                        </td>
                    </tr>

                    <!-- Empty State -->
                    <tr v-else-if="data.length === 0" class="bg-background/50">
                        <td :colspan="columns.length" class="px-6 py-8 text-center text-text-secondary italic">
                            <slot name="empty">
                                {{ emptyMessage || 'No data available.' }}
                            </slot>
                        </td>
                    </tr>

                    <!-- Data Rows -->
                    <tr v-else v-for="(row, i) in data" :key="i" class="hover:bg-white/5 transition-colors">
                        <td v-for="col in columns" :key="col.key" class="px-6 py-4" :class="col.class">
                            <slot :name="col.key" :row="row" :index="i">
                                {{ row[col.key] }}
                            </slot>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>
