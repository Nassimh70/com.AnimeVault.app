<script setup>
import { AlertTriangle } from 'lucide-vue-next';
import BaseModal from './BaseModal.vue';
import BaseButton from './BaseButton.vue';

defineProps({
  open: { type: Boolean, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  confirmLabel: { type: String, default: 'Confirmer' },
  cancelLabel: { type: String, default: 'Annuler' },
  loading: { type: Boolean, default: false },
  tone: { type: String, default: 'danger' },
});

const emit = defineEmits(['confirm', 'cancel']);
</script>

<template>
  <BaseModal
    :open="open"
    :title="title"
    :description="message"
    size="sm"
    @close="emit('cancel')"
  >
    <div
      class="flex h-12 w-12 items-center justify-center rounded-2xl border"
      :class="
        tone === 'danger'
          ? 'border-rose/25 bg-rose/10 text-rose'
          : 'border-brass/25 bg-brass/10 text-brass'
      "
      aria-hidden="true"
    >
      <AlertTriangle :size="22" />
    </div>
    <template #footer>
      <BaseButton variant="ghost" :disabled="loading" @click="emit('cancel')">
        {{ cancelLabel }}
      </BaseButton>
      <BaseButton
        :variant="tone === 'danger' ? 'danger' : 'primary'"
        :loading="loading"
        @click="emit('confirm')"
      >
        {{ confirmLabel }}
      </BaseButton>
    </template>
  </BaseModal>
</template>
