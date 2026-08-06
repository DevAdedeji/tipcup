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
  primary: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm',
  accent: 'bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm',
  secondary: 'bg-secondary text-secondary-foreground border border-border hover:bg-surface-hover',
  outline: 'border border-border-strong bg-surface text-text-primary hover:bg-surface-hover',
  ghost: 'text-text-secondary hover:bg-surface-hover hover:text-text-primary',
  link: 'text-accent underline-offset-4 hover:underline p-0 h-auto',
  danger: 'bg-error text-error-foreground hover:bg-error/90 shadow-sm',
}

const sizes = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-5 text-md',
  xl: 'h-12 px-7 text-md',
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
    'inline-flex items-center justify-center gap-2 whitespace-nowrap select-none cursor-pointer rounded-md',
    'font-medium tracking-tight transition-all duration-200',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    'disabled:pointer-events-none disabled:opacity-45',
    props.variant !== 'link' && props.variant !== 'ghost' && 'active:translate-y-px',
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
