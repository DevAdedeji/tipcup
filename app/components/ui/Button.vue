<script setup lang="ts">
import { computed, resolveComponent } from 'vue'
import { cn } from '~/utils/cn'
import { Loader2 } from 'lucide-vue-next'

interface Props {
  variant?: 'primary' | 'accent' | 'secondary' | 'outline' | 'ghost' | 'link' | 'danger'
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'icon' | 'icon-sm'
  loading?: boolean
  disabled?: boolean
  block?: boolean
  as?: string
  to?: string
  href?: string
  type?: 'button' | 'submit' | 'reset'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  loading: false,
  disabled: false,
  block: false,
  as: 'button',
})

const variants = {
  primary: 'bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground',
  accent: 'bg-accent text-accent-foreground hover:bg-accent/90',
  secondary: 'bg-secondary text-secondary-foreground border border-border hover:bg-surface-hover',
  outline: 'border border-border-strong bg-surface text-text-primary hover:bg-surface-hover',
  ghost: 'text-text-secondary hover:bg-surface-hover hover:text-text-primary',
  link: 'text-accent underline-offset-4 hover:underline p-0 h-auto normal-case tracking-normal',
  danger: 'bg-error text-error-foreground hover:bg-error/90',
}

const sizes = {
  sm: 'h-8 px-3 text-2xs',
  md: 'h-10 px-4 text-xs',
  lg: 'h-11 px-5 text-xs',
  xl: 'h-12 px-7 text-sm',
  icon: 'h-10 w-10',
  'icon-sm': 'h-8 w-8',
}

const componentType = computed(() => {
  if (props.to) return resolveComponent('NuxtLink')
  if (props.href) return 'a'
  return props.as
})

const classes = computed(() =>
  cn(
    'inline-flex items-center justify-center gap-2 whitespace-nowrap select-none cursor-pointer',
    'font-mono font-semibold uppercase tracking-label',
    ' transition-colors duration-150',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    'disabled:pointer-events-none disabled:opacity-40',
    variants[props.variant],
    sizes[props.size],
    props.block && 'w-full',
    props.loading && 'cursor-wait'
  )
)
</script>

<template>
  <component
    :is="componentType"
    :class="classes"
    :disabled="componentType === 'button' ? disabled || loading : undefined"
    :aria-busy="loading || undefined"
    :type="componentType === 'button' ? type || 'button' : undefined"
    :to="to"
    :href="href"
  >
    <Loader2 v-if="loading" class="h-4 w-4 shrink-0 animate-spin" />
    <slot v-if="!loading" name="prefix" />
    <slot />
    <slot v-if="!loading" name="suffix" />
  </component>
</template>
