<script setup>
import { computed } from 'vue';

const props = defineProps({
  modelValue: { type: [String, Number], required: true },
  options: { type: Array, required: true },
  label: { type: String, default: undefined },
  id: { type: String, default: undefined },
  disabled: { type: Boolean, default: false },
  placeholder: { type: String, default: undefined },
});

const emit = defineEmits(['update:modelValue']);
const selectId = computed(() => props.id ?? `select-${Math.random().toString(36).slice(2, 9)}`);

/**
 * @param {Event} event
 */
function onChange(event) {
  emit('update:modelValue', event.target.value);
}
</script>

<template>
  <div class="min-w-0">
    <label v-if="props.label" :for="selectId" class="field-label">{{ props.label }}</label>
    <select
      :id="selectId"
      class="select-base"
      :value="props.modelValue"
      :disabled="props.disabled"
      @change="onChange"
    >
      <option v-if="props.placeholder" value="">{{ props.placeholder }}</option>
      <option
        v-for="option in props.options"
        :key="option.value"
        :value="option.value"
        :disabled="option.disabled"
      >
        {{ option.label }}
      </option>
    </select>
  </div>
</template>
