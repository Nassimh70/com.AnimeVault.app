import { defineStore } from 'pinia';
import { ref } from 'vue';

let counter = 0;

export const useToastStore = defineStore('toast', () => {
  const toasts = ref([]);
  const timers = new Map();

  /**
   * @param {number} id
   */
  function dismiss(id) {
    toasts.value = toasts.value.filter((toast) => toast.id !== id);
    const timer = timers.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.delete(id);
    }
  }

  /**
   * @param {import('@/types/anime').ToastTone} tone
   * @param {string} message
   * @param {number} [duration]
   */
  function push(tone, message, duration = 4200) {
    counter += 1;
    const id = counter;
    toasts.value.push({ id, tone, message });
    const timer = setTimeout(() => dismiss(id), duration);
    timers.set(id, timer);
    return id;
  }

  /**
   * @param {string} message
   */
  const success = (message) => push('success', message);
  /**
   * @param {string} message
   */
  const error = (message) => push('error', message);
  /**
   * @param {string} message
   */
  const info = (message) => push('info', message);

  return { toasts, push, dismiss, success, error, info };
});
