<script setup>
import { CheckCircle2, Info, X, XCircle } from 'lucide-vue-next';
import { useToastStore } from '@/stores/toast';

const toastStore = useToastStore();

const icons = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

const tones = {
  success: 'text-jade',
  error: 'text-rose',
  info: 'text-brass',
};
</script>

<template>
  <Teleport to="body">
    <div
      class="pointer-events-none fixed inset-x-4 bottom-4 z-[130] flex flex-col items-end gap-2 sm:left-auto sm:right-6 sm:bottom-6 sm:w-[380px]"
      aria-live="polite"
      aria-atomic="false"
    >
      <TransitionGroup name="toast">
        <div
          v-for="toast in toastStore.toasts"
          :key="toast.id"
          class="surface-panel pointer-events-auto flex w-full items-start gap-3 rounded-3xl px-4 py-3.5 shadow-lift"
        >
          <component
            :is="icons[toast.tone]"
            :size="18"
            class="mt-0.5 shrink-0"
            :class="tones[toast.tone]"
            aria-hidden="true"
          />
          <p class="flex-1 text-sm leading-snug text-ink">{{ toast.message }}</p>
          <button
            type="button"
            class="rounded-full p-1 text-inkFaint transition hover:bg-surfaceMuted/70 hover:text-ink"
            aria-label="Fermer la notification"
            @click="toastStore.dismiss(toast.id)"
          >
            <X :size="14" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.25s ease, transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(24px) scale(0.97);
}
.toast-move {
  transition: transform 0.3s ease;
}
</style>
