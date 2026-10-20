import {
  Ban,
  BarChart3,
  CheckCircle2,
  Clock3,
  Compass,
  Heart,
  LibraryBig,
  Pause,
  PlayCircle,
  Settings,
  Sparkles,
} from 'lucide-vue-next';

/**
 * @typedef {{ value: import('@/types/anime').AnimeStatus, label: string, description: string, icon: import('lucide-vue-next').LucideIcon }} StatusOption
 */

/** @type {StatusOption[]} */
export const STATUS_OPTIONS = [
  { value: 'a_voir', label: 'À voir', description: 'En attente dans la pile', icon: Clock3 },
  { value: 'en_cours', label: 'En cours', description: 'Visionnage actif', icon: PlayCircle },
  { value: 'termine', label: 'Terminé', description: 'Vu jusqu’au bout', icon: CheckCircle2 },
  { value: 'pause', label: 'En pause', description: 'Mis de côté', icon: Pause },
  { value: 'abandonne', label: 'Abandonné', description: 'Arrêté définitivement', icon: Ban },
];

export const STATUS_LABELS = Object.fromEntries(
  STATUS_OPTIONS.map((option) => [option.value, option.label])
);

export const STATUS_DESCRIPTIONS = Object.fromEntries(
  STATUS_OPTIONS.map((option) => [option.value, option.description])
);

export const STATUS_COLORS = {
  a_voir: 'rgb(var(--color-status-a-voir))',
  en_cours: 'rgb(var(--color-status-en-cours))',
  termine: 'rgb(var(--color-status-termine))',
  pause: 'rgb(var(--color-status-pause))',
  abandonne: 'rgb(var(--color-status-abandonne))',
};

/** @type {{ value: import('@/types/anime').Priority, label: string, description: string }[]} */
export const PRIORITY_OPTIONS = [
  { value: 'haute', label: 'Haute', description: 'À regarder en priorité' },
  { value: 'moyenne', label: 'Moyenne', description: 'Rythme habituel' },
  { value: 'faible', label: 'Faible', description: 'Quand l’envie vient' },
];

export const PRIORITY_LABELS = {
  haute: 'Haute',
  moyenne: 'Moyenne',
  faible: 'Faible',
};

export const PRIORITY_COLORS = {
  haute: 'rgb(var(--color-priority-haute))',
  moyenne: 'rgb(var(--color-priority-moyenne))',
  faible: 'rgb(var(--color-priority-faible))',
};

/** @type {{ value: import('@/types/anime').Language, label: string }[]} */
export const LANGUAGE_OPTIONS = [
  { value: 'VOSTFR', label: 'VOSTFR' },
  { value: 'VF', label: 'VF' },
  { value: 'VO', label: 'VO' },
];

export const PLATFORM_OPTIONS = [
  'Crunchyroll',
  'Netflix',
  'ADN',
  'Disney+',
  'Prime Video',
  'YouTube',
  'Autre',
];

export const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Date d’ajout' },
  { value: 'updatedAt', label: 'Dernière modification' },
  { value: 'title', label: 'Titre' },
  { value: 'releaseDate', label: 'Date de sortie' },
  { value: 'episodesTotal', label: 'Nombre d’épisodes' },
  { value: 'rating', label: 'Note' },
  { value: 'priority', label: 'Priorité' },
];

export const NAV_ITEMS = [
  { to: '/', label: 'Tableau de bord', icon: LibraryBig, exact: true },
  { to: '/library', label: 'Bibliothèque', icon: Compass },
  { to: '/favorites', label: 'Favoris', icon: Heart },
  { to: '/stats', label: 'Statistiques', icon: BarChart3 },
  { to: '/settings', label: 'Paramètres', icon: Settings },
];

export const COLLECTION_LINKS = [
  { to: '/library?status=a_voir', label: 'À voir', icon: Clock3 },
  { to: '/library?status=en_cours', label: 'En cours', icon: PlayCircle },
  { to: '/library?status=termine', label: 'Terminés', icon: CheckCircle2 },
];

export const ACTION_LABELS = {
  ajout: 'Ajout',
  modification: 'Modification',
  progression: 'Progression',
  termine: 'Terminé',
  suppression: 'Suppression',
};

export const ACTION_ICONS = {
  ajout: Sparkles,
  modification: Settings,
  progression: PlayCircle,
  termine: CheckCircle2,
  suppression: Ban,
};
