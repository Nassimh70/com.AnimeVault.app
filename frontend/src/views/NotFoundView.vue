<script setup>
import { Compass, Home } from 'lucide-vue-next';
import BaseButton from '@/components/ui/BaseButton.vue';
</script>

<template>
  <div class="page-wrap flex min-h-[70vh] items-center justify-center">
    <div class="surface-panel w-full max-w-xl p-8 text-center sm:p-12">
      <span
        class="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-brass/25 bg-brass/10 text-brass"
        aria-hidden="true"
      >
        <Compass :size="26" />
      </span>
      <p class="eyebrow mt-6">Erreur 404</p>
      <h1 class="mt-2 font-display text-3xl font-semibold text-ink sm:text-4xl">
        Cette étagère n’existe pas.
      </h1>
      <p class="muted-copy mx-auto mt-3 max-w-sm">
        Le chemin demandé s’est peut-être perdu dans les rayons. Reviens au tableau de bord ou
        explore la bibliothèque.
      </p>
      <div class="mt-7 flex flex-wrap justify-center gap-2.5">
        <BaseButton to="/">
          <template #icon><Home :size="15" /></template>
          Tableau de bord
        </BaseButton>
        <BaseButton to="/library" variant="secondary">
          <template #icon><Compass :size="15" /></template>
          Bibliothèque
        </BaseButton>
      </div>
    </div>
  </div>
</template>
