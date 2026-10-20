import { afterEach, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import BaseModal from '@/components/ui/BaseModal.vue';
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue';
import { makeAnime } from '../fixtures/anime';
import HistoryTimeline from '@/components/anime/HistoryTimeline.vue';

const global = { stubs: { Teleport: true } };

afterEach(() => {
  document.body.style.overflow = '';
});

describe('BaseModal', () => {
  it('rend une boîte de dialogue accessible et ferme au clic', async () => {
    const wrapper = mount(BaseModal, {
      props: { open: true, title: 'Confirmation', description: 'Une description.' },
      slots: { default: '<p>Contenu</p>' },
      global,
    });

    const dialog = wrapper.get('[role="dialog"]');
    expect(dialog.attributes('aria-modal')).toBe('true');
    expect(dialog.attributes('aria-labelledby')).toBeTruthy();
    expect(dialog.attributes('aria-describedby')).toBeTruthy();
    expect(wrapper.text()).toContain('Confirmation');

    await wrapper.get('button[aria-label="Fermer la fenêtre"]').trigger('click');
    expect(wrapper.emitted('close')).toHaveLength(1);
  });

  it('ferme avec Échap et restaure le défilement', async () => {
    const wrapper = mount(BaseModal, {
      props: { open: true, title: 'Échap' },
      global,
    });
    await nextTick();
    expect(document.body.style.overflow).toBe('hidden');

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(wrapper.emitted('close')).toHaveLength(1);

    await wrapper.setProps({ open: false });
    await nextTick();
    expect(document.body.style.overflow).toBe('');
  });
});

describe('ConfirmDialog', () => {
  it('transmet confirmation et annulation', async () => {
    const wrapper = mount(ConfirmDialog, {
      props: {
        open: true,
        title: 'Supprimer cet anime ?',
        message: 'Action irréversible.',
        confirmLabel: 'Supprimer',
      },
      global,
    });

    await wrapper.get('button.btn-danger').trigger('click');
    expect(wrapper.emitted('confirm')).toHaveLength(1);

    const cancel = wrapper.findAll('button').find((button) => button.text() === 'Annuler');
    expect(cancel).toBeTruthy();
    await cancel?.trigger('click');
    expect(wrapper.emitted('cancel')).toHaveLength(1);
  });
});

describe('HistoryTimeline', () => {
  it('affiche une entrée et son action traduite', () => {
    const anime = makeAnime();
    const wrapper = mount(HistoryTimeline, {
      props: {
        entries: [
          {
            id: 'h1',
            animeId: anime.id,
            animeTitle: anime.title,
            action: 'progression',
            details: 'Épisode 6 vu',
            createdAt: new Date().toISOString(),
          },
        ],
      },
    });

    expect(wrapper.text()).toContain('Progression');
    expect(wrapper.text()).toContain('Épisode 6 vu');
    expect(wrapper.text()).toContain(anime.title);
  });

  it('affiche un état vide', () => {
    const wrapper = mount(HistoryTimeline, { props: { entries: [] } });
    expect(wrapper.text()).toContain('Aucune activité');
  });
});
