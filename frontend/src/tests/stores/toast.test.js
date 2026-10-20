import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useToastStore } from '@/stores/toast';

beforeEach(() => {
  setActivePinia(createPinia());
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('store de notifications', () => {
  it('empile les notifications et les retire après le délai', () => {
    const toast = useToastStore();
    toast.success('Enregistré.');
    toast.error('Échec.');

    expect(toast.toasts.map((item) => item.tone)).toEqual(['success', 'error']);

    vi.advanceTimersByTime(4200);
    expect(toast.toasts).toHaveLength(0);
  });

  it('permet de fermer une notification manuellement', () => {
    const toast = useToastStore();
    const id = toast.push('info', 'Information', 10_000);

    toast.dismiss(id);
    expect(toast.toasts).toHaveLength(0);

    vi.advanceTimersByTime(10_000);
    expect(toast.toasts).toHaveLength(0);
  });
});
