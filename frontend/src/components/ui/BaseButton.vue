<script setup>
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import { Loader2 } from 'lucide-vue-next';
import { cn } from '@/utils/format';

const props = defineProps({
  variant: { type: String, default: 'primary' },
  size: { type: String, default: 'md' },
  type: { type: String, default: 'button' },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  block: { type: Boolean, default: false },
  to: { type: [String, Object], default: undefined },
  href: { type: String, default: undefined },
  download: { type: [Boolean, String], default: false },
  iconOnly: { type: Boolean, default: false },
  ariaLabel: { type: String, default: undefined },
});

const variants = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
  outline: 'btn-outline',
  danger: 'btn-danger',
};

const sizes = {
  sm: 'px-3 py-2 text-xs rounded-xl',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-5 py-3 text-sm',
};

const classes = computed(() =>
  cn(
    'btn-base',
    variants[props.variant],
    sizes[props.size],
    props.block && 'w-full',
    props.iconOnly && 'aspect-square p-0',
    props.loading && 'cursor-wait'
  )
);

const isDisabled = computed(() => props.disabled || props.loading);
const tag = computed(() => {
  if (isDisabled.value) return 'button';
  if (props.href) return 'a';
  if (props.to) return RouterLink;
  return 'button';
});
</script>

<template>
  <component
    :is="tag"
    :to="tag === RouterLink ? props.to : undefined"
    :href="tag === 'a' ? props.href : undefined"
    :download="tag === 'a' ? props.download : undefined"
    :type="tag === 'a' || props.to ? undefined : props.type"
    :disabled="tag === 'a' || props.to ? undefined : isDisabled"
    :aria-disabled="isDisabled || undefined"
    :aria-label="props.ariaLabel"
    :aria-busy="props.loading || undefined"
    :class="classes"
  >
    <Loader2 v-if="props.loading" :size="16" class="animate-spin" aria-hidden="true" />
    <slot v-else name="icon" />
    <slot />
  </component>
</template>
