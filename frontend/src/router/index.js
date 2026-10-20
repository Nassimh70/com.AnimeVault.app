import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    name: 'dashboard',
    component: () => import('@/views/DashboardView.vue'),
    meta: { title: 'Tableau de bord' },
  },
  {
    path: '/library',
    name: 'library',
    component: () => import('@/views/LibraryView.vue'),
    meta: { title: 'Bibliothèque' },
  },
  {
    path: '/list',
    redirect: (to) => ({ path: '/library', query: to.query }),
  },
  {
    path: '/favorites',
    name: 'favorites',
    component: () => import('@/views/FavoritesView.vue'),
    meta: { title: 'Favoris' },
  },
  {
    path: '/stats',
    name: 'stats',
    component: () => import('@/views/StatsView.vue'),
    meta: { title: 'Statistiques' },
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('@/views/SettingsView.vue'),
    meta: { title: 'Paramètres' },
  },
  {
    path: '/anime/new',
    name: 'anime-new',
    component: () => import('@/views/AnimeFormView.vue'),
    meta: { title: 'Ajouter un anime' },
  },
  {
    path: '/anime/:id',
    name: 'anime-detail',
    component: () => import('@/views/AnimeDetailView.vue'),
    meta: { title: 'Fiche anime' },
  },
  {
    path: '/anime/:id/edit',
    name: 'anime-edit',
    component: () => import('@/views/AnimeFormView.vue'),
    meta: { title: 'Modifier un anime' },
  },
  { path: '/add', redirect: '/anime/new' },
  { path: '/edit/:id', redirect: (to) => `/anime/${String(to.params.id)}/edit` },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
    meta: { title: 'Page introuvable' },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) return savedPosition;
    return { top: 0, behavior: 'smooth' };
  },
});

router.afterEach((to) => {
  const title = typeof to.meta.title === 'string' ? to.meta.title : 'Bibliothèque privée';
  document.title = `${title} · Anime Vault`;
});

export default router;
