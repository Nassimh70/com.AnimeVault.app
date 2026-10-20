<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue';
import { X } from 'lucide-vue-next';
import { useEventListener } from '@vueuse/core';

const props = defineProps({
  open: { type: Boolean, required: true },
  title: { type: String, required: true },
  description: { type: String, default: undefined },
  size: { type: String, default: 'md' },
});

const emit = defineEmits(['close']);

const panel = ref(null);
const titleId = `modal-title-${Math.random().toString(36).slice(2, 9)}`;
const descriptionId = `modal-desc-${Math.random().toString(36).slice(2, 9)}`;
let previousOverflow = '';

const width = computed(
  () =>
    ({
      sm: 'max-w-md',
      md: 'max-w-xl',
      lg: 'max-w-3xl',
    })[props.size]
);

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

watch(
  () => props.open,
  async (open) => {
    if (typeof document === 'undefined') return;
    if (open) {
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      await nextTick();
      panel.value?.focus();
    } else {
      document.body.style.overflow = previousOverflow;
    }
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  if (typeof document !== 'undefined') document.body.style.overflow = previousOverflow;
});

function close() {
  emit('close');
}

function onKeydown(event) {
  if (!props.open) return;
  if (event.key === 'Escape') {
    event.preventDefault();
    close();
    return;
  }
  if (event.key !== 'Tab' || !panel.value) return;
  const focusable = Array.from(panel.value.querySelectorAll(FOCUSABLE)).filter(
    (element) => element.offsetParent !== null
  );
  if (focusable.length === 0) {
    event.preventDefault();
    panel.value.focus();
    return;
  }
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

useEventListener(document, 'keydown', onKeydown);
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="props.open"
        class="fixed inset-0 z-[110] flex items-end justify-center bg-black/65 p-0 backdrop-blur-md sm:items-center sm:p-6"
        @click.self="close"
      >
        <div
          ref="panel"
          class="surface-panel relative max-h-[92vh] w-full overflow-y-auto rounded-b-none p-6 shadow-lift outline-none sm:rounded-4xl sm:p-7"
          :class="width"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="titleId"
          :aria-describedby="props.description ? descriptionId : undefined"
          tabindex="-1"
        >
          <button
            type="button"
            class="icon-button absolute right-4 top-4"
            aria-label="Fermer la fenêtre"
            @click="close"
          >
            <X :size="17" />
          </button>
          <div class="pr-10">
            <h2 :id="titleId" class="font-display text-2xl font-semibold text-ink">
              {{ props.title }}
            </h2>
            <p v-if="props.description" :id="descriptionId" class="muted-copy mt-1.5">
              {{ props.description }}
            </p>
          </div>
          <div class="mt-6">
            <slot />
          </div>
          <div v-if="$slots.footer" class="mt-6 flex flex-wrap justify-end gap-3">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.22s ease;
}
.modal-enter-active .surface-panel,
.modal-leave-active .surface-panel {
  transition: transform 0.28s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.22s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .surface-panel,
.modal-leave-to .surface-panel {
  transform: translateY(18px) scale(0.98);
  opacity: 0;
}
</style>
