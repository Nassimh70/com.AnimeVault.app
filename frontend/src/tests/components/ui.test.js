import { describe, expect, it } from 'vitest';
import { mount, RouterLinkStub } from '@vue/test-utils';
import BaseButton from '@/components/ui/BaseButton.vue';
import StatusBadge from '@/components/ui/StatusBadge.vue';
import ProgressBar from '@/components/ui/ProgressBar.vue';

describe('BaseButton', () => {
  it('rend un bouton et transmet le clic', async () => {
    const wrapper = mount(BaseButton, { slots: { default: 'Enregistrer' } });
    expect(wrapper.element.tagName).toBe('BUTTON');
    expect(wrapper.text()).toContain('Enregistrer');

    await wrapper.trigger('click');
    expect(wrapper.emitted('click')).toHaveLength(1);
  });

  it('gère les états désactivé et chargement', () => {
    const disabled = mount(BaseButton, { props: { disabled: true }, slots: { default: 'Stop' } });
    expect(disabled.attributes('disabled')).toBeDefined();
    expect(disabled.attributes('aria-disabled')).toBe('true');

    const loading = mount(BaseButton, { props: { loading: true }, slots: { default: 'Patiente' } });
    expect(loading.attributes('disabled')).toBeDefined();
    expect(loading.attributes('aria-busy')).toBe('true');
  });

  it('rend un RouterLink quand une destination est fournie', () => {
    const wrapper = mount(BaseButton, {
      props: { to: '/library' },
      slots: { default: 'Bibliothèque' },
      global: { stubs: { RouterLink: RouterLinkStub } },
    });
    expect(wrapper.findComponent(RouterLinkStub).props('to')).toBe('/library');
  });

  it('rend un lien natif téléchargeable sans imbriquer de bouton', () => {
    const wrapper = mount(BaseButton, {
      props: { href: '/api/export/json', download: true, variant: 'secondary' },
      slots: { default: 'Exporter' },
    });
    expect(wrapper.element.tagName).toBe('A');
    expect(wrapper.attributes('href')).toBe('/api/export/json');
    expect(wrapper.attributes('download')).toBeDefined();
    expect(wrapper.find('button').exists()).toBe(false);
  });
});

describe('StatusBadge', () => {
  it('affiche le libellé français du statut', () => {
    const wrapper = mount(StatusBadge, { props: { status: 'termine', dot: true } });
    expect(wrapper.text()).toBe('Terminé');
    expect(wrapper.find('.rounded-full').exists()).toBe(true);
  });
});

describe('ProgressBar', () => {
  it('expose une barre accessible avec un pourcentage borné', () => {
    const wrapper = mount(ProgressBar, {
      props: { watched: 15, total: 13, label: 'Progression de test' },
    });
    const bar = wrapper.get('[role="progressbar"]');
    expect(bar.attributes('aria-valuenow')).toBe('100');
    expect(bar.attributes('aria-label')).toBe('Progression de test');
  });

  it('gère l’absence de total', () => {
    const wrapper = mount(ProgressBar, { props: { watched: 0, total: 0 } });
    expect(wrapper.get('[role="progressbar"]').attributes('aria-valuenow')).toBe('0');
  });
});
